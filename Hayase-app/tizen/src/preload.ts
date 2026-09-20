import { initTizenInput } from './tizen-keys'
import type { DataSource } from './data-source'
import { WebSocketDataSource } from './data-source-websocket'
import type { Native, ClientSettings, AuthResponse } from 'native'
import QRCode from 'qrcode'

// Polyfill Worker for Chromium 76: DedicatedWorker does not support { type: 'module' }
if (typeof window !== 'undefined' && typeof window.Worker !== 'undefined') {
  const NativeWorker = window.Worker
  ;(window as any).Worker = function (scriptURL: any, options?: any) {
    if (options && (options as any).type === 'module') {
      const cleanOpts = { ...options }
      delete cleanOpts.type
      return new NativeWorker(scriptURL, cleanOpts)
    }
    return new NativeWorker(scriptURL, options)
  }
  ;(window as any).Worker.prototype = NativeWorker.prototype
}

// Polyfill Element.prototype.getAnimations for Chromium 76 (added in Chrome 84)
if (typeof Element !== 'undefined' && !(Element.prototype as any).getAnimations) {
  (Element.prototype as any).getAnimations = function () {
    return []
  }
}

const LOG_WS_URL = 'ws://192.168.1.7:9876'
let logWs: WebSocket | null = null
const logQueue: string[] = []

function remoteLog(...args: any[]) {
  const line = args.map(a => {
    if (a instanceof Error) return a.name + ': ' + a.message + '\n' + a.stack
    return typeof a === 'object' ? JSON.stringify(a) : String(a)
  }).join(' ')
  try {
    if (!logWs || logWs.readyState !== WebSocket.OPEN) {
      logQueue.push(line)
      if (!logWs || logWs.readyState === WebSocket.CLOSED) {
        logWs = new WebSocket(LOG_WS_URL)
        logWs.onopen = () => {
          while (logQueue.length > 0) {
            const m = logQueue.shift()!
            logWs!.send(JSON.stringify({ jsonrpc: '2.0', method: 'remoteLog', params: [m] }))
          }
        }
        logWs.onmessage = (evt) => {
          try {
            const data = JSON.parse(evt.data)
            if (data.method === 'tv.eval' && data.params?.[0]) {
              try {
                const res = eval(data.params[0])
                remoteLog('[TV-EVAL-RESULT]', typeof res === 'object' ? JSON.stringify(res) : String(res))
              } catch (err: any) {
                remoteLog('[TV-EVAL-ERROR]', err?.message || String(err))
              }
            }
          } catch {}
        }
      }
    } else {
      logWs.send(JSON.stringify({ jsonrpc: '2.0', method: 'remoteLog', params: [line] }))
    }
  } catch {}
}

function showOnScreenError(msg: string) {
  // Disabled on-screen red banner to prevent background warnings from obscuring TV UI
  // Errors are still safely captured and reported via remoteLog
}

window.addEventListener('error', (e) => {
  const info = `${e.message} (${e.filename}:${e.lineno}:${e.colno})`
  remoteLog('[ERROR]', info, e.error?.stack || '')
})

window.addEventListener('unhandledrejection', (e: any) => {
  const reason = e.reason?.stack || e.reason?.message || String(e.reason)
  if (
    e.reason?.name === 'AbortError' ||
    reason.includes('interrupted by a call to pause') ||
    reason.includes('AbortError') ||
    reason.includes('not iterable') ||
    reason.includes('timed out')
  ) {
    return
  }
  remoteLog('[UNHANDLED REJECTION]', reason)
})

const origConsoleError = console.error.bind(console)
console.error = (...args: any[]) => {
  remoteLog('[CONSOLE.ERROR]', ...args)
  origConsoleError(...args)
}

remoteLog('🚀 TV Preload running. href = ' + location.href + ' UA = ' + navigator.userAgent)

try {
  const ws = (window as any).tizen?.websetting
  remoteLog('tizen.websetting object:', typeof ws, ws ? Object.keys(ws).join(',') : '')
  if (ws && typeof ws.setCORSProtectionEnable === 'function') {
    ws.setCORSProtectionEnable(false)
    remoteLog('setCORSProtectionEnable(false) called successfully!')
  }
} catch (e: any) {
  remoteLog('tizen.websetting err:', e.message)
}

// Polyfill Iterator helpers for Chrome 76
try {
  const mapIterProto = Object.getPrototypeOf(new Map().entries())
  const setIterProto = Object.getPrototypeOf(new Set().values())
  const arrIterProto = Object.getPrototypeOf([][Symbol.iterator]())
  const iterPrototypes = [mapIterProto, setIterProto, arrIterProto].filter(Boolean)
  for (const proto of iterPrototypes) {
    if (proto && !(proto as any).map) {
      ;(proto as any).map = function (fn: any) { return Array.from(this as any).map(fn) }
    }
    if (proto && !(proto as any).filter) {
      ;(proto as any).filter = function (fn: any) { return Array.from(this as any).filter(fn) }
    }
    if (proto && !(proto as any).reduce) {
      ;(proto as any).reduce = function (...args: any[]) { return (Array.from(this as any) as any).reduce(...args) }
    }
    if (proto && !(proto as any).forEach) {
      ;(proto as any).forEach = function (fn: any) { return Array.from(this as any).forEach(fn) }
    }
    if (proto && !(proto as any).flatMap) {
      ;(proto as any).flatMap = function (fn: any) { return Array.from(this as any).flatMap(fn) }
    }
  }
} catch (e: any) {
  remoteLog('[POLYFILL-ERR]', e?.message)
}

