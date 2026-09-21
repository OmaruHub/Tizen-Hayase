import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import { createHash } from 'node:crypto'
import type { Socket } from 'node:net'
import os from 'node:os'
import { join } from 'node:path'
import { existsSync, mkdirSync } from 'node:fs'

import TorrentClient from '../../../torrent-client/index.ts'
import type { ClientSettings } from 'native'

interface JSONRPCRequest {
  jsonrpc: '2.0'
  method: string
  params?: any[]
  id?: number
}

interface JSONRPCResponse {
  jsonrpc: '2.0'
  result?: any
  error?: { code: number; message: string }
  id?: number
}

interface JSONRPCNotification {
  jsonrpc: '2.0'
  method: string
  params?: any[]
}

const WS_GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11'
const DEFAULT_PORT = 9876

/**
 * Get the preferred LAN IPv4 address of this machine.
 */
export function getLocalIP(): string {
  const nets = os.networkInterfaces()
  const candidates: { address: string; priority: number }[] = []

  for (const name of Object.keys(nets)) {
    const isVirtual = /radmin|vpn|hamachi|virtual|vmware|tailscale|zerotier|docker|hyper-v/i.test(name)
    for (const net of nets[name] || []) {
      const familyV4 = typeof net.family === 'string' ? 'IPv4' : 4
      if (net.family === familyV4 && !net.internal) {
        let priority = 10
        if (net.address.startsWith('192.168.')) priority = 100
        else if (net.address.startsWith('10.')) priority = 90
        else if (net.address.startsWith('172.')) priority = 80
        if (isVirtual) priority -= 50
        candidates.push({ address: net.address, priority })
      }
    }
  }

  candidates.sort((a, b) => b.priority - a.priority)
  return candidates[0]?.address || '127.0.0.1'
}

/**
 * Lightweight RFC 6455 WebSocket client wrapper using Node.js net.Socket.
 */
class WSConnection {
  private buffer = Buffer.alloc(0)

  constructor(
    public socket: Socket,
    private onMessage: (msg: string) => void,
    private onClose: () => void
  ) {
    socket.on('data', (chunk: Buffer) => this.handleData(chunk))
    socket.on('close', () => this.onClose())
    socket.on('error', () => this.onClose())
  }

  send(data: string) {
    if (this.socket.destroyed) return
    const payload = Buffer.from(data, 'utf8')
    const length = payload.length

    let header: Buffer
    if (length <= 125) {
      header = Buffer.alloc(2)
      header[0] = 0x81 // FIN + text opcode
      header[1] = length
    } else if (length <= 65535) {
      header = Buffer.alloc(4)
      header[0] = 0x81
      header[1] = 126
      header.writeUInt16BE(length, 2)
    } else {
      header = Buffer.alloc(10)
      header[0] = 0x81
      header[1] = 127
      header.writeBigUInt64BE(BigInt(length), 2)
    }

    this.socket.write(Buffer.concat([header, payload]))
  }

  private handleData(chunk: Buffer) {
    this.buffer = Buffer.concat([this.buffer, chunk])

    while (this.buffer.length >= 2) {
      const firstByte = this.buffer[0]!
      const secondByte = this.buffer[1]!
      const opcode = firstByte & 0x0f
      const isMasked = (secondByte & 0x80) === 0x80
      let payloadLength = secondByte & 0x7f

      let offset = 2

      if (payloadLength === 126) {
        if (this.buffer.length < 4) return
        payloadLength = this.buffer.readUInt16BE(2)
        offset = 4
      } else if (payloadLength === 127) {
        if (this.buffer.length < 10) return
        payloadLength = Number(this.buffer.readBigUInt64BE(2))
        offset = 10
      }

      const maskLength = isMasked ? 4 : 0
      const totalLength = offset + maskLength + payloadLength

      if (this.buffer.length < totalLength) return // Wait for more data

      let mask: Buffer | null = null
      if (isMasked) {
        mask = this.buffer.subarray(offset, offset + 4)
        offset += 4
      }

      const payload = this.buffer.subarray(offset, offset + payloadLength)
      if (isMasked && mask) {
        for (let i = 0; i < payload.length; i++) {
          payload[i] ^= mask[i % 4]!
        }
      }

      this.buffer = this.buffer.subarray(totalLength)

      if (opcode === 0x8) {
        this.socket.end()
        this.onClose()
        return
      } else if (opcode === 0x9) {
        const pong = Buffer.alloc(2)
        pong[0] = 0x8a
        pong[1] = 0
        this.socket.write(pong)
      } else if (opcode === 0x1) {
        this.onMessage(payload.toString('utf8'))
      }
    }
  }
}

// Global state
let tclient: TorrentClient | undefined
const connectedClients = new Set<WSConnection>()

