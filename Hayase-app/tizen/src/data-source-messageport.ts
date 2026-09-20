import type { TorrentFile, TorrentInfo, PeerInfo, FileInfo, ClientSettings, LibraryEntry, Attachment, SubtitleTrack } from 'native'
import type { DataSource } from './data-source'

/**
 * Plan A implementation (Stub): Intended for future Tizen Native Service IPC.
 * Communicates with a background C/C++ service using MessagePort.
 */
export class MessagePortDataSource implements DataSource {
  private localPort: any
  private remotePort: any
  private messageId = 0
  private pendingRequests = new Map<number, { resolve: (value: any) => void, reject: (reason?: any) => void, timer: number }>()
  private subscriptions = new Map<string, Function>()
  public readonly ready: Promise<void>

  constructor(private serviceAppId: string, private portName: string) {
    this.ready = new Promise((resolve, reject) => {
      try {
        this.localPort = tizen.messageport.requestLocalMessagePort(this.portName + '_local')
        this.remotePort = tizen.messageport.requestRemoteMessagePort(this.serviceAppId, this.portName)

        this.localPort.addMessagePortListener((data: Array<{ key: string, value: string }>) => {
          this.handleMessage(data)
        })

        resolve()
      } catch (err) {
        reject(err)
      }
    })
  }

  private handleMessage(data: Array<{ key: string, value: string }>) {
    try {
      let jsonStr = ''
      for (const item of data) {
        if (item.key === 'payload') {
          jsonStr = item.value
          break
        }
      }

      if (!jsonStr) return

      const parsed = JSON.parse(jsonStr)

      // Handle incoming events for subscriptions
      if (parsed.method && this.subscriptions.has(parsed.method)) {
        const cb = this.subscriptions.get(parsed.method)
        if (cb) cb(...(parsed.params || []))
        return
      }

      // Handle RPC responses
      if (parsed.id !== undefined) {
        const req = this.pendingRequests.get(parsed.id)
        if (req) {
          clearTimeout(req.timer)
          this.pendingRequests.delete(parsed.id)
          if (parsed.error) {
            req.reject(new Error(parsed.error.message || 'RPC Error'))
          } else {
            req.resolve(parsed.result)
          }
        }
      }
    } catch (err) {
      console.error('Failed to parse MessagePort message', err)
    }
  }

  private request<T>(method: string, params: any[] = [], timeout = 10000): Promise<T> {
    return new Promise((resolve, reject) => {
      const id = ++this.messageId
      // Timeout to clean up pending request map and prevent leaks
      const timer = window.setTimeout(() => {
        this.pendingRequests.delete(id)
        reject(new Error(`RPC request ${method} timed out`))
      }, timeout)

      this.pendingRequests.set(id, { resolve, reject, timer })

      const payload = JSON.stringify({ jsonrpc: '2.0', method, params, id })
      this.remotePort.sendMessage([{ key: 'payload', value: payload }], this.localPort)
    })
  }

  private subscribe(method: string, params: any[], eventName: string, cb: Function) {
    this.subscriptions.set(eventName, cb)
    return this.request<void>(method, params)
  }

  async addTorrent(id: string | ArrayBufferView, mediaID: number, episode: number, background: boolean): Promise<TorrentFile[]> {
    return this.request<TorrentFile[]>('addTorrent', [id, mediaID, episode, background])
  }

  async playTorrent(id: string | ArrayBufferView, mediaID: number, episode: number): Promise<TorrentFile[]> {
    return this.request<TorrentFile[]>('playTorrent', [id, mediaID, episode])
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
    return this.request<Attachment[]>('attachments', [hash, id])
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

  async destroy(): Promise<void> {
    // nothing to destroy?
  }
}