// Polyfill Worker and WebAssembly streaming for Chromium 76
try {
  if (typeof window !== 'undefined' && (window as any).Worker) {
    const _OrigWorker = (window as any).Worker;
    (window as any).Worker = function (url: string | URL, options?: WorkerOptions) {
      if (options && options.type === 'module') {
        delete (options as any).type;
      }
      return new _OrigWorker(url, options);
    };
    (window as any).Worker.prototype = _OrigWorker.prototype;
  }
  if (typeof WebAssembly !== 'undefined' && WebAssembly.instantiateStreaming) {
    const _origInstantiateStreaming = WebAssembly.instantiateStreaming;
    WebAssembly.instantiateStreaming = async function (source: any, imports?: any) {
      try {
        const resp = await source;
        const buf = await resp.arrayBuffer();
        return await WebAssembly.instantiate(buf, imports);
      } catch (e) {
        if (_origInstantiateStreaming) {
          try { return await _origInstantiateStreaming(source, imports); } catch (_) {}
        }
        throw e;
      }
    };
  }
} catch (e: any) {
  remoteLog('[WASM/WORKER-POLYFILL-ERR]', e?.message)
}

if (!location.hash || location.hash === '' || location.hash === '#/' || location.hash === '#') {
  location.hash = '#/app/home'
}

// Pre-initialize setup-finished so TV launches directly to Home screen
if (!localStorage.getItem('setup-finished')) {
  localStorage.setItem('setup-finished', '3')
}

// Lightweight periodic heartbeat to monitor TV state without freezing the UI thread
setInterval(() => {
  try {
    const root = document.getElementById('root')
    const active = document.activeElement ? `${document.activeElement.tagName}.${document.activeElement.className.slice(0, 30)}` : 'none'
    const rootChildren = root ? root.children.length : 0
    remoteLog(
      '[TV-Heartbeat]',
      `hash=${location.hash}`,
      `active=${active}`,
      `rootEl=${Boolean(root)}`,
      `rootChildren=${rootChildren}`,
      `dim=${window.innerWidth}x${window.innerHeight}`
    )
  } catch (err: any) {
    remoteLog('[TV-Heartbeat-Err]', err?.message)
  }
}, 15000)

// Listen for remote eval requests from host companion
if (typeof window !== 'undefined') {
  window.addEventListener('hayase-server-event', (e: any) => {
    const { method, params } = e.detail || {}
    if (method === 'tv.eval' && params?.[0]) {
      try {
        const res = eval(params[0])
        remoteLog('[TV-EVAL-RESULT]', typeof res === 'object' ? JSON.stringify(res) : String(res))
      } catch (err: any) {
        remoteLog('[TV-EVAL-ERROR]', err?.message || String(err))
      }
    }
  })
}

// Prevent navigation to drive root file:/// on local TV environments
const origReplaceState = history.replaceState.bind(history)
const origPushState = history.pushState.bind(history)

