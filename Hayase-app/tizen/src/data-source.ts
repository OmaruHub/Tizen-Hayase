import type { TorrentFile, TorrentInfo, PeerInfo, FileInfo, ClientSettings, LibraryEntry, Attachment, SubtitleTrack } from 'native'

export interface DataSource {
  readonly ready: Promise<void>
  addTorrent(id: string | ArrayBufferView, mediaID: number, episode: number, background: boolean): Promise<TorrentFile[]>
  playTorrent(id: string | ArrayBufferView, mediaID: number, episode: number): Promise<TorrentFile[]>
  torrentInfo(hash: string): Promise<TorrentInfo>
  peerInfo(hash: string): Promise<PeerInfo[]>
  fileInfo(hash: string): Promise<FileInfo[]>
  trackers(hash: string): Promise<Record<string, { complete: number, downloaded: number, incomplete: number, failed: boolean }>>
  protocolStatus(hash: string): Promise<{
    dht: boolean
    lsd: boolean
    pex: boolean
    nat: boolean
    forwarding: boolean
    persisting: boolean
    streaming: boolean
  }>
  library(): Promise<LibraryEntry[]>
  cachedTorrents(): Promise<string[]>
  activeTorrents(): Promise<TorrentInfo[]>
  deleteTorrents(hashes: string[]): Promise<void>
  rescanTorrents(hashes: string[]): Promise<void>
  removeBackgroundTorrents(hashes: string[]): Promise<void>
  updateSettings(settings: ClientSettings): Promise<void>
  checkAvailableSpace(unused?: unknown): Promise<number>
  checkIncomingConnections(port: number): Promise<boolean>
  updatePeerCounts(hashes: string[]): Promise<Array<{ hash: string, complete: string, downloaded: string, incomplete: string }>>
  attachments(hash: string, id: number): Promise<Attachment[]>
  tracks(hash: string, id: number): Promise<SubtitleTrack[]>
  subtitles(hash: string, id: number, cb: (subtitle: { text: string, time: number, duration: number }, trackNumber: number) => void): Promise<void>
  chapters(hash: string, id: number): Promise<Array<{ start: number, end: number, text: string }>>
  errors(cb: (error: Error) => void): Promise<void>
  createNZB(hash: string, url: string): Promise<void>
  createHTTPWebSeed(id: string, url: string, authorization?: string, fileIndex?: number, rateLimit?: number): Promise<void>
  getDisplays(cb: (displays: Array<{ friendlyName: string, host: string }>) => void): Promise<void>
  castPlay(host: string, hash: string, id: number, media: any): Promise<void>
  castClose(host: string): Promise<void>
  debug(levels: string): Promise<void>
  destroy(): Promise<void>
}

