import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import { createHash } from 'node:crypto'
import type { Socket } from 'node:net'
import type TorrentClient from 'torrent-client'

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

/**
 * Lightweight RFC 6455 WebSocket client wrapper using Node.js net.Socket.
 * Zero external dependencies.
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
      header[1] = length // unmasked
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
        // Close frame
        this.socket.end()
        this.onClose()
        return
      } else if (opcode === 0x9) {
        // Ping -> respond with Pong (0xA)
        const pong = Buffer.alloc(2)
        pong[0] = 0x8a
        pong[1] = 0
        this.socket.write(pong)
      } else if (opcode === 0x1) {
        // Text frame
        this.onMessage(payload.toString('utf8'))
      }
    }
  }
}

/**
 * Plan B: TV Host WebSocket server running in the Electron torrent process.
 * Listens on the specified port (default 9876) and exposes tclient via JSON-RPC 2.0.
 */
export function startTVServer(getTorrentClient: () => TorrentClient | undefined, port = 9876) {
  const server = createServer((req: IncomingMessage, res: ServerResponse) => {
    // Basic health check endpoint
    if (req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' })
      res.end(JSON.stringify({ status: 'ok', client: !!getTorrentClient() }))
      return
    }
    res.writeHead(404)
    res.end()
  })

  server.on('upgrade', (req: IncomingMessage, socket: Socket) => {
    const key = req.headers['sec-websocket-key']
    const upgrade = req.headers.upgrade

    if (!key || !upgrade || upgrade.toLowerCase() !== 'websocket') {
      socket.destroy()
      return
    }

    // Accept handshake
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
      msg => handleRPCMessage(client, msg, getTorrentClient),
      () => {
        // Client disconnected
      }
    )
  })

  server.listen(port, '0.0.0.0', () => {
    console.log(`[TV-Host] WebSocket server listening on 0.0.0.0:${port}`)
  })

  return server
}

async function handleRPCMessage(
  ws: WSConnection,
  raw: string,
  getTorrentClient: () => TorrentClient | undefined
) {
  let req: JSONRPCRequest
  try {
    req = JSON.parse(raw)
  } catch {
    ws.send(JSON.stringify({ jsonrpc: '2.0', error: { code: -32700, message: 'Parse error' } }))
    return
  }

  const { method, params = [], id } = req
  const tclient = getTorrentClient()

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
      case 'attachments':
        result = await tclient.attachments.attachments(params[0], params[1])
        break
      case 'tracks':
        result = await tclient.attachments.tracks(params[0], params[1])
        break
      case 'chapters':
        result = await tclient.attachments.chapters(params[0], params[1])
        break
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
        const [hash, trackId] = params
        const eventName = `subtitles_${hash}_${trackId}`
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