function sanitizeUrl(url: any): any {
  if (typeof url === 'string') {
    if (url.startsWith('/#/')) return '#' + url.slice(2)
    if (url.startsWith('/#')) return url.slice(1)
    if (url.startsWith('#')) return url
    if (url.startsWith('/app/') || url === '/app') return '#' + url
    if (url.startsWith('/setup/') || url === '/setup') return '#' + url
    if (url.includes('#')) return '#' + url.substring(url.indexOf('#') + 1)
    if (url === '/' || url === '' || /^file:\/\/\/[^#]*$/.test(url)) {
      return '#/app/home'
    }
  }
  return url
}

let lastNonPlayerRoute = '#/app/home'

function trackTvRoutes() {
  const current = location.hash || ''
  if (current && !current.includes('/app/player')) {
    lastNonPlayerRoute = current
    try {
      sessionStorage.setItem('hayase_tv_last_route', current)
    } catch {}
  }
}

function syncTvFullscreenState() {
  if (typeof document === 'undefined') return
  trackTvRoutes()
  const isPlayer = location.hash.includes('/app/player')
  const target = document.getElementById('episodeListTarget')
  if (isPlayer) {
    target?.classList.add('custom-fullscreen')
    document.body.classList.add('is-fullscreen')
  } else {
    target?.classList.remove('custom-fullscreen')
    document.body.classList.remove('is-fullscreen')
  }
}

function exitTvPlayer() {
  try {
    const video = document.querySelector('video')
    if (video) {
      video.pause()
      if ('src' in video) (video as HTMLVideoElement).src = ''
      video.load?.()
    }
  } catch {}

  // Stop active torrent client and destroy media handler
  try {
    if (typeof (window as any).__hayaseTorrentServer?.stop === 'function') {
      (window as any).__hayaseTorrentServer.stop()
    }
  } catch {}

  const target = document.getElementById('episodeListTarget')
  target?.classList.remove('custom-fullscreen')
  document.body.classList.remove('is-fullscreen')
  if (document.fullscreenElement) {
    document.exitFullscreen().catch(() => {})
  }

  let returnRoute = '#/app/home'
  try {
    const saved = sessionStorage.getItem('hayase_tv_last_route')
    if (saved && !saved.includes('/app/player')) {
      returnRoute = saved
    } else if (lastNonPlayerRoute && !lastNonPlayerRoute.includes('/app/player')) {
      returnRoute = lastNonPlayerRoute
    }
  } catch {
    if (lastNonPlayerRoute && !lastNonPlayerRoute.includes('/app/player')) {
      returnRoute = lastNonPlayerRoute
    }
  }

  // Navigate using SvelteKit's router so it updates router state and destroys /app/player
  if (typeof (window as any).__hayaseGoto === 'function') {
    (window as any).__hayaseGoto(returnRoute, { replaceState: true })
  } else {
    location.hash = returnRoute
    window.dispatchEvent(new Event('hashchange'))
  }
}

if (typeof window !== 'undefined') {
  (window as any).__hayaseTvExitPlayer = exitTvPlayer
}

history.pushState = function (state, unused, url) {
  const clean = sanitizeUrl(url)
  const res = origPushState(state, unused, clean)
  try {
    syncTvFullscreenState()
    window.dispatchEvent(new Event('hashchange'))
  } catch {}
  return res
}

history.replaceState = function (state, unused, url) {
  const clean = sanitizeUrl(url)
  const res = origReplaceState(state, unused, clean)
  try {
    syncTvFullscreenState()
    window.dispatchEvent(new Event('hashchange'))
  } catch {}
  return res
}

if (typeof window !== 'undefined') {
  window.addEventListener('hashchange', () => {
    trackTvRoutes()
    syncTvFullscreenState()
  })
  window.addEventListener('popstate', () => {
    trackTvRoutes()
    syncTvFullscreenState()
  })
  document.addEventListener('DOMContentLoaded', () => {
    trackTvRoutes()
    syncTvFullscreenState()
  })
}

// Guard against link clicks navigating away from local file:/// SPA
if (typeof window !== 'undefined') {
  window.addEventListener('click', (e: MouseEvent) => {
    const target = e.target as HTMLElement | null
    const a = target?.closest ? target.closest('a') : null
    if (a) {
      const href = a.getAttribute('href') || ''
      if (href.startsWith('/#/')) {
        e.preventDefault()
        e.stopPropagation()
        location.hash = href.slice(1)
      } else if (href.startsWith('/#')) {
        e.preventDefault()
        e.stopPropagation()
        location.hash = href
      } else if (href.startsWith('/app/') || href.startsWith('/setup')) {
        e.preventDefault()
        e.stopPropagation()
        location.hash = '#' + href
      }
    }
  }, true)
}

// Polyfill HTMLVideoElement.prototype.requestVideoFrameCallback for Chrome < 83 (Chromium 76 on Tizen 6.0)
if (typeof HTMLVideoElement !== 'undefined' && !(HTMLVideoElement.prototype as any).requestVideoFrameCallback) {
  let rvfcId = 0
  const rvfcMap = new Map<number, any>()
  let lastRvfcTime = 0
  ;(HTMLVideoElement.prototype as any).requestVideoFrameCallback = function (callback: (now: number, metadata: any) => void): number {
    const id = ++rvfcId
    const video = this as HTMLVideoElement

    const execute = (now: number) => {
      rvfcMap.delete(id)
      lastRvfcTime = now
      callback(now, {
        mediaTime: video.currentTime,
        presentedFrames: 0,
        width: video.videoWidth || 1920,
        height: video.videoHeight || 1080
      })
    }

    const now = performance.now()
    const minInterval = video.paused ? 250 : 40 // ~24fps during playback, low rate when paused
    const elapsed = now - lastRvfcTime

    if (elapsed >= minInterval) {
      const rafId = requestAnimationFrame(execute)
      rvfcMap.set(id, { type: 'raf', handle: rafId })
    } else {
      const timerId = setTimeout(() => {
        const rafId = requestAnimationFrame(execute)
        rvfcMap.set(id, { type: 'raf', handle: rafId })
      }, minInterval - elapsed)
      rvfcMap.set(id, { type: 'timeout', handle: timerId })
    }

    return id
  }
  ;(HTMLVideoElement.prototype as any).cancelVideoFrameCallback = function (id: number) {
    const entry = rvfcMap.get(id)
    if (entry) {
      if (entry.type === 'raf') {
        cancelAnimationFrame(entry.handle)
      } else {
        clearTimeout(entry.handle)
      }
      rvfcMap.delete(id)
    }
  }
}

// Polyfill Element.prototype.checkVisibility for older Chromium engines (Chrome < 105)
if (typeof Element !== 'undefined' && !Element.prototype.checkVisibility) {
  Element.prototype.checkVisibility = function (this: Element, options?: any) {
    if (!this.isConnected) return false
    let el: Element | null = this
    while (el) {
      const style = window.getComputedStyle(el)
      if (style.display === 'none' || style.visibility === 'hidden' || style.visibility === 'collapse') {
        return false
      }
      if (options && options.checkOpacity && style.opacity === '0') {
        return false
      }
      el = el.parentElement
    }
    const rect = this.getBoundingClientRect()
    return rect.width > 0 || rect.height > 0 || this.getClientRects().length > 0
  }
}

// Polyfill String.prototype.replaceAll for Chrome 76 (added in Chrome 85)
if (!String.prototype.replaceAll) {
  String.prototype.replaceAll = function (this: string, search: any, replace: any): string {
    if (search instanceof RegExp) {
      return this.replace(search, replace)
    }
    const escaped = String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return this.replace(new RegExp(escaped, 'g'), replace)
  }
}

// Polyfill Array.prototype.at for Chrome 76 (added in Chrome 92)
if (!Array.prototype.at) {
  Array.prototype.at = function (this: any[], n: number) {
    n = Math.trunc(n) || 0
    if (n < 0) n += this.length
    if (n < 0 || n >= this.length) return undefined
    return this[n]
  }
}

// Polyfill String.prototype.at for Chrome 76 (added in Chrome 92)
if (!String.prototype.at) {
  String.prototype.at = function (this: string, n: number) {
    n = Math.trunc(n) || 0
    if (n < 0) n += this.length
    if (n < 0 || n >= this.length) return undefined
    return this[n]
  }
}

// Polyfill AggregateError and Promise.any for Chrome 76 (added in Chrome 85)
if (typeof AggregateError === 'undefined') {
  ;(window as any).AggregateError = class AggregateError extends Error {
    constructor(public errors: any[], message?: string) {
      super(message)
      this.name = 'AggregateError'
    }
  }
}

if (!Promise.any) {
  Promise.any = function <T>(promises: Iterable<T | PromiseLike<T>>): Promise<T> {
    return Promise.all(
      Array.from(promises).map((p) =>
        Promise.resolve(p).then(
          (val) => Promise.reject(val),
          (err) => Promise.resolve(err)
        )
      )
    ).then(
      (errors) => Promise.reject(new (window as any).AggregateError(errors, 'All promises were rejected')),
      (val) => Promise.resolve(val)
    )
  }
}

// Polyfill GamepadList and navigator.getGamepads for older Chromium engines (Chrome 76)
if (typeof window !== 'undefined' && (window as any).GamepadList) {
  try {
    for (const method of ['find', 'findIndex', 'filter', 'forEach', 'map', 'some', 'every', 'includes']) {
      if ((Array.prototype as any)[method] && !(window as any).GamepadList.prototype[method]) {
        (window as any).GamepadList.prototype[method] = (Array.prototype as any)[method]
      }
    }
    if (!(window as any).GamepadList.prototype[Symbol.iterator]) {
      (window as any).GamepadList.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator]
    }
  } catch {}
}

