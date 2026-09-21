import type { TorrentFile, TorrentInfo, PeerInfo, FileInfo, ClientSettings, LibraryEntry, Attachment, SubtitleTrack } from 'native'
import type { DataSource } from './data-source'

export interface HostInfo {
  lanIp: string
  port: number
  companionUrl: string
  loginUrl: string
  extensionsUrl: string
  connectedClients: number
}

/**
 * Plan B implementation: Connects via WebSocket to a PC host running the Hayase desktop app.
 * Uses a JSON-RPC 2.0 style protocol for sending/receiving commands.
 */
export class WebSocketDataSource implements DataSource {
  private ws!: WebSocket
  private messageId = 0
  private pendingRequests = new Map<number, { resolve: (value: any) => void, reject: (reason?: any) => void, timer: number }>()
  private subscriptions = new Map<string, Function>()
  private eventListeners = new Map<string, Set<Function>>()
  private resolveReady!: () => void
  private rejectReady!: (reason?: any) => void
  public readonly ready: Promise<void>

  constructor(private hostUrl: string) {
    this.ready = new Promise((resolve, reject) => {
      this.resolveReady = resolve
      this.rejectReady = reject
    })
    this.connect()
  }

  public getHostUrl(): string {
    return this.hostUrl
  }

  public on(event: string, cb: Function): () => void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set())
    }
    this.eventListeners.get(event)!.add(cb)
    return () => this.off(event, cb)
  }

  public off(event: string, cb: Function) {
    this.eventListeners.get(event)?.delete(cb)
  }

  private connect() {
    this.ws = new WebSocket(this.hostUrl)

    this.ws.onopen = () => {
      console.log(`[Tizen-WS] Connected to host server at ${this.hostUrl}`)
      this.resolveReady()
    }

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)

        // Handle incoming notifications / events (data.method without data.id)
        if (data.method) {
          const params = data.params || []

          // 1. Subscription callbacks
          if (this.subscriptions.has(data.method)) {
            const cb = this.subscriptions.get(data.method)
            if (cb) cb(...params)
          }

          // 2. Custom event listeners
          if (this.eventListeners.has(data.method)) {
            for (const cb of this.eventListeners.get(data.method)!) {
              try {
                cb(...params)
              } catch (e) {
                console.error(`[Tizen-WS] Error in event listener for ${data.method}:`, e)
              }
            }
          }

          // 3. Dispatch to browser window for UI components
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('hayase-server-event', { detail: { method: data.method, params } }))
            if (data.method === 'auth.token' && params[0]) {
              console.log('[Tizen-WS] Received auth.token push notification')
              window.dispatchEvent(new CustomEvent('hayase-auth-token', { detail: params[0] }))
            }
            if (data.method === 'extension.install' && params[0]) {
              console.log('[Tizen-WS] Received extension.install push notification:', params[0])
              window.dispatchEvent(new CustomEvent('hayase-install-extension', { detail: { url: params[0] } }))
            }
          }
          return
        }

        // Handle RPC responses
        if (data.id !== undefined) {
          const req = this.pendingRequests.get(data.id)
          if (req) {
            clearTimeout(req.timer)
            this.pendingRequests.delete(data.id)
            if (data.error) {
              req.reject(new Error(data.error.message || 'RPC Error'))
            } else {
              req.resolve(data.result)
            }
          }
        }
      } catch (err) {
        console.error('[Tizen-WS] Failed to parse WS message', err)
      }
    }

    this.ws.onclose = () => {
      console.warn('[Tizen-WS] Disconnected from host server. Reconnecting in 3s...')
      setTimeout(() => this.connect(), 3000)
    }

    this.ws.onerror = (err) => {
      console.error('[Tizen-WS] WebSocket error:', err)
    }
  }

  private async request<T>(method: string, params: any[] = [], timeout?: number): Promise<T> {
    const effectiveTimeout = timeout ?? (method.toLowerCase().includes('torrent') || method === 'playTorrent' ? 60000 : 15000)

    if (this.ws && this.ws.readyState === WebSocket.CONNECTING) {
      try {
        await Promise.race([
          this.ready,
          new Promise((_, r) => setTimeout(() => r(new Error('WebSocket connection timed out')), 5000))
        ])
      } catch {}
    }

    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        return reject(new Error('WebSocket is not connected'))
      }

      const id = ++this.messageId
      const timer = window.setTimeout(() => {
        this.pendingRequests.delete(id)
        reject(new Error(`RPC request ${method} timed out`))
      }, effectiveTimeout)

      this.pendingRequests.set(id, { resolve, reject, timer })
      this.ws.send(JSON.stringify({ jsonrpc: '2.0', method, params, id }))
    })
  }

  private subscribe(method: string, params: any[], eventName: string, cb: Function): Promise<void> {
    this.subscriptions.set(eventName, cb)
    if (!this.eventListeners.has(eventName)) {
      this.eventListeners.set(eventName, new Set())
    }
    this.eventListeners.get(eventName)!.add(cb)
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return this.request<void>(method, params).catch(err => {
        console.warn(`[Tizen-WS] Failed to subscribe to ${method}:`, err?.message || err)
      })
    } else {
      this.ready.then(() => {
        this.request<void>(method, params).catch(err => {
          console.warn(`[Tizen-WS] Failed to subscribe to ${method}:`, err?.message || err)
        })
      }).catch(() => {})
      return Promise.resolve()
    }
  }

  private fixFileUrls(files: TorrentFile[]): TorrentFile[] {
    try {
      const parsedUrl = new URL(this.hostUrl)
      const host = parsedUrl.hostname
      if (host && host !== 'localhost' && host !== '127.0.0.1') {
        return files.map(file => {
          let url = file.url
          if (url) {
            url = url.replace(/^http:\/\/[^/:]+(:[0-9]+)/, `http://${host}$1`)
          }
          let lan = file.lan
          if (lan) {
            lan = lan.replace(/^http:\/\/[^/:]+(:[0-9]+)/, `http://${host}$1`)
          }
          return {
            ...file,
            url: url || file.url,
            lan: lan || file.lan
          }
        })
      }
    } catch {}
    return files
  }

  private fixAttachmentUrls(attachments: Attachment[]): Attachment[] {
    try {
      const parsedUrl = new URL(this.hostUrl)
      const host = parsedUrl.hostname
      if (host && host !== 'localhost' && host !== '127.0.0.1') {
        return attachments.map(att => {
          let url = att.url
          if (url) {
            url = url.replace(/^http:\/\/(localhost|127\.0\.0\.1)(:[0-9]+)/, `http://${host}$2`)
          }
          return {
            ...att,
            url
          }
        })
      }
    } catch {}
    return attachments
  }

  async getHostInfo(): Promise<HostInfo> {
    return this.request<HostInfo>('host.getInfo', [])
  }

  async addTorrent(id: string | ArrayBufferView, mediaID: number, episode: number, background: boolean): Promise<TorrentFile[]> {
    const files = await this.request<TorrentFile[]>('addTorrent', [id, mediaID, episode, background])
    return this.fixFileUrls(files)
  }

  async playTorrent(id: string | ArrayBufferView, mediaID: number, episode: number): Promise<TorrentFile[]> {
    const files = await this.request<TorrentFile[]>('playTorrent', [id, mediaID, episode])
    return this.fixFileUrls(files)
  }

  async torrentInfo(hash: string): Promise<TorrentInfo> {
    return this.request<TorrentInfo>('torrentInfo', [hash])
  }

  async peerInfo(hash: string): Promise<PeerInfo[]> {
    return this.request<PeerInfo[]>('peerInfo', [hash])
  }

  async fileInfo(hash: string): Promise<FileInfo[]> {
    return this.request<FileInfo[]>('fileInfo', [hash])
  }

  async trackers(hash: string): Promise<Record<string, { complete: number, downloaded: number, incomplete: number, failed: boolean }>> {
    return this.request<Record<string, { complete: number, downloaded: number, incomplete: number, failed: boolean }>>('trackers', [hash])
  }

  async protocolStatus(hash: string): Promise<{
    dht: boolean
    lsd: boolean
    pex: boolean
    nat: boolean
    forwarding: boolean
    persisting: boolean
    streaming: boolean
  }> {
    return this.request('protocolStatus', [hash])
  }

  async library(): Promise<LibraryEntry[]> {
    return this.request<LibraryEntry[]>('library', [])
  }

  async cachedTorrents(): Promise<string[]> {
    return this.request<string[]>('cachedTorrents', [])
  }

  async activeTorrents(): Promise<TorrentInfo[]> {
    return this.request<TorrentInfo[]>('activeTorrents', [])
  }

  async deleteTorrents(hashes: string[]): Promise<void> {
    return this.request<void>('deleteTorrents', [hashes])
  }

  async rescanTorrents(hashes: string[]): Promise<void> {
    return this.request<void>('rescanTorrents', [hashes])
  }

  async removeBackgroundTorrents(hashes: string[]): Promise<void> {
    return this.request<void>('removeBackgroundTorrents', [hashes])
  }

  async updateSettings(settings: ClientSettings): Promise<void> {
    return this.request<void>('updateSettings', [settings])
  }

  async checkAvailableSpace(): Promise<number> {
    return this.request<number>('checkAvailableSpace', [])
  }

  async checkIncomingConnections(port: number): Promise<boolean> {
    return this.request<boolean>('checkIncomingConnections', [port])
  }

  async updatePeerCounts(hashes: string[]): Promise<Array<{ hash: string, complete: string, downloaded: string, incomplete: string }>> {
    return this.request('updatePeerCounts', [hashes])
  }

  async attachments(hash: string, id: number): Promise<Attachment[]> {
    const atts = await this.request<Attachment[]>('attachments', [hash, id])
    return this.fixAttachmentUrls(atts)
  }

  async tracks(hash: string, id: number): Promise<SubtitleTrack[]> {
    return this.request<SubtitleTrack[]>('tracks', [hash, id])
  }

  async subtitles(hash: string, id: number, cb: (subtitle: { text: string, time: number, duration: number }, trackNumber: number) => void): Promise<void> {
    return this.subscribe('subtitles', [hash, id], `subtitles_${hash}_${id}`, cb)
  }

  async chapters(hash: string, id: number): Promise<Array<{ start: number, end: number, text: string }>> {
    return this.request('chapters', [hash, id])
  }

  async errors(cb: (error: Error) => void): Promise<void> {
    return this.subscribe('errors', [], 'errors', cb)
  }

  async createNZB(hash: string, url: string): Promise<void> {
    return this.request<void>('createNZB', [hash, url])
  }

  async createHTTPWebSeed(id: string, url: string, authorization?: string, fileIndex?: number, rateLimit?: number): Promise<void> {
    return this.request<void>('createHTTPWebSeed', [id, url, authorization, fileIndex, rateLimit])
  }

  async getDisplays(cb: (displays: Array<{ friendlyName: string, host: string }>) => void): Promise<void> {
    return this.subscribe('getDisplays', [], 'getDisplays', cb)
  }

  async castPlay(host: string, hash: string, id: number, media: any): Promise<void> {
    return this.request<void>('castPlay', [host, hash, id, media])
  }

  async castClose(host: string): Promise<void> {
    return this.request<void>('castClose', [host])
  }

  async debug(levels: string): Promise<void> {
    return this.request<void>('debug', [levels])
  }

  async cleanupStreamLeftovers(): Promise<void> {
    return this.request<void>('cleanupStreamLeftovers', [])
  }

  async destroy(): Promise<void> {
    this.ws.close()
  }
}
