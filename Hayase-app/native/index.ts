import type { MediaInformation } from 'chromecast-caf-receiver/cast.framework.messages'

export interface AuthResponse {
  access_token: string
  expires_in: string // seconds
  token_type: 'Bearer'
}

export interface Track {
  selected: boolean
  enabled: boolean
  id: string
  kind: string
  label: string
  language: string
}

export interface TorrentFile {
  name: string
  hash: string
  type: string
  size: number
  path: string
  url: string
  lan: string
  id: number
}

export interface Attachment {
  filename: string
  mimetype: string
  id: number
  url: string
}

export interface TorrentInfo {
  name: string
  progress: number
  size: {
    total: number
    downloaded: number
    uploaded: number
  }
  speed: {
    down: number
    up: number
  }
  time: {
    remaining: number
    elapsed: number
  }
  peers: {
    seeders: number
    leechers: number
    wires: number
  }
  pieces: {
    total: number
    size: number
  }
  hash: string
}

export interface PeerInfo {
  ip: string
  seeder: boolean
  client: string
  progress: number
  size: {
    downloaded: number
    uploaded: number
  }
  speed: {
    down: number
    up: number
  }
  flags: Array<'incoming' | 'outgoing' | 'utp' | 'encrypted'>
  time: number
}

export interface FileInfo {
  name: string
  size: number
  progress: number
  selections: number
}

export interface ClientSettings {
  torrentPersist: boolean
  torrentDHT: boolean
  torrentStreamedDownload: boolean
  torrentSpeed: number
  maxConns: number
  torrentPort: number
  dhtPort: number
  torrentPeX: boolean
  nzbDomain: string
  nzbLogin: string
  nzbPassword: string
  nzbPort: number
  nzbPoolSize: number
}

export interface LibraryEntry {
  mediaID: number
  episode: number
  files: number
  hash: string
  progress: number
  date: number
  size: number
  name: string
}

export interface SessionMetadata {
  title: string
  description: string
  image: string
}

export interface SubtitleTrack {
  number: number
  language: string
  type: string
  _compressed: boolean
  default: boolean
  forced: boolean
  name?: string
  header?: string
}

export interface PluginInfo {
  id: string
  name: string
  version: string
  description: string
  permissions: string[]
}

export interface Native {
  authAL: (url: string) => Promise<AuthResponse>
  authMAL: (url: string) => Promise<{ code: string, state: string }>
  restart: () => Promise<void>
  openURL: (url: string) => Promise<void>
  share: Navigator['share']
  minimise: () => Promise<void>
  maximise: () => Promise<void>
  focus: () => Promise<void>
  close: () => Promise<void>
  selectPlayer: () => Promise<string>
  selectDownload: (type?: 'cache' | 'internal' | 'sdcard') => Promise<string>
  setAngle: (angle: string) => Promise<void>
  getLogs: () => Promise<string>
  getDeviceInfo: () => Promise<unknown>
  openUIDevtools: () => Promise<void>
  openTorrentDevtools: () => Promise<void>
  checkUpdate: () => Promise<void>
  updateAndRestart: () => Promise<void>
  updateReady: () => Promise<void>
  toggleDiscordDetails: (enabled: boolean) => Promise<void>
  enableCORS: (urls: string[]) => Promise<void>
  unsafeUseInternalALAPI: () => Promise<void>
  setMediaSession: (metadata: SessionMetadata, mediaId: number, duration: number) => Promise<void>
  setPositionState: (state: MediaPositionState, paused: 'none' | 'paused' | 'playing') => Promise<void>
  setPlayBackState: (paused: 'none' | 'paused' | 'playing') => Promise<void>
  setActionHandler: (action: MediaSessionAction | 'enterpictureinpicture', handler: MediaSessionActionHandler | null) => void
  checkAvailableSpace: (_?: unknown) => Promise<number>
  checkIncomingConnections: (port: number) => Promise<boolean>
  updatePeerCounts: (hashes: string[]) => Promise<Array<{ hash: string, complete: string, downloaded: string, incomplete: string }>>
  addTorrent: (id: string | ArrayBufferView, mediaID: number, episode: number, background: boolean) => Promise<TorrentFile[]>
  deleteTorrents: (hashes: string[]) => Promise<void>
  removeBackgroundTorrents: (hashes: string[]) => Promise<void>
  rescanTorrents: (hashes: string[]) => Promise<void>
  library: () => Promise<LibraryEntry[]>
  attachments: (hash: string, id: number) => Promise<Attachment[]>
  tracks: (hash: string, id: number) => Promise<SubtitleTrack[]>
  subtitles: (hash: string, id: number, cb: (subtitle: { text: string, time: number, duration: number }, trackNumber: number) => void) => Promise<void>
  errors: (cb: (error: Error) => void) => Promise<void>
  chapters: (hash: string, id: number) => Promise<Array<{ start: number, end: number, text: string }>>
  torrentInfo: (hash: string) => Promise<TorrentInfo>
  peerInfo: (hash: string) => Promise<PeerInfo[]>
  fileInfo: (hash: string) => Promise<FileInfo[]>
  trackers: (hash: string) => Promise<Record<string, { complete: number, downloaded: number, incomplete: number, failed: boolean }>>
  protocolStatus: (hash: string) => Promise<{
    dht: boolean
    lsd: boolean
    pex: boolean
    nat: boolean
    forwarding: boolean
    persisting: boolean
    streaming: boolean
  }>
  setDOH: (dns: string) => Promise<void>
  updateToNewEndpoint: (endpoint: string) => Promise<void>
  cachedTorrents: () => Promise<string[]>
  activeTorrents: () => Promise<TorrentInfo[]>
  createNZB: (hash: string, url: string) => Promise<void>
  createHTTPWebSeed: (id: string, url: string, authorization?: string, fileIndex?: number, rateLimit?: number) => Promise<void>
  getDisplays: (cb: (displays: Array<{ friendlyName: string, host: string }>) => void) => Promise<void>
  castPlay: (host: string, hash: string, id: number, media: MediaInformation) => Promise<void>
  castClose: (host: string) => Promise<void>
  downloadProgress: (percent: number) => Promise<void>
  updateSettings: (settings: ClientSettings) => Promise<void>
  updateProgress: (cb: (progress: number) => void) => Promise<void>
  spawnPlayer: (url: string) => Promise<void>
  setHideToTray: (enabled: boolean) => Promise<void>
  setExperimentalGPU: (enabled: boolean) => Promise<void>
  transparency: (enabled: boolean) => Promise<void>
  setZoom: (scale: number) => Promise<void>
  isApp: boolean
  version: () => Promise<string>
  navigate: (cb: (data: { target: string, value: string | undefined }) => void) => Promise<void>
  defaultTransparency: () => boolean
  debug: (levels: string) => Promise<void>
  profile: (seconds: number) => Promise<void>
  accentColor: () => Promise<string>
  pluginList: () => Promise<PluginInfo[]>
  pluginPopup: (pluginId: string) => Promise<void>
  pluginImport: (id?: string) => Promise<PluginInfo>
  pluginDelete: (id: string) => Promise<void>
}