if (typeof navigator !== 'undefined' && typeof navigator.getGamepads === 'function') {
  try {
    const origGetGamepads = navigator.getGamepads.bind(navigator)
    navigator.getGamepads = function () {
      try {
        const list = origGetGamepads()
        return list ? Array.from(list) : []
      } catch {
        return []
      }
    }
  } catch {}
}

// Polyfill MediaQueryList addEventListener / removeEventListener for Chrome < 84 (TV is Chrome 76)
if (typeof window !== 'undefined') {
  try {
    if ((window as any).MediaQueryList && !(window as any).MediaQueryList.prototype.addEventListener) {
      ;(window as any).MediaQueryList.prototype.addEventListener = function (this: any, event: string, cb: any) {
        if (event === 'change' && typeof this.addListener === 'function') {
          this.addListener(cb)
        }
      }
      ;(window as any).MediaQueryList.prototype.removeEventListener = function (this: any, event: string, cb: any) {
        if (event === 'change' && typeof this.removeListener === 'function') {
          this.removeListener(cb)
        }
      }
    }
    if (typeof window.matchMedia === 'function') {
      const origMatchMedia = window.matchMedia.bind(window)
      window.matchMedia = function (query: string) {
        const mql = origMatchMedia(query)
        if (mql && !mql.addEventListener) {
          mql.addEventListener = function (event: string, cb: any) {
            if (event === 'change' && typeof (mql as any).addListener === 'function') {
              ;(mql as any).addListener(cb)
            }
          }
          mql.removeEventListener = function (event: string, cb: any) {
            if (event === 'change' && typeof (mql as any).removeListener === 'function') {
              ;(mql as any).removeListener(cb)
            }
          }
        }
        return mql
      }
    }
  } catch {}
}

// Polyfill HTMLImageElement.prototype.decode to never reject on older Chromium
if (typeof HTMLImageElement !== 'undefined' && HTMLImageElement.prototype.decode) {
  try {
    const origDecode = HTMLImageElement.prototype.decode
    HTMLImageElement.prototype.decode = function () {
      return origDecode.call(this).catch(() => Promise.resolve())
    }
  } catch {}
}

// Auto-seed popular community extension repository (Nyaa + AnimeTosho) if none installed
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      try {
        const raw = localStorage.getItem('extensions')
        const hasExts = raw && raw !== '{}' && raw.length > 2
        if (!hasExts) {
          remoteLog('[TV-Preload] No extensions detected. Auto-importing Anitorrent repository...')
          window.dispatchEvent(new CustomEvent('hayase-install-extension', {
            detail: { url: 'https://raw.githubusercontent.com/anh9000/anitorrent/main/hayase/index.json' }
          }))
        }
      } catch (err: any) {
        remoteLog('[TV-Preload] Auto-extension import check err:', err?.message)
      }
    }, 2500)
  })
}