export function broadcastNotification(method: string, params: any[] = []) {
  const notification: JSONRPCNotification = {
    jsonrpc: '2.0',
    method,
    params
  }
  const raw = JSON.stringify(notification)
  for (const client of connectedClients) {
    try {
      client.send(raw)
    } catch (e) {
      console.error('[TV-Host] Failed to broadcast to client:', e)
    }
  }
}

function parseJsonBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', chunk => {
      body += chunk
      if (body.length > 1e6) {
        req.destroy()
        reject(new Error('Body too large'))
      }
    })
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {})
      } catch (err) {
        reject(err)
      }
    })
    req.on('error', reject)
  })
}

// Embedded Web Portal HTML Templates
function renderLoginHTML(lanIp: string, port: number): string {
  const companionOrigin = `http://${lanIp}:${port}`
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hayase TV Companion - AniList Sign In</title>
  <style>
    :root {
      --bg: #0b0e14;
      --card: #151922;
      --accent: #ff4081;
      --accent-hover: #f50057;
      --text: #ffffff;
      --text-muted: #8c9ba5;
      --border: #232a3b;
      --success: #00e676;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    body { background: var(--bg); color: var(--text); min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; }
    .card { background: var(--card); border: 1px solid var(--border); border-radius: 16px; padding: 32px; max-width: 460px; width: 100%; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
    .header { text-align: center; margin-bottom: 24px; }
    .title { font-size: 24px; font-weight: 700; margin-bottom: 8px; color: var(--text); }
    .subtitle { font-size: 14px; color: var(--text-muted); }
    .status-badge { display: inline-flex; align-items: center; gap: 8px; font-size: 13px; padding: 6px 14px; border-radius: 20px; background: rgba(255,255,255,0.05); border: 1px solid var(--border); margin-bottom: 24px; }
    .status-dot { width: 8px; height: 8px; border-radius: 50%; background: #ffd600; }
    .status-dot.active { background: var(--success); }
    .btn { display: flex; align-items: center; justify-content: center; width: 100%; padding: 14px 20px; border-radius: 10px; font-size: 15px; font-weight: 600; cursor: pointer; border: none; transition: 0.2s ease; text-decoration: none; text-align: center; }
    .btn-primary { background: var(--accent); color: white; margin-bottom: 20px; }
    .btn-primary:hover { background: var(--accent-hover); }
    .btn-secondary { background: rgba(255,255,255,0.08); color: var(--text); margin-top: 10px; }
    .btn-secondary:hover { background: rgba(255,255,255,0.15); }
    .divider { display: flex; align-items: center; gap: 12px; color: var(--text-muted); font-size: 12px; text-transform: uppercase; margin: 20px 0; }
    .divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: var(--border); }
    .input-group { margin-bottom: 12px; text-align: left; }
    .label { display: block; font-size: 12px; color: var(--text-muted); margin-bottom: 6px; font-weight: 500; }
    .input { width: 100%; padding: 12px 14px; border-radius: 8px; background: #0c0f17; border: 1px solid var(--border); color: white; font-size: 14px; outline: none; }
    .input:focus { border-color: var(--accent); }
    .message { display: none; margin-top: 20px; padding: 16px; border-radius: 10px; text-align: center; font-size: 14px; line-height: 1.5; }
    .message.success { display: block; background: rgba(0, 230, 118, 0.1); border: 1px solid var(--success); color: var(--success); }
    .message.error { display: block; background: rgba(255, 64, 129, 0.1); border: 1px solid var(--accent); color: var(--accent); }
    .message.info { display: block; background: rgba(33, 150, 243, 0.1); border: 1px solid #2196f3; color: #2196f3; }
    .nav-links { margin-top: 24px; text-align: center; font-size: 13px; }
    .nav-links a { color: var(--accent); text-decoration: none; margin: 0 10px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1 class="title">Hayase Companion</h1>
      <p class="subtitle">Sign in to AniList for your TV</p>
    </div>

    <div style="text-align: center;">
      <div class="status-badge" id="tv-status">
        <span class="status-dot" id="tv-dot"></span>
        <span id="tv-text">Checking TV connection...</span>
      </div>
    </div>

    <div id="auth-section">
      <a class="btn btn-primary" id="oauth-btn" href="https://anilist.co/api/v2/oauth/authorize?client_id=3461&response_type=token">
        🔑 1. Authorize with AniList
      </a>

      <div style="background: rgba(255,255,255,0.04); border: 1px solid var(--border); border-radius: 12px; padding: 16px; margin: 18px 0; text-align: left; font-size: 13px; line-height: 1.6;">
        <div style="font-weight: 700; color: #ff4081; margin-bottom: 6px;">👉 How to complete login:</div>
        <div><strong>1.</strong> Click <em>"Authorize with AniList"</em> above and log into your account.</div>
        <div><strong>2.</strong> On the black <em>"Redirecting..."</em> screen, <strong>copy the URL</strong> from your address bar.</div>
        <div><strong>3.</strong> Press your browser's <strong>Back button</strong> to return here.</div>
        <div><strong>4.</strong> Click the button below to send your login to the TV!</div>
      </div>

      <button class="btn" style="background: #00e676; color: #000; font-weight: 700; margin-bottom: 14px;" onclick="pasteFromClipboard()">
        📋 2. Paste Copied Link & Sign In to TV
      </button>

      <div class="divider">or paste URL manually below</div>

      <div class="input-group">
        <label class="label">Copied URL or Access Token</label>
        <input class="input" type="text" id="manual-token" placeholder="https://hayase.app/#/authorize?al&access_token=..." />
      </div>
      <button class="btn btn-secondary" onclick="submitManualToken()">🚀 Send to TV</button>
    </div>

    <div id="result-message" class="message"></div>

    <div class="nav-links">
      <a href="/extensions">📦 Install Extensions</a> •
      <a href="/">📊 Server Dashboard</a>
    </div>
  </div>

  <script>
    async function checkStatus() {
      try {
        const res = await fetch('/api/info');
        const data = await res.json();
        const dot = document.getElementById('tv-dot');
        const text = document.getElementById('tv-text');
        if (data.connectedTVs > 0) {
          dot.classList.add('active');
          text.textContent = \`\${data.connectedTVs} TV(s) Connected\`;
        } else {
          dot.classList.remove('active');
          text.textContent = 'Waiting for TV connection...';
        }
      } catch (e) {
        console.error(e);
      }
    }
    setInterval(checkStatus, 3000);
    checkStatus();

    async function sendTokenToTV(raw) {
      if (!raw) return;
      const match = raw.match(/access_token=([^&]+)/);
      const token = match ? decodeURIComponent(match[1]) : raw.trim();
      const typeMatch = raw.match(/token_type=([^&]+)/);
      const tokenType = typeMatch ? decodeURIComponent(typeMatch[1]) : 'Bearer';

      showMsg('Sending token to TV...', 'info');
      try {
        const res = await fetch('/api/auth/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ access_token: token, token_type: tokenType, expires_in: 31536000 })
        });
        const data = await res.json();
        if (data.ok) {
          showMsg('🎉 Token sent to TV successfully! Your TV is signed in now.', 'success');
        } else {
          showMsg('Failed to send token: ' + (data.error || 'Unknown error'), 'error');
        }
      } catch (err) {
        showMsg('Error sending token: ' + err.message, 'error');
      }
    }

    async function pasteFromClipboard() {
      try {
        const text = await navigator.clipboard.readText();
        if (text) {
          document.getElementById('manual-token').value = text;
          sendTokenToTV(text);
          return;
        }
      } catch (e) {
        console.warn('Clipboard read error', e);
      }
      showMsg('Please paste the URL manually into the box below and click Send to TV.', 'error');
    }

    async function submitManualToken() {
      const raw = document.getElementById('manual-token').value.trim();
      if (!raw) {
        showMsg('Please paste the URL or token first.', 'error');
        return;
      }
      sendTokenToTV(raw);
    }

    // Auto-detect if user switches back with token in clipboard
    window.addEventListener('focus', async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (text && text.includes('access_token=') && !document.getElementById('manual-token').value) {
          document.getElementById('manual-token').value = text;
          showMsg('Detected copied AniList URL! Click "Send to TV" or "Paste Copied Link" above.', 'info');
        }
      } catch {}
    });

    // Check if AniList redirected back directly with #access_token=...
    async function handleHashAuth() {
      const hash = window.location.hash || window.location.search;
      if (hash && hash.includes('access_token=')) {
        sendTokenToTV(hash);
      }
    }
    function showMsg(text, type) {
      const el = document.getElementById('result-message');
      if (!el) return;
      el.className = 'message ' + type;
      el.innerHTML = text;
      el.style.display = 'block';
    }

    handleHashAuth();
  </script>
</body>
</html>`
}

function renderExtensionsHTML(lanIp: string, port: number): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hayase TV Companion - Extensions</title>
  <style>
    :root {
      --bg: #0b0e14;
      --card: #151922;
      --accent: #ff4081;
      --accent-hover: #f50057;
      --text: #ffffff;
      --text-muted: #8c9ba5;
      --border: #232a3b;
      --success: #00e676;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    body { background: var(--bg); color: var(--text); min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; }
    .card { background: var(--card); border: 1px solid var(--border); border-radius: 16px; padding: 32px; max-width: 520px; width: 100%; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
    .header { text-align: center; margin-bottom: 24px; }
    .title { font-size: 24px; font-weight: 700; margin-bottom: 8px; }
    .subtitle { font-size: 14px; color: var(--text-muted); }
    .status-badge { display: inline-flex; align-items: center; gap: 8px; font-size: 13px; padding: 6px 14px; border-radius: 20px; background: rgba(255,255,255,0.05); border: 1px solid var(--border); margin-bottom: 20px; }
    .status-dot { width: 8px; height: 8px; border-radius: 50%; background: #ffd600; }
    .status-dot.active { background: var(--success); }
    .input-group { margin-bottom: 16px; text-align: left; }
    .label { display: block; font-size: 13px; color: var(--text-muted); margin-bottom: 8px; font-weight: 500; }
    .input { width: 100%; padding: 12px 14px; border-radius: 8px; background: #0c0f17; border: 1px solid var(--border); color: white; font-size: 14px; outline: none; }
    .input:focus { border-color: var(--accent); }
    .btn { display: flex; align-items: center; justify-content: center; width: 100%; padding: 14px 20px; border-radius: 10px; font-size: 15px; font-weight: 600; cursor: pointer; border: none; transition: 0.2s ease; }
    .btn-primary { background: var(--accent); color: white; }
    .btn-primary:hover { background: var(--accent-hover); }
    .section-title { font-size: 15px; font-weight: 600; margin: 24px 0 12px 0; color: var(--text); }
    .presets-grid { display: flex; flex-direction: column; gap: 10px; }
    .preset-item { display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: 10px; padding: 12px 16px; }
    .preset-info h4 { font-size: 14px; font-weight: 600; margin-bottom: 4px; }
    .preset-info p { font-size: 12px; color: var(--text-muted); }
    .btn-install-preset { background: rgba(255, 64, 129, 0.15); color: var(--accent); border: 1px solid var(--accent); border-radius: 8px; padding: 6px 14px; font-size: 13px; font-weight: 600; cursor: pointer; }
    .btn-install-preset:hover { background: var(--accent); color: white; }
    .message { display: none; margin-top: 16px; padding: 14px; border-radius: 10px; text-align: center; font-size: 14px; }
    .message.success { display: block; background: rgba(0, 230, 118, 0.1); border: 1px solid var(--success); color: var(--success); }
    .message.error { display: block; background: rgba(255, 64, 129, 0.1); border: 1px solid var(--accent); color: var(--accent); }
    .nav-links { margin-top: 24px; text-align: center; font-size: 13px; }
    .nav-links a { color: var(--accent); text-decoration: none; margin: 0 10px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1 class="title">Extension Companion</h1>
      <p class="subtitle">Install extension repositories directly onto your TV</p>
    </div>

    <div style="text-align: center;">
      <div class="status-badge">
        <span class="status-dot" id="tv-dot"></span>
        <span id="tv-text">Checking TV connection...</span>
      </div>
    </div>

    <div class="input-group">
      <label class="label">Repository Manifest URL (e.g. https://.../manifest.json)</label>
      <input class="input" type="text" id="repo-url" placeholder="https://example.com/manifest.json" />
    </div>

    <button class="btn btn-primary" onclick="installRepo()" style="margin-bottom: 12px;">🚀 Install on TV</button>

    <button class="btn" style="background: #00e676; color: #000; font-weight: 700; margin-bottom: 14px;" onclick="pasteExtensionUrl()">
      📋 Paste from Clipboard & Install
    </button>

    <div class="section-title">Popular Extension Repositories</div>
    <div class="presets-grid">
      <div class="preset-item">
        <div class="preset-info">
          <h4>Anitorrent (Nyaa & AnimeTosho)</h4>
          <p>Direct torrent indexers for anime releases</p>
        </div>
        <button class="btn-install-preset" onclick="installPreset('https://raw.githubusercontent.com/anh9000/anitorrent/main/hayase/index.json')">
          Install on TV
        </button>
      </div>
    </div>

    <div id="result-message" class="message"></div>

    <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: 12px; padding: 18px; margin-top: 24px; text-align: left; font-size: 13px; line-height: 1.6;">
      <h4 style="color: #ff4081; margin-bottom: 8px; font-size: 14px;">ℹ️ About Hayase Extensions</h4>
      <p style="color: var(--text-muted); margin-bottom: 8px;">
        Extensions are user-provided manifests that connect Hayase to torrent indexers and metadata providers.
      </p>
      <p style="color: var(--text-muted);">
        Paste any direct JSON manifest URL (or GitHub raw URL) above. The host server pushes it over the local network and your TV imports the sources immediately.
      </p>
    </div>

    <div class="nav-links">
      <a href="/login">🔑 AniList Sign In</a> •
      <a href="/">📊 Server Dashboard</a>
    </div>
  </div>

  <script>
    async function checkStatus() {
      try {
        const res = await fetch('/api/info');
        const data = await res.json();
        const dot = document.getElementById('tv-dot');
        const text = document.getElementById('tv-text');
        if (data.connectedTVs > 0) {
          dot.classList.add('active');
          text.textContent = \`\${data.connectedTVs} TV(s) Connected\`;
        } else {
          dot.classList.remove('active');
          text.textContent = 'Waiting for TV connection...';
        }
      } catch (e) {
        console.error(e);
      }
    }
    setInterval(checkStatus, 3000);
    checkStatus();

    async function sendInstall(url) {
      if (!url) return;
      showMsg('Sending install command to TV...', 'info');
      try {
        const res = await fetch('/api/extension/install', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url })
        });
        const data = await res.json();
        if (data.ok) {
          showMsg(\`🎉 Sent "\${url}" to your TV! Your TV is importing the repository now.\`, 'success');
        } else {
          showMsg('Failed to send to TV: ' + (data.error || 'Unknown error'), 'error');
        }
      } catch (err) {
        showMsg('Error sending to TV: ' + err.message, 'error');
      }
    }

    function installRepo() {
      const url = document.getElementById('repo-url').value.trim();
      if (!url) {
        showMsg('Please enter a repository URL or GitHub reference', 'error');
        return;
      }
      sendInstall(url);
    }

    async function pasteExtensionUrl() {
      try {
        const text = await navigator.clipboard.readText();
        if (text && text.trim()) {
          document.getElementById('repo-url').value = text.trim();
          sendInstall(text.trim());
          return;
        }
      } catch (e) {
        console.warn('Clipboard read error', e);
      }
      showMsg('Please paste the manifest URL into the box above and click Install.', 'error');
    }

    function installPreset(url) {
      sendInstall(url);
    }

    function showMsg(text, type) {
      const el = document.getElementById('result-message');
      el.className = 'message ' + type;
      el.innerHTML = text;
      el.style.display = 'block';
    }
  </script>
</body>
</html>`
}

function renderDashboardHTML(lanIp: string, port: number): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hayase TV Host Server</title>
  <style>
    :root {
      --bg: #0b0e14;
      --card: #151922;
      --accent: #ff4081;
      --text: #ffffff;
      --text-muted: #8c9ba5;
      --border: #232a3b;
      --success: #00e676;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    body { background: var(--bg); color: var(--text); min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; }
    .card { background: var(--card); border: 1px solid var(--border); border-radius: 16px; padding: 32px; max-width: 500px; width: 100%; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
    .header { text-align: center; margin-bottom: 24px; }
    .title { font-size: 26px; font-weight: 700; margin-bottom: 8px; }
    .subtitle { font-size: 14px; color: var(--text-muted); }
    .stat-box { display: flex; justify-content: space-between; align-items: center; padding: 14px 18px; background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: 10px; margin-bottom: 12px; }
    .stat-label { font-size: 14px; color: var(--text-muted); }
    .stat-val { font-size: 15px; font-weight: 600; color: var(--text); }
    .status-active { color: var(--success); font-weight: 700; }
    .actions { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 24px; }
    .action-btn { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 16px; background: rgba(255, 64, 129, 0.1); border: 1px solid var(--accent); border-radius: 12px; text-decoration: none; color: white; font-weight: 600; font-size: 14px; transition: 0.2s; text-align: center; gap: 8px; }
    .action-btn:hover { background: var(--accent); }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1 class="title">Hayase TV Host Server</h1>
      <p class="subtitle">Torrent Client & Smart TV Companion</p>
    </div>

    <div class="stat-box">
      <span class="stat-label">Torrent Engine</span>
      <span class="stat-val status-active">● Active (WebTorrent)</span>
    </div>

    <div class="stat-box">
      <span class="stat-label">Server LAN Address</span>
      <span class="stat-val">${lanIp}:${port}</span>
    </div>

    <div class="stat-box">
      <span class="stat-label">Connected TV App(s)</span>
      <span class="stat-val" id="client-count">${connectedClients.size}</span>
    </div>

    <div class="actions">
      <a class="action-btn" href="/login">
        <span style="font-size: 24px;">🔑</span>
        <span>AniList Login</span>
      </a>
      <a class="action-btn" href="/extensions">
        <span style="font-size: 24px;">📦</span>
        <span>Install Extensions</span>
      </a>
    </div>
  </div>

  <script>
    setInterval(async () => {
      try {
        const res = await fetch('/api/info');
        const data = await res.json();
        document.getElementById('client-count').textContent = data.connectedTVs;
      } catch (e) {}
    }, 3000);
  </script>
</body>
</html>`
}

/**
 * Handle RPC Messages from TV WebSocket client
 */
async function handleRPCMessage(
  ws: WSConnection,
  raw: string
) {
  let req: JSONRPCRequest
  try {
    req = JSON.parse(raw)
  } catch {
    ws.send(JSON.stringify({ jsonrpc: '2.0', error: { code: -32700, message: 'Parse error' } }))
    return
  }

  const { method, params = [], id } = req

  // Custom host queries (don't require tclient)
  if (method === 'host.getInfo') {
    const lanIp = getLocalIP()
    const result = {
      lanIp,
      port: DEFAULT_PORT,
      companionUrl: `http://${lanIp}:${DEFAULT_PORT}`,
      loginUrl: `http://${lanIp}:${DEFAULT_PORT}/login`,
      extensionsUrl: `http://${lanIp}:${DEFAULT_PORT}/extensions`,
      connectedClients: connectedClients.size
    }
    if (id !== undefined) {
      ws.send(JSON.stringify({ jsonrpc: '2.0', result, id }))
    }
    return
  }

  if (method === 'tv.eval') {
    const msg = JSON.stringify({ jsonrpc: '2.0', method: 'tv.eval', params })
    for (const client of connectedClients) {
      if (client !== ws) {
        client.send(msg)
      }
    }
    return
  }

  if (method === 'remoteLog') {
    console.log(`[TV-RemoteLog] ${params.join(' ')}`)
    const msg = JSON.stringify({ jsonrpc: '2.0', method: 'remoteLog', params })
    for (const client of connectedClients) {
      if (client !== ws) {
        client.send(msg)
      }
    }
    if (id !== undefined) {
      ws.send(JSON.stringify({ jsonrpc: '2.0', result: true, id }))
    }
    return
  }

  if (!tclient) {
    if (id !== undefined) {
      ws.send(JSON.stringify({ jsonrpc: '2.0', error: { code: -32000, message: 'Torrent client not initialized' }, id }))
    }
    return
  }

  try {
    let result: any

    switch (method) {
      case 'playTorrent':
      case 'addTorrent': {
        const [torrentId, mediaID, episode, background] = params
        result = await tclient.playTorrent(torrentId, mediaID, episode, 'tv-session', background)
        const lanIp = getLocalIP()
        if (Array.isArray(result)) {
          result = result.map(file => {
            if (file && typeof file === 'object') {
              const url = file.url ? file.url.replace(/^http:\/\/[^/:]+(:[0-9]+)/, `http://${lanIp}$1`) : file.url
              const lan = file.lan ? file.lan.replace(/^http:\/\/[^/:]+(:[0-9]+)/, `http://${lanIp}$1`) : url
              return { ...file, url, lan }
            }
            return file
          })
        }
        break
      }
      case 'torrentInfo':
        result = await tclient.torrentInfo(params[0])
        break
      case 'peerInfo':
        result = await tclient.peerInfo(params[0])
        break
      case 'fileInfo':
        result = await tclient.fileInfo(params[0])
        break
      case 'trackers':
        result = await tclient.trackers(params[0])
        break
      case 'protocolStatus':
        result = await tclient.protocolStatus(params[0])
        break
      case 'library':
        result = await tclient.library()
        break
      case 'cachedTorrents':
        result = await tclient.cached()
        break
      case 'activeTorrents':
        result = await tclient.activeTorrents()
        break
      case 'deleteTorrents':
        result = await tclient.deleteTorrents(params[0])
        break
      case 'cleanupStreamLeftovers':
      case 'stopPlayback':
        if (tclient && typeof (tclient as any).cleanupStreamLeftovers === 'function') {
          console.log('[TV-Host] Received request to clean up stream leftovers...')
          await (tclient as any).cleanupStreamLeftovers()
        }
        result = true
        break
      case 'rescanTorrents':
        result = await tclient.rescanTorrents(params[0])
        break
      case 'removeBackgroundTorrents':
        result = await tclient.removeBackgroundTorrents(params[0])
        break
      case 'updateSettings':
        result = tclient.updateSettings(params[0])
        break
      case 'checkAvailableSpace':
        result = await tclient.checkAvailableSpace()
        break
      case 'checkIncomingConnections':
        result = await tclient.checkIncomingConnections(params[0])
        break
      case 'updatePeerCounts':
        result = await tclient.scrape(params[0])
        break
      case 'attachments': {
        const hash = String(params[0]).toLowerCase()
        const id = Number(params[1])
        const t = (tclient as any).torrentState?.get(hash)?.torrent
        if (t) tclient.attachments.register(t)
        result = await tclient.attachments.attachments(hash, id)
        break
      }
      case 'tracks': {
        const hash = String(params[0]).toLowerCase()
        const id = Number(params[1])
        const t = (tclient as any).torrentState?.get(hash)?.torrent
        if (t) tclient.attachments.register(t)
        result = await tclient.attachments.tracks(hash, id)
        break
      }
      case 'chapters': {
        const hash = String(params[0]).toLowerCase()
        const id = Number(params[1])
        const t = (tclient as any).torrentState?.get(hash)?.torrent
        if (t) tclient.attachments.register(t)
        result = await tclient.attachments.chapters(hash, id)
        break
      }
      case 'createNZB':
        result = await tclient.createNZBWebSeed(params[0], params[1])
        break
      case 'createHTTPWebSeed':
        result = await tclient.createHTTPWebSeed(params[0], params[1], params[2], params[3], params[4])
        break
      case 'castPlay':
        result = await tclient.playDisplay(params[0], params[1], params[2], params[3])
        break
      case 'castClose':
        result = await tclient.closeDisplay(params[0])
        break
      case 'debug':
        result = await tclient.debug(params[0])
        break

      // Subscriptions
      case 'subtitles': {
        const hash = String(params[0]).toLowerCase()
        const trackId = Number(params[1])
        const t = (tclient as any).torrentState?.get(hash)?.torrent
        if (t) tclient.attachments.register(t)
        const eventName = `subtitles_${params[0]}_${params[1]}`
        await tclient.attachments.subtitle(hash, trackId, (subtitle: any, trackNumber: number) => {
          const notification: JSONRPCNotification = {
            jsonrpc: '2.0',
            method: eventName,
            params: [subtitle, trackNumber]
          }
          ws.send(JSON.stringify(notification))
        })
        result = null
        break
      }
      case 'errors': {
        tclient.errors((err: Error) => {
          const notification: JSONRPCNotification = {
            jsonrpc: '2.0',
            method: 'errors',
            params: [{ message: err.message, name: err.name }]
          }
          ws.send(JSON.stringify(notification))
        })
        result = null
        break
      }
      case 'getDisplays': {
        tclient.listenDisplay((displays: any) => {
          const notification: JSONRPCNotification = {
            jsonrpc: '2.0',
            method: 'getDisplays',
            params: [displays]
          }
          ws.send(JSON.stringify(notification))
        })
        result = null
        break
      }

      default:
        ws.send(JSON.stringify({ jsonrpc: '2.0', error: { code: -32601, message: `Method '${method}' not found` }, id }))
        return
    }

    if (id !== undefined) {
      const response: JSONRPCResponse = { jsonrpc: '2.0', result, id }
      ws.send(JSON.stringify(response))
    }
  } catch (err: any) {
    if (id !== undefined) {
      const response: JSONRPCResponse = {
        jsonrpc: '2.0',
        error: { code: -32000, message: err?.message || String(err) },
        id
      }
      ws.send(JSON.stringify(response))
    }
  }
}

/**
 * Start the standalone Hayase Host Server.
 */
export function startHostServer(port = DEFAULT_PORT) {
  // 1. Initialize Torrent Client
  const tmpDir = join(os.tmpdir(), 'webtorrent')
  const downloadDir = join(os.homedir(), 'Downloads', 'Hayase')
  if (!existsSync(tmpDir)) mkdirSync(tmpDir, { recursive: true })
  if (!existsSync(downloadDir)) mkdirSync(downloadDir, { recursive: true })

  const defaultSettings: ClientSettings & { path: string } = {
    path: downloadDir,
    torrentPersist: false,
    torrentDHT: false,
    torrentStreamedDownload: true,
    torrentSpeed: 40,
    maxConns: 50,
    torrentPort: 0,
    dhtPort: 0,
    torrentPeX: false,
    nzbDomain: '',
    nzbLogin: '',
    nzbPassword: '',
    nzbPort: 0,
    nzbPoolSize: 0
  }

  console.log('[TV-Host] Initializing WebTorrent engine...')
  tclient = new TorrentClient(defaultSettings, tmpDir)

  if (!defaultSettings.torrentPersist && typeof (tclient as any).cleanupStreamLeftovers === 'function') {
    console.log('[TV-Host] Checking and cleaning stream leftovers from previous sessions...')
    ;(tclient as any).cleanupStreamLeftovers().catch((e: any) => {
      console.warn('[TV-Host] Initial cleanupStreamLeftovers error:', e?.message)
    })
  }

  const lanIp = getLocalIP()

  // 2. Create HTTP & WebSocket Server
  const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
    // CORS headers for companion and TV API calls
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

    if (req.method === 'OPTIONS') {
      res.writeHead(204)
      res.end()
      return
    }

    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`)

    // REST API endpoints
    if (url.pathname === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ status: 'ok', client: !!tclient, connectedTVs: connectedClients.size, lanIp }))
      return
    }

    if (url.pathname === '/api/info') {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({
        lanIp,
        port,
        companionUrl: `http://${lanIp}:${port}`,
        loginUrl: `http://${lanIp}:${port}/login`,
        extensionsUrl: `http://${lanIp}:${port}/extensions`,
        connectedTVs: connectedClients.size
      }))
      return
    }

    if (url.pathname === '/api/auth/token' && req.method === 'POST') {
      try {
        const body = await parseJsonBody(req)
        const token = body.access_token || body.token
        if (!token) {
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ ok: false, error: 'Missing access_token' }))
          return
        }

        const normalizedPayload = {
          access_token: token,
          token_type: body.token_type || body.type || 'Bearer',
          expires_in: body.expires_in || body.expiresIn || 31536000
        }

        console.log('[TV-Host] Received AniList auth token from companion. Broadcasting to TV...')
        broadcastNotification('auth.token', [normalizedPayload])

        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ ok: true, message: 'Token pushed to TV successfully' }))
      } catch (err: any) {
        res.writeHead(500, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ ok: false, error: err.message }))
      }
      return
    }

    if (url.pathname === '/api/extension/install' && req.method === 'POST') {
      try {
        const body = await parseJsonBody(req)
        if (!body.url) {
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ ok: false, error: 'Missing url' }))
          return
        }

        console.log(`[TV-Host] Received extension repo install request from companion: ${body.url}. Broadcasting to TV...`)
        broadcastNotification('extension.install', [body.url])

        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ ok: true, message: 'Extension install command sent to TV' }))
      } catch (err: any) {
        res.writeHead(500, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ ok: false, error: err.message }))
      }
      return
    }

    if (url.pathname === '/api/eval' && req.method === 'POST') {
      try {
        const body = await parseJsonBody(req)
        if (!body.code) {
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ ok: false, error: 'Missing code' }))
          return
        }
        console.log(`[TV-Host] Received eval request: ${body.code}`)
        broadcastNotification('tv.eval', [body.code])
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ ok: true, message: 'Eval broadcasted to TV' }))
      } catch (err: any) {
        res.writeHead(500, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ ok: false, error: err.message }))
      }
      return
    }

    // Web Portal UI Pages
    if (url.pathname === '/login') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
      res.end(renderLoginHTML(lanIp, port))
      return
    }

    if (url.pathname === '/extensions') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
      res.end(renderExtensionsHTML(lanIp, port))
      return
    }

    if (url.pathname === '/' || url.pathname === '/dashboard') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
      res.end(renderDashboardHTML(lanIp, port))
      return
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' })
    res.end('Not Found')
  })

  // WebSocket Upgrade Handling
  server.on('upgrade', (req: IncomingMessage, socket: Socket) => {
    const key = req.headers['sec-websocket-key']
    const upgrade = req.headers.upgrade

    if (!key || !upgrade || upgrade.toLowerCase() !== 'websocket') {
      socket.destroy()
      return
    }

    const acceptKey = createHash('sha1')
      .update(key + WS_GUID)
      .digest('base64')

    const responseHeaders = [
      'HTTP/1.1 101 Switching Protocols',
      'Upgrade: websocket',
      'Connection: Upgrade',
      `Sec-WebSocket-Accept: ${acceptKey}`,
      '\r\n'
    ]

    socket.write(responseHeaders.join('\r\n'))

    const client = new WSConnection(
      socket,
      msg => handleRPCMessage(client, msg),
      () => {
        connectedClients.delete(client)
        console.log(`[TV-Host] TV/Client disconnected (remaining: ${connectedClients.size})`)
      }
    )

    connectedClients.add(client)
    console.log(`[TV-Host] 📺 TV/Client connected (total: ${connectedClients.size})`)
  })

  server.listen(port, '0.0.0.0', () => {
    console.log('\n======================================================')
    console.log(`🚀 Hayase TV Host Server is running!`)
    console.log(`📡 WebSocket JSON-RPC : ws://0.0.0.0:${port}`)
    console.log(`🌐 Local Simulator   : http://localhost:${port}`)
    console.log(`📱 Phone / Smart TV   : http://${lanIp}:${port}`)
    console.log(`🔑 AniList Login      : http://${lanIp}:${port}/login`)
    console.log(`📦 Extension Portal   : http://${lanIp}:${port}/extensions`)
    console.log('======================================================\n')
  })

  return server
}

// Direct execution when run via `tsx src/server/host-server.ts` or `npm run host`
const isDirectRun = process.argv.some(arg => arg.includes('host-server')) || (process.argv[1] && process.argv[1].endsWith('host-server.ts'))
if (isDirectRun || !process.env.TEST_ENV) {
  startHostServer(DEFAULT_PORT)
}