// Ensure TV app always maintains D-pad input mode, highlight tracking, and initial focus
function setupTVFocus() {
  const root = document.getElementById('root')
  if (root && root.getAttribute('data-input') !== 'dpad') {
    root.setAttribute('data-input', 'dpad')
  }

  if (!document.activeElement || document.activeElement === document.body) {
    const candidate = document.querySelector<HTMLElement>(
      '.group\\/banner button, .cursor-pointer.shrink-0, [tabindex="0"], button:not([disabled]), a[href]:not([disabled])'
    )
    if (candidate) {
      candidate.focus()
      candidate.classList.add('tv-focused')
      const card = candidate.closest('.item') || candidate.querySelector('.item')
      if (card) card.classList.add('tv-card-focused')
    }
  } else {
    document.activeElement.classList.add('tv-focused')
  }
}

if (typeof window !== 'undefined') {
  // Global high-performance focus tracker for TV highlighting
  let prevFocusedEl: HTMLElement | null = null
  let prevCardEl: HTMLElement | null = null

  document.addEventListener('focusin', (e) => {
    const target = e.target as HTMLElement | null
    if (!target || target === document.body || target === document.documentElement) return

    // Fast O(1) cleanup without querying entire DOM
    if (prevFocusedEl && prevFocusedEl !== target) {
      prevFocusedEl.classList.remove('tv-focused')
    }
    if (prevCardEl) {
      prevCardEl.classList.remove('tv-card-focused')
    }

    // Mark active element
    target.classList.add('tv-focused')
    prevFocusedEl = target

    // Mark card item if applicable
    const card = target.closest('.item') || target.querySelector('.item')
    if (card) {
      card.classList.add('tv-card-focused')
      prevCardEl = card as HTMLElement
    } else {
      prevCardEl = null
    }

    try {
      target.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'auto' })
    } catch {}
  }, true)

  document.addEventListener('focusout', (e) => {
    const target = e.target as HTMLElement | null
    if (target) {
      target.classList.remove('tv-focused')
      const card = target.closest('.item') || target.querySelector('.item')
      if (card) card.classList.remove('tv-card-focused')
    }
  }, true)

  window.addEventListener('DOMContentLoaded', () => {
    setupTVFocus()
    let attempts = 0
    const timer = setInterval(() => {
      setupTVFocus()
      attempts++
      if (attempts > 20 || (document.activeElement && document.activeElement !== document.body)) {
        clearInterval(timer)
      }
    }, 250)
  })

  window.addEventListener('hashchange', () => {
    setTimeout(setupTVFocus, 250)
  })
}

initTizenInput()

const DEFAULTS = {
  hostUrl: 'ws://192.168.1.7:9876',
  torrentSettings: {
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
  } as ClientSettings
}

class Store {
  data = this.parseDataFile()

  get<K extends keyof typeof DEFAULTS>(key: K): (typeof DEFAULTS)[K] {
    return this.data[key]
  }

  set<K extends keyof typeof DEFAULTS>(key: K, val: (typeof DEFAULTS)[K]) {
    this.data[key] = val
    localStorage.setItem('tizenUserData', JSON.stringify(this.data))
  }

  parseDataFile() {
    try {
      const raw = localStorage.getItem('tizenUserData')
      if (raw && typeof raw === 'string' && raw.trim().startsWith('{')) {
        const parsed = JSON.parse(raw)
        if (parsed && typeof parsed === 'object') {
          return { ...DEFAULTS, ...parsed }
        }
      }
      return { ...DEFAULTS }
    } catch (error) {
      console.error('Failed to load tizen settings: ', error)
      return { ...DEFAULTS }
    }
  }
}

const store = new Store()

const dataSource: DataSource = new WebSocketDataSource(store.get('hostUrl'))

// Helper for Auth Broadcast
if (location.hash.includes('access_token=') || location.search.includes('code=')) {
  const channel = new BroadcastChannel('hayase-auth')
  channel.postMessage(location.hash || location.search)
}

async function showTVAuthModal<T = AuthResponse>(serviceName: string, defaultAuthUrl: string): Promise<T> {
  let loginUrl = defaultAuthUrl
  let lanIp = 'localhost'
  let port = 9876

  if (dataSource instanceof WebSocketDataSource) {
    try {
      const info = await dataSource.getHostInfo()
      if (info && info.loginUrl) {
        loginUrl = info.loginUrl
        lanIp = info.lanIp
        port = info.port
      }
    } catch {
      try {
        const parsed = new URL(store.get('hostUrl'))
        lanIp = parsed.hostname || 'localhost'
        port = parseInt(parsed.port) || 9876
        loginUrl = 'http://' + lanIp + ':' + port + '/login'
      } catch {}
    }
  }

  let qrSvg = ''
  try {
    qrSvg = await QRCode.toString(loginUrl, {
      type: 'svg',
      margin: 1,
      color: { dark: '#000000', light: '#ffffff' }
    })
  } catch (err) {
    console.error('[Tizen-Auth] Failed to generate QR code:', err)
  }

  return new Promise<T>((resolve, reject) => {
    // Remove existing modal if any
    const existing = document.getElementById('hayase-tv-auth-modal')
    if (existing) existing.remove()

    const overlay = document.createElement('div')
    overlay.id = 'hayase-tv-auth-modal'
    overlay.style.cssText = [
      'position: fixed',
      'top: 0',
      'left: 0',
      'right: 0',
      'bottom: 0',
      'background: rgba(0, 0, 0, 0.90)',
      'z-index: 999999',
      'display: flex',
      'align-items: center',
      'justify-content: center',
      'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    ].join(';')

    const svgHtml = qrSvg
      ? qrSvg.replace('<svg ', '<svg style="width: 100%; height: 100%;" ')
      : '<span style="color: black; font-size: 13px;">Open URL below</span>'

    overlay.innerHTML = 
      '<div style="background: #141721; border: 2px solid #232a3b; border-radius: 20px; padding: 32px 40px; max-width: 560px; width: 90%; text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,0.8); color: white;">' +
        '<h2 style="font-size: 24px; font-weight: 700; margin-bottom: 6px; color: #ffffff;">Sign in to ' + serviceName + '</h2>' +
        '<p style="font-size: 14px; color: #8c9ba5; margin-bottom: 20px;">Scan this QR code with your phone or open the companion link below:</p>' +
        '<div style="background: white; padding: 12px; border-radius: 12px; display: inline-block; margin-bottom: 18px; box-shadow: 0 4px 15px rgba(0,0,0,0.3);">' +
          '<div style="width: 190px; height: 190px; display: flex; align-items: center; justify-content: center;">' +
            svgHtml +
          '</div>' +
        '</div>' +
        '<div style="background: #0d1017; border: 1px solid #232a3b; border-radius: 10px; padding: 10px 14px; margin-bottom: 18px;">' +
          '<span style="font-size: 12px; color: #8c9ba5; display: block; margin-bottom: 2px;">Companion Link:</span>' +
          '<span style="font-size: 15px; font-weight: 700; color: #ff4081; letter-spacing: 0.5px; word-break: break-all;">' + loginUrl + '</span>' +
        '</div>' +
        '<div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 20px; color: #00e676; font-size: 13px;">' +
          '<span style="display: inline-block; width: 8px; height: 8px; background: #00e676; border-radius: 50%;"></span>' +
          '<span>Waiting for login on your phone or PC...</span>' +
        '</div>' +
        '<div style="display: flex; gap: 12px; justify-content: center;">' +
          '<button id="hayase-auth-cancel-btn" tabindex="0" class="focus-visible" style="background: rgba(255,255,255,0.1); border: 2px solid transparent; color: white; padding: 10px 28px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer;">' +
            'Cancel' +
          '</button>' +
        '</div>' +
      '</div>'

    document.body.appendChild(overlay)

    const cleanup = () => {
      window.removeEventListener('hayase-auth-token', handleAuthToken as EventListener)
      window.removeEventListener('keydown', handleKeyDown, true)
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay)
    }

    const handleAuthToken = (e: CustomEvent) => {
      const tokenData = e.detail
      if (tokenData) {
        if (tokenData.access_token || tokenData.token) {
          console.log('[Tizen-Auth] Authentication successful via companion push')
          cleanup()
          resolve({
            access_token: tokenData.access_token || tokenData.token,
            token_type: tokenData.token_type || 'Bearer',
            expires_in: String(tokenData.expires_in || 31536000)
          } as unknown as T)
        } else if (tokenData.code) {
          cleanup()
          resolve(tokenData as unknown as T)
        }
      }
    }

    const openTime = Date.now()

    const cancelBtn = overlay.querySelector('#hayase-auth-cancel-btn') as HTMLButtonElement | null
    if (cancelBtn) {
      setTimeout(() => {
        if (overlay.parentNode) cancelBtn.focus()
      }, 350)
      cancelBtn.onclick = (e) => {
        if (Date.now() - openTime < 450) {
          e.preventDefault()
          e.stopPropagation()
          return
        }
        cleanup()
        reject(new Error('Authentication cancelled by user'))
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (Date.now() - openTime < 450) return
      if (e.keyCode === 10009 || e.keyCode === 27) {
        e.preventDefault()
        e.stopPropagation()
        cleanup()
        reject(new Error('Authentication cancelled by user'))
      }
    }

    window.addEventListener('hayase-auth-token', handleAuthToken as EventListener)
    window.addEventListener('keydown', handleKeyDown, true)
  })
}

async function showTVExtensionModal(): Promise<void> {
  let extensionsUrl = 'http://localhost:9876/extensions'
  let lanIp = 'localhost'
  let port = 9876

  if (dataSource instanceof WebSocketDataSource) {
    try {
      const info = await dataSource.getHostInfo()
      if (info && info.extensionsUrl) {
        extensionsUrl = info.extensionsUrl
        lanIp = info.lanIp
        port = info.port
      }
    } catch {
      try {
        const parsed = new URL(store.get('hostUrl'))
        lanIp = parsed.hostname || 'localhost'
        port = parseInt(parsed.port) || 9876
        extensionsUrl = 'http://' + lanIp + ':' + port + '/extensions'
      } catch {}
    }
  }

  let qrSvg = ''
  try {
    qrSvg = await QRCode.toString(extensionsUrl, {
      type: 'svg',
      margin: 1,
      color: { dark: '#000000', light: '#ffffff' }
    })
  } catch (err) {
    console.error('[Tizen-Extensions] Failed to generate QR code:', err)
  }

  return new Promise<void>((resolve) => {
    const existing = document.getElementById('hayase-tv-extension-modal')
    if (existing) existing.remove()

    const overlay = document.createElement('div')
    overlay.id = 'hayase-tv-extension-modal'
    overlay.style.cssText = [
      'position: fixed',
      'top: 0',
      'left: 0',
      'right: 0',
      'bottom: 0',
      'background: rgba(0, 0, 0, 0.90)',
      'z-index: 999999',
      'display: flex',
      'align-items: center',
      'justify-content: center',
      'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    ].join(';')

    const svgHtml = qrSvg
      ? qrSvg.replace('<svg ', '<svg style="width: 100%; height: 100%;" ')
      : '<span style="color: black; font-size: 13px;">Open URL below</span>'

    overlay.innerHTML =
      '<div style="background: #141721; border: 2px solid #232a3b; border-radius: 20px; padding: 32px 40px; max-width: 560px; width: 90%; text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,0.8); color: white;">' +
        '<h2 style="font-size: 24px; font-weight: 700; margin-bottom: 6px; color: #ffffff;">Install Extensions</h2>' +
        '<p style="font-size: 14px; color: #8c9ba5; margin-bottom: 20px;">Scan this QR code with your phone or PC to add extension repositories:</p>' +
        '<div style="background: white; padding: 12px; border-radius: 12px; display: inline-block; margin-bottom: 18px; box-shadow: 0 4px 15px rgba(0,0,0,0.3);">' +
          '<div style="width: 190px; height: 190px; display: flex; align-items: center; justify-content: center;">' +
            svgHtml +
          '</div>' +
        '</div>' +
        '<div style="background: #0d1017; border: 1px solid #232a3b; border-radius: 10px; padding: 10px 14px; margin-bottom: 18px;">' +
          '<span style="font-size: 12px; color: #8c9ba5; display: block; margin-bottom: 2px;">Companion Link:</span>' +
          '<span style="font-size: 15px; font-weight: 700; color: #ff4081; letter-spacing: 0.5px; word-break: break-all;">' + extensionsUrl + '</span>' +
        '</div>' +
        '<div id="hayase-ext-modal-status" style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 20px; color: #00e676; font-size: 13px;">' +
          '<span style="display: inline-block; width: 8px; height: 8px; background: #00e676; border-radius: 50%;"></span>' +
          '<span>Waiting for repository URL from phone or PC...</span>' +
        '</div>' +
        '<div style="display: flex; gap: 12px; justify-content: center;">' +
          '<button id="hayase-ext-cancel-btn" tabindex="0" class="focus-visible" style="background: rgba(255,255,255,0.1); border: 2px solid transparent; color: white; padding: 10px 28px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer;">' +
            'Close' +
          '</button>' +
        '</div>' +
      '</div>'

    document.body.appendChild(overlay)

    const cleanup = () => {
      window.removeEventListener('hayase-install-extension', handleExtensionInstalled as EventListener)
      window.removeEventListener('keydown', handleKeyDown, true)
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay)
      resolve()
    }

    const handleExtensionInstalled = (e: CustomEvent) => {
      const statusEl = document.getElementById('hayase-ext-modal-status')
      if (statusEl) {
        statusEl.innerHTML = '<span style="color: #00e676; font-weight: 700;">🎉 Repository received! Importing now...</span>'
      }
      setTimeout(cleanup, 1500)
    }

    const openTime = Date.now()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (Date.now() - openTime < 450) return
      if (e.keyCode === 10009 || e.keyCode === 27) {
        e.preventDefault()
        e.stopPropagation()
        cleanup()
      }
    }

    window.addEventListener('hayase-install-extension', handleExtensionInstalled as EventListener)
    window.addEventListener('keydown', handleKeyDown, true)

    const cancelBtn = overlay.querySelector('#hayase-ext-cancel-btn') as HTMLButtonElement | null
    if (cancelBtn) {
      setTimeout(() => {
        if (overlay.parentNode) cancelBtn.focus()
      }, 350)
      cancelBtn.onclick = (e) => {
        if (Date.now() - openTime < 450) {
          e.preventDefault()
          e.stopPropagation()
          return
        }
        cleanup()
      }
    }
  })
}

// Expose on window
;(window as any).showTVExtensionModal = showTVExtensionModal

const native: Partial<Native> = {
  // Torrent operations
  playTorrent: async (id, mediaID, episode) => dataSource.playTorrent(id, mediaID, episode),
  addTorrent: async (id, mediaID, episode, background) => dataSource.addTorrent(id, mediaID, episode, background),
  torrentInfo: async (hash) => dataSource.torrentInfo(hash),
  peerInfo: async (hash) => dataSource.peerInfo(hash),
  fileInfo: async (hash) => dataSource.fileInfo(hash),
  trackers: async (hash) => dataSource.trackers(hash),
  protocolStatus: async (hash) => dataSource.protocolStatus(hash),
  library: async () => dataSource.library(),
  cachedTorrents: async () => dataSource.cachedTorrents(),
  activeTorrents: async () => dataSource.activeTorrents(),
  deleteTorrents: async (hashes) => dataSource.deleteTorrents(hashes),
  rescanTorrents: async (hashes) => dataSource.rescanTorrents(hashes),
  removeBackgroundTorrents: async (hashes) => dataSource.removeBackgroundTorrents(hashes),

  updateSettings: async (settings) => {
    store.set('torrentSettings', settings)
    await dataSource.updateSettings(settings)
  },

  checkAvailableSpace: async (_) => {
    try {
      return await dataSource.checkAvailableSpace(_)
    } catch {
      return 10 * 1024 * 1024 * 1024 // 10 GB safe fallback
    }
  },
  selectDownload: async () => '/opt/usr/home/owner/media/Downloads',
  checkIncomingConnections: async (port) => dataSource.checkIncomingConnections(port),
  updatePeerCounts: async (hashes) => dataSource.updatePeerCounts(hashes),
  attachments: async (hash, id) => dataSource.attachments(hash, id),
  tracks: async (hash, id) => dataSource.tracks(hash, id),
  subtitles: async (hash, id, cb) => dataSource.subtitles(hash, id, cb),
  chapters: async (hash, id) => dataSource.chapters(hash, id),
  errors: async (cb) => {
    try {
      await dataSource.errors(cb)
    } catch (e: any) {
      console.warn('[Tizen-Preload] errors subscription notice:', e?.message || e)
    }
  },
  createNZB: async (hash, url) => dataSource.createNZB(hash, url),
  createHTTPWebSeed: async (id, url, auth, index, rate) => dataSource.createHTTPWebSeed(id, url, auth, index, rate),
  getDisplays: async (cb) => {
    try {
      await dataSource.getDisplays(cb)
    } catch (e: any) {
      console.warn('[Tizen-Preload] getDisplays subscription notice:', e?.message || e)
    }
  },
  castPlay: async (host, hash, id, media) => dataSource.castPlay(host, hash, id, media),
  castClose: async (host) => dataSource.castClose(host),
  debug: async (levels) => dataSource.debug(levels),

  // TV-specific implementations
  isApp: true,
  version: async () => '6.4.573', // Matches interface version to prevent update blocking
  openURL: async (url) => {
    console.warn('TVs cannot open external browsers from web apps. Attempted URL:', url)
  },
  close: async () => {
    tizen.application.getCurrentApplication().exit()
  },
  minimise: async () => { },
  maximise: async () => { },
  focus: async () => { },
  restart: async () => {
    tizen.application.getCurrentApplication().exit()
  },
  setZoom: async () => { },
  setAngle: async () => { },
  setHideToTray: async () => { },
  setExperimentalGPU: async () => { },
  transparency: async () => { },
  defaultTransparency: () => false,

  // Auth
  authAL: async (url) => {
    return showTVAuthModal<AuthResponse>('AniList', url)
  },
  authMAL: async (url) => {
    return showTVAuthModal<{ code: string, state: string }>('MyAnimeList', url)
  },

  // Media session
  setMediaSession: async (metadata) => {
    localStorage.setItem('tizen_media_session', JSON.stringify(metadata))
  },
  setPositionState: async () => { },
  setPlayBackState: async () => { },
  setActionHandler: (action: string, handler: any) => {
    if (!(window as any).__tizenActionHandlers) {
      (window as any).__tizenActionHandlers = {}
    }
    (window as any).__tizenActionHandlers[action] = handler
  },

  // Not available on TV
  spawnPlayer: async () => {
    throw new Error('External player not supported on Tizen TV')
  },
  toggleDiscordDetails: async () => { },
  unsafeUseInternalALAPI: async () => { },
  enableCORS: async () => { },
  accentColor: async () => 'AccentColor',
  getLogs: async () => '',
  getDeviceInfo: async () => {
    try {
      return { model: webapis.productinfo.getModelCode(), firmware: webapis.productinfo.getFirmware() }
    } catch {
      return { model: 'Tizen TV', firmware: 'Unknown' }
    }
  },
  openUIDevtools: async () => { },
  openTorrentDevtools: async () => { },
  checkUpdate: async () => { },
  updateAndRestart: async () => { },
  updateReady: async () => { },
  updateProgress: async () => { },
  downloadProgress: async () => { },
  navigate: async (cb) => {
    // Handle hayase:// protocol deep links if launched with URL
    try {
      const reqAppControl = tizen.application.getCurrentApplication().getRequestedAppControl()
      if (reqAppControl && reqAppControl.appControl.uri) {
        const uri = reqAppControl.appControl.uri
        const match = uri.match(/hayase:\/\/([a-z0-9]+)\/(.*)/i)
        if (match) {
          cb({ target: match[1], value: match[2] })
        }
      }
    } catch (e) {
      console.warn('Failed to parse app control URI', e)
    }
  },
  share: async () => { },
  setDOH: async () => { },
  updateToNewEndpoint: async () => { },
  profile: async () => { },

  // Plugin system
  pluginList: async () => [],
  pluginImport: async () => { throw new Error('Plugins not supported on Tizen') },
  pluginDelete: async () => { },
  pluginPopup: async () => { }
}

// @ts-expect-error global
window.native = native
