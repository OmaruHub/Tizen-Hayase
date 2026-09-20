import JASSUB from 'jassub'
import modernWasmUrl from 'jassub/dist/wasm/jassub-worker-modern.wasm?url'
import wasmUrl from 'jassub/dist/wasm/jassub-worker.wasm?url'
import workerUrl from 'jassub/dist/worker/worker.js?worker&url'
import { writable } from 'simple-store-svelte'
import { get } from 'svelte/store'

import type { ResolvedFile } from './resolver'
import type { MediaInfo } from './util'
import type { ASSEvent, ASSStyle } from 'jassub/dist/worker/util'
import type { SubtitleTrack, TorrentFile } from 'native'

import { extensions } from '$lib/modules/extensions'
import native from '$lib/modules/native'
import { type defaults, settings, SUPPORTS } from '$lib/modules/settings'
import { fontRx, HashMap, subRx, subtitleExtensions, toTS } from '$lib/utils'

const defaultHeader = `[Script Info]
Title: English (US)
ScriptType: v4.00+
WrapStyle: 0
PlayResX: 1920
PlayResY: 1080
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default, Roboto Medium,52,&H00FFFFFF,&H00FFFFFF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,2.6,0,2,20,20,46,1
[Events]

`

const STYLE_OVERRIDES: Record<typeof defaults.subtitleStyle, Pick<ASSStyle, 'FontName' |'Spacing' | 'ScaleX'>> = {
  none: {
    FontName: 'Roboto Medium',
    Spacing: 0,
    ScaleX: 1
  },
  gandhisans: {
    FontName: 'Gandhi Sans',
    Spacing: 0.2,
    ScaleX: 0.98
  },
  notosans: {
    FontName: 'Noto Sans',
    Spacing: 0,
    ScaleX: 0.99
  },
  roboto: {
    FontName: 'Roboto Medium',
    Spacing: 0,
    ScaleX: 1
  }
}

const appBase = (typeof location !== 'undefined' && location.href)
  ? location.href.replace(/#.*$/, '').replace(/index\.html.*$/, '')
  : ''

const AVAILABLE_FONTS = {
  'Roboto Medium': appBase + 'Roboto.woff2',
  'Gandhi Sans': appBase + 'GandhiSans-Bold.woff2',
  'Noto Sans': appBase + 'NotoSans-Bold.woff2',
  'Noto Sans JP Bold': appBase + 'NotoSansJP.woff2',
  'Noto Sans KR Bold': appBase + 'NotoSansKR.woff2',
  'Noto Sans HK': appBase + 'NotoSansHK.woff2'
}

const LANGUAGE_OVERRIDES: Record<string, string> = {
  jpn: 'Noto Sans JP Bold',
  kor: 'Noto Sans KR Bold',
  chi: 'Noto Sans HK',
  ja: 'Noto Sans JP Bold',
  ko: 'Noto Sans KR Bold',
  zh: 'Noto Sans HK'
}

function detectCJKLanguage (str: string) {
  const japaneseRegex = /[\u3040-\u309f\u30a0-\u30ff]/
  const koreanRegex = /[\uac00-\ud7af\u1100-\u11ff\u3130-\u318f\ua960-\ua97f\ud7b0-\ud7ff]/
  const chineseRegex = /[\u4e00-\u9fff\u3400-\u4dbf]/

  for (let i = 0; i < str.length; i += 10000) {
    const chunk = str.slice(i, i + 10000)

    if (japaneseRegex.test(chunk)) return 'jpn'
    if (koreanRegex.test(chunk)) return 'kor'
    if (chineseRegex.test(chunk)) return 'chi'
  }

  return null
}

let lastSelectedTrack: { language?: string, name?: string, number: string } | undefined

function padZero (n: number, z = 2) { return String(n).padStart(z, '0') }
function toAssTime (ms: number) {
  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  const cs = Math.floor((ms % 1000) / 10)
  return `${h}:${padZero(m)}:${padZero(s)}.${padZero(cs)}`
}

function parseAssTimeToMs (timeStr: string): number {
  const parts = timeStr.trim().split(':')
  if (parts.length === 3) {
    const h = parseInt(parts[0] || '0', 10)
    const m = parseInt(parts[1] || '0', 10)
    const secParts = (parts[2] || '0').split('.')
    const s = parseInt(secParts[0] || '0', 10)
    const ms = parseInt((secParts[1] || '0').padEnd(3, '0').slice(0, 3), 10)
    return h * 3600000 + m * 60000 + s * 1000 + ms
  }
  return 0
}

export function mkvChunkToDialogue (text: string, timeMs: number, durationMs: number): string {
  const parts = text.split(',')
  if (parts.length >= 9) {
    const layer = parts[1] || '0'
    const style = parts[2] || 'Default'
    const name = parts[3] || ''
    const marginL = parts[4] || '0'
    const marginR = parts[5] || '0'
    const marginV = parts[6] || '0'
    const effect = parts[7] || ''
    const dialogueText = parts.slice(8).join(',')
    const start = toAssTime(timeMs)
    const end = toAssTime(timeMs + durationMs)
    return `Dialogue: ${layer},${start},${end},${style},${name},${marginL},${marginR},${marginV},${effect},${dialogueText}`
  }
  return `Dialogue: 0,${toAssTime(timeMs)},${toAssTime(timeMs + durationMs)},Default,,0,0,0,,${text}`
}

const stylesRx = /^Style:[^,]*/gm
export default class Subtitles {
  video?: HTMLVideoElement
  canvas?: HTMLCanvasElement
  selected: ResolvedFile
  fonts: string[]
  jassub: JASSUB | null = null
  current = writable<number | string>(-1)
  set = get(settings)

  _tracks = writable<Record<number | string, { events: HashMap<{ text: string, time: number, duration: number, style?: string }, ASSEvent>, meta: SubtitleTrack, styles: Record<string | number, number> }>>({})
  timeOffset = 0
  domOverlayBottom: HTMLDivElement | null = null
  domOverlayTop: HTMLDivElement | null = null
  domInterval: any = null
  useDomSubtitles = false

  constructor (video: HTMLVideoElement | undefined, otherFiles: TorrentFile[], mediaInfo: MediaInfo, canvas?: HTMLCanvasElement) {
    if (typeof window !== 'undefined') {
      (window as any).__currentSubtitles = this
    }
    this.video = video
    this.canvas = canvas
    this.selected = mediaInfo.file
    this.fonts = [...otherFiles.filter(file => fontRx.test(file.name)).map(file => file.url)]

    this.current.subscribe(value => {
      this.selectCaptions(value)
    })

    settings.subscribe(set => {
      this.set = set
      this._applyStyleOverride(set.subtitleStyle)
      if (this.useDomSubtitles) this.updateDomSubtitles()
    })

    const subFiles = otherFiles.filter(({ name }) => subRx.test(name))

    const fetchAndLoad = async (file: { url: string, name: string }) => {
      const res = await fetch(file.url)
      const blob = await res.blob()
      await this.addSingleSubtitleFile(new File([blob], file.name))
    }

    extensions.subtitlesQuery(mediaInfo.media, mediaInfo.episode).then(async results => {
      for (const { url, language } of results) {
        fetchAndLoad({ url, name: language })
      }
    })

    if (subFiles.length === 1) {
      fetchAndLoad(subFiles[0]!)
    } else if (subFiles.length > 1) {
      const videoName = mediaInfo.file.name.substring(0, mediaInfo.file.name.lastIndexOf('.')) || mediaInfo.file.name
      for (const file of subFiles) {
        if (file.name.includes(videoName)) {
          fetchAndLoad(file)
        }
      }
    }

    const tracks = native.tracks(this.selected.hash, this.selected.id)
      .catch(err => {
        console.warn('[Subtitles] native.tracks failed, proceeding with external subtitles:', err)
        console.warn('[Subtitles-Debug] tracks() called with hash=' + this.selected.hash + ' id=' + this.selected.id)
        return []
      })
      .then(async (tracklist: any[]) => {
        console.log('[Subtitles-Debug] tracks resolved:', JSON.stringify(tracklist?.length ?? 'null'), 'hash=' + this.selected.hash, 'id=' + this.selected.id)
        if (Array.isArray(tracklist)) {
          for (const track of tracklist) {
            console.log('[Subtitles-Debug] track:', track.number, track.language, track.type, 'header-len=' + (track.header?.length ?? 0))
            const newtrack = this.track(track.number)
            newtrack.styles.Default = 0
            if (track.header?.startsWith('[Script Info]')) track.type = 'ass'
            track.header ??= defaultHeader
            newtrack.meta = track
            const styleMatches = track.header.match(stylesRx)
            if (!styleMatches) continue
            for (let i = 0; i < styleMatches.length; ++i) {
              newtrack.styles[styleMatches[i]!.replace('Style:', '').trim()] = i + 1
            }
          }
        }
        console.log('[Subtitles-Debug] calling initSubtitleRenderer, video?', !!this.video, 'canvas?', !!this.canvas)
        await this.initSubtitleRenderer()
        console.log('[Subtitles-Debug] initSubtitleRenderer done, jassub?', !!this.jassub)

      const targetLang = this.set?.subtitleLanguage ?? 'eng'
      if (targetLang === 'none') return // explicitly disabled

      const tracks = Object.entries(this._tracks.value)

      if (!tracks.length) return
      if (tracks.length === 1) return await this.selectCaptions(tracks[0]![0])

      const audioLanguage = this.set.audioLanguage

      const selectDesired = async (filteredTracks: typeof tracks) => {
        if (filteredTracks.length === 1) return await this.selectCaptions(filteredTracks[0]![0])

        const [desired] =
          // forced for the curent audio lang
          filteredTracks.find(([_, { meta }]) => {
            return meta.language === audioLanguage && meta.forced
          }) ??
          // non-forced for not the current audio lang
          filteredTracks.find(([_, { meta }]) => {
            return meta.language !== audioLanguage && !meta.forced
          }) ??
          // default
          filteredTracks.find(([_, { meta }]) => meta.default) ??
          filteredTracks[0]!

        return await this.selectCaptions(desired)
      }

      const matchesLast = lastSelectedTrack && tracks.filter(([_, { meta }]) => meta.language === lastSelectedTrack!.language && meta.name === lastSelectedTrack!.name)

      if (matchesLast?.length) {
        if (matchesLast.length === 1) return await this.selectCaptions(matchesLast[0]![0])

        const matchesLastNumber = matchesLast.find(([_, { meta }]) => meta.number === lastSelectedTrack!.number)
        if (matchesLastNumber) return await this.selectCaptions(matchesLastNumber[0])

        return await selectDesired(matchesLast)
      }

      const wantedLanguages = tracks.filter(([_, { meta }]) => (meta.language ?? 'eng') === targetLang)
      if (wantedLanguages.length) {
        return await selectDesired(wantedLanguages)
      }

      const englishFallback = tracks.filter(([_, { meta }]) => (meta.language ?? 'eng') === 'eng')
      if (englishFallback.length) {
        return await selectDesired(englishFallback)
      }

      await this.selectCaptions(tracks[0]![0])
    }).catch(err => { console.error('[Subtitles-Debug] tracks chain error:', err) })

    console.log('[Subtitles-Debug] subscribing to subtitles, hash=' + this.selected.hash + ' id=' + this.selected.id)
    native.subtitles(this.selected.hash, this.selected.id, async (subtitle: { text: string, time: number, duration: number, style?: string }, trackNumber) => {
      console.log('[Subtitles-Debug] subtitle event received! track=' + trackNumber + ' text=' + (subtitle.text || '').substring(0, 50))
      await tracks
      const { events, meta, styles } = this.track(trackNumber)
      if (events.has(subtitle)) return
      const event = this.constructSub(subtitle, meta.type !== 'ass', events.size, styles[subtitle.style ?? 'Default'] ?? 0)
      events.add(subtitle, event)
      if (Number(this.current.value) === Number(trackNumber)) {
        if (this.useDomSubtitles) {
          this.updateDomSubtitles()
          return
        }
        if (!this.jassub) return
        await this.jassub.ready
        if (this.jassub._destroyed) return
        if (meta.type === 'ass') {
          const dialogue = mkvChunkToDialogue(subtitle.text, subtitle.time, subtitle.duration)
          this.jassub.renderer.processData(dialogue)
        } else {
          this.jassub.renderer.createEvent(event)
        }
      }
    }).then(() => {
      console.log('[Subtitles-Debug] subtitles subscription registered OK')
    }).catch(err => { console.error('[Subtitles-Debug] subtitles subscription error:', err) })

    native.attachments(this.selected.hash, this.selected.id).then(async attachments => {
      console.log('[Subtitles-Debug] attachments received:', attachments?.length ?? 'null')
      if (this.useDomSubtitles) return
      const filtered = attachments.filter(attachment => (fontRx.test(attachment.filename) || attachment.mimetype.toLowerCase().includes('font')) && !this.fonts.includes(attachment.url))
      const urls = filtered.map(a => a.url)
      this.fonts.push(...urls)
      if (this.jassub && urls.length) {
        await this.jassub.ready
        if (!this.jassub._destroyed) {
          await this.jassub.renderer.addFonts(urls)
          await this.jassub.resize(true)
        }
      }
    }).catch(err => { console.error('[Subtitles-Debug] attachments error:', err) })
  }

  async handleTransfer (e: { dataTransfer?: DataTransfer | null, clipboardData?: DataTransfer | null } & Event) {
    e.preventDefault()
    const promises = [...(e.dataTransfer ?? e.clipboardData)!.items].map(item => {
      const type = item.type
      return new Promise<File>(resolve => item.kind === 'string' ? item.getAsString(text => resolve(new File([text], 'Subtitle.txt', { type }))) : resolve(item.getAsFile()!))
    })

    for (const file of await Promise.all(promises)) {
      if (subRx.test(file.name)) this.addSingleSubtitleFile(file)
    }
  }

  pickFile () {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = subtitleExtensions.map(ext => '.' + ext).join(',')
    input.multiple = true
    input.addEventListener('change', () => {
      for (const file of input.files ?? []) {
        if (subRx.test(file.name)) this.addSingleSubtitleFile(file)
      }
    })
    input.click()
  }

  async addSingleSubtitleFile (file: File) {
    // lets hope there's no more than 1000 subtitle tracks in a file
    const trackNumber = 1000 + Object.keys(this._tracks.value).length

    const dot = file.name.lastIndexOf('.')
    const extension = file.name.substring(dot + 1).toLowerCase()
    if (!subtitleExtensions.includes(extension)) return
    const filename = file.name.slice(0, dot)
    // sub name could contain video name with or without extension, possibly followed by lang, or not.
    const name = filename.includes(this.selected.name)
      ? filename.replace(this.selected.name, '')
      : filename.replace(this.selected.name.slice(0, this.selected.name.lastIndexOf('.')), '')

    const convert = Subtitles.convertSubText(await file.text(), extension)
    if (!convert) return
    const { header, type } = convert
    const newtrack = this.track(trackNumber)
    newtrack.styles.Default = 0
    newtrack.meta = { type, header, number: '' + trackNumber, name, language: (detectCJKLanguage(header) ?? name.replace(/[,._-]/g, ' ').trim()) || 'Track ' + trackNumber, _compressed: false, default: false, forced: false }
    const styleMatches = header.match(stylesRx)
    if (styleMatches) {
      for (let i = 0; i < styleMatches.length; ++i) {
        newtrack.styles[styleMatches[i]!.replace('Style:', '').trim()] = i + 1
      }
    }
    if (header) {
      const lines = header.split(/\r?\n/)
      for (const line of lines) {
        if (/^Dialogue:/i.test(line)) {
          const parts = line.split(',')
          if (parts.length >= 10) {
            const startMs = parseAssTimeToMs(parts[1] || '')
            const endMs = parseAssTimeToMs(parts[2] || '')
            const style = parts[3] || 'Default'
            const text = parts.slice(9).join(',')
            if (endMs > startMs) {
              const subObj = { text, time: startMs, duration: endMs - startMs, style }
              const evt = this.constructSub(subObj, false, newtrack.events.size, newtrack.styles[style] ?? 0)
              newtrack.events.add(subObj, evt)
            }
          }
        }
      }
    }
    if (this.current.value === -1) {
      await this.initSubtitleRenderer()
      await this.selectCaptions(trackNumber)
    }
  }

  static parseAssText (rawText: string, style?: string): { html: string, isTop: boolean } {
    if (!rawText) return { html: '', isTop: false }
    let text = rawText

    const isTop = style === 'On Top' ||
      /\{[^}]*\\an[789][^}]*\}/i.test(text) ||
      /^\d+,\d+,On Top,/i.test(text) ||
      /^Dialogue:[^,]*,[^,]*,[^,]*,On Top,/i.test(text)

    if (/^Dialogue:/i.test(text)) {
      let idx = 0
      for (let i = 0; i < 9; i++) {
        idx = text.indexOf(',', idx) + 1
        if (idx === 0) break
      }
      if (idx > 0) text = text.slice(idx)
    } else {
      const commaCount = (text.match(/,/g) || []).length
      if (commaCount >= 8 && /^\d+,/.test(text)) {
        let idx = 0
        for (let i = 0; i < 8; i++) {
          idx = text.indexOf(',', idx) + 1
          if (idx === 0) break
        }
        if (idx > 0) text = text.slice(idx)
      }
    }

    text = text
      .replace(/\\N/gi, '<br/>')
      .replace(/\\n/gi, '<br/>')
      .replace(/\\h/gi, '&nbsp;')
      .replace(/\{\\i1\}/gi, '<i>')
      .replace(/\{\\i0\}/gi, '</i>')
      .replace(/\{\\b1\}/gi, '<b>')
      .replace(/\{\\b0\}/gi, '</b>')
      .replace(/\{\\u1\}/gi, '<u>')
      .replace(/\{\\u0\}/gi, '</u>')
      .replace(/\{\\p[1-9]\}[^\{]*\{\\p0\}/gi, '')
      .replace(/\{\\p[1-9]\}.*$/gi, '')
      .replace(/\{[^}]+\}/g, '')
      .trim()

    return { html: text, isTop }
  }

  initDomSubtitleOverlay () {
    if (!this.video) return
    const parent = this.video.parentElement || document.body

    this.domOverlayBottom?.remove()
    this.domOverlayTop?.remove()

    const bottom = document.createElement('div')
    bottom.id = 'hayase-dom-sub-bottom'
    bottom.className = 'hayase-sub-overlay'
    bottom.style.cssText = 'position:absolute;left:4%;right:4%;bottom:8%;display:flex;flex-direction:column;align-items:center;justify-content:center;pointer-events:none;z-index:50;text-align:center;will-change:transform;-webkit-transform:translateZ(0);transform:translateZ(0);'
    parent.appendChild(bottom)
    this.domOverlayBottom = bottom

    const top = document.createElement('div')
    top.id = 'hayase-dom-sub-top'
    top.className = 'hayase-sub-overlay'
    top.style.cssText = 'position:absolute;left:4%;right:4%;top:8%;display:flex;flex-direction:column;align-items:center;justify-content:center;pointer-events:none;z-index:50;text-align:center;will-change:transform;-webkit-transform:translateZ(0);transform:translateZ(0);'
    parent.appendChild(top)
    this.domOverlayTop = top

    const boundUpdate = () => this.updateDomSubtitles()
    this.video.addEventListener('timeupdate', boundUpdate)
    this.video.addEventListener('seeked', boundUpdate)
    this.video.addEventListener('playing', boundUpdate)

    if (this.domInterval) clearInterval(this.domInterval)
    this.domInterval = setInterval(boundUpdate, 40)
  }

  updateDomSubtitles () {
    if (!this.domOverlayBottom || !this.domOverlayTop) return
    const trackId = this.current.value
    if (trackId === -1 || trackId == null) {
      if (this.domOverlayBottom.innerHTML) this.domOverlayBottom.innerHTML = ''
      if (this.domOverlayTop.innerHTML) this.domOverlayTop.innerHTML = ''
      return
    }

    const track = this._tracks.value[trackId]
    if (!track || !track.events) {
      if (this.domOverlayBottom.innerHTML) this.domOverlayBottom.innerHTML = ''
      if (this.domOverlayTop.innerHTML) this.domOverlayTop.innerHTML = ''
      return
    }

    const ct = (this.video?.currentTime ?? 0) + this.timeOffset
    const timeMs = ct * 1000

    let bottomHtml = ''
    let topHtml = ''

    const fontName = STYLE_OVERRIDES[this.set.subtitleStyle]?.FontName || 'Roboto Medium'
    const fontCss = `font-family: '${fontName}', 'Noto Sans', Arial, sans-serif;`

    const vh = this.video?.clientHeight || 1080
    const scale = Math.max(0.6, Math.min(1.4, vh / 1080))
    const fontSize = Math.round(46 * scale)

    const lineStyle = `font-size:${fontSize}px;font-weight:700;color:#ffffff;-webkit-text-stroke:1.5px #000000;text-shadow:-2px -2px 0 #000,2px -2px 0 #000,-2px 2px 0 #000,2px 2px 0 #000,-3px 0 0 #000,3px 0 0 #000,0 -3px 0 #000,0 3px 0 #000,0 4px 12px rgba(0,0,0,0.95);padding:3px 16px;line-height:1.25;max-width:94%;letter-spacing:0.4px;${fontCss};will-change:transform;-webkit-transform:translateZ(0);transform:translateZ(0);`

    let parsedEvents = (track as any)._parsedEvents as Array<{ start: number, end: number, html: string, isTop: boolean }> | undefined
    if (!parsedEvents || (track as any)._parsedEventsVersion !== track.events.size) {
      parsedEvents = []
      if ((track.events as any).map) {
        for (const [keyStr] of (track.events as any).map.entries()) {
          try {
            const obj = JSON.parse(keyStr)
            const parsed = Subtitles.parseAssText(obj.text, obj.style)
            if (parsed.html) {
              parsedEvents.push({
                start: obj.time,
                end: obj.time + obj.duration,
                html: parsed.html,
                isTop: parsed.isTop
              })
            }
          } catch {}
        }
      }
      const t = track as any
      t._parsedEvents = parsedEvents
      t._parsedEventsVersion = track.events.size
    }

    if (parsedEvents) {
      for (let i = 0; i < parsedEvents.length; i++) {
        const ev = parsedEvents[i]!
        if (timeMs >= ev.start && timeMs <= ev.end) {
          const el = `<div style="${lineStyle}">${ev.html}</div>`
          if (ev.isTop) {
            topHtml += el
          } else {
            bottomHtml += el
          }
        }
      }
    }

    if (this.domOverlayBottom.innerHTML !== bottomHtml) {
      this.domOverlayBottom.innerHTML = bottomHtml
    }
    if (this.domOverlayTop.innerHTML !== topHtml) {
      this.domOverlayTop.innerHTML = topHtml
    }
  }

  async initSubtitleRenderer () {
    if (SUPPORTS.isTV || SUPPORTS.isTizen || SUPPORTS.isTizenTV) {
      console.log('[Subtitles] Smart TV detected, using high-performance DOM Subtitle Engine')
      this.useDomSubtitles = true
      this.initDomSubtitleOverlay()
      return
    }

    if (this.jassub) return

    try {
      console.log('[Subtitles-Debug] JASSUB init starting, video el?', !!this.video, 'canvas el?', !!this.canvas, 'fonts:', this.fonts.length)
      if (!this.canvas && this.video) {
        const vw = this.video.videoWidth || 1920
        const vh = this.video.videoHeight || 1080
        const c = document.createElement('canvas')
        c.width = vw
        c.height = vh
        c.className = 'JASSUB'
        c.style.position = 'absolute'
        c.style.top = '0px'
        c.style.left = '0px'
        c.style.width = '100%'
        c.style.height = '100%'
        c.style.zIndex = '20'
        c.style.pointerEvents = 'none'
        this.video.insertAdjacentElement('afterend', c)
        this.canvas = c
      }

      const initialFonts = [
        appBase + 'Roboto.woff2',
        appBase + 'GandhiSans-Bold.woff2',
        appBase + 'NotoSans-Bold.woff2',
        ...this.fonts
      ].filter((f, idx, arr) => f && arr.indexOf(f) === idx)

      this.jassub = new JASSUB({
        video: this.video,
        canvas: (this.canvas as any) || undefined,
        subContent: defaultHeader,
        fonts: initialFonts,
        maxRenderHeight: parseInt(this.set.subtitleRenderHeight) || 0,
        defaultFont: STYLE_OVERRIDES[this.set.subtitleStyle]?.FontName || 'Roboto Medium',
        queryFonts: 'localandremote',
        workerUrl,
        modernWasmUrl,
        wasmUrl,
        availableFonts: AVAILABLE_FONTS
      })

      if (typeof window !== 'undefined') {
        (window as any).__currentSubtitles = this
      }

      await this.jassub.ready
      console.log('[Subtitles-Debug] JASSUB ready! renderer?', !!this.jassub.renderer, '_destroyed?', this.jassub._destroyed)

      // Ensure canvas is properly layered above the video surface
      if (this.jassub._canvas) {
        this.jassub._canvas.style.zIndex = '20'
        this.jassub._canvas.style.pointerEvents = 'none'
      }

      // Wire up video frame synchronization for Smart TV platforms
      if (this.video) {
        const resizeRenderer = () => {
          if (!this.jassub || this.jassub._destroyed) return
          const vw = this.video?.videoWidth || 1920
          const vh = this.video?.videoHeight || 1080
          ;(this.jassub as any)._videoWidth = vw
          ;(this.jassub as any)._videoHeight = vh
          if (this.jassub._canvas) {
            this.jassub._canvas.style.position = 'absolute'
            this.jassub._canvas.style.top = '0px'
            this.jassub._canvas.style.left = '0px'
            this.jassub._canvas.style.width = '100%'
            this.jassub._canvas.style.height = '100%'
            this.jassub._canvas.style.zIndex = '20'
            this.jassub._canvas.style.pointerEvents = 'none'
          }
          this.jassub.resize(true, vw, vh).catch(() => {})
        }

        const renderTime = (force = false) => {
          if (!this.jassub || this.jassub._destroyed || !this.video) return
          const ct = this.video.currentTime || 0
          const vw = this.video.videoWidth || 1920
          const vh = this.video.videoHeight || 1080
          ;(this.jassub as any)._videoWidth = vw
          ;(this.jassub as any)._videoHeight = vh
          this.jassub.manualRender({
            mediaTime: ct + this.jassub.timeOffset,
            expectedDisplayTime: 0,
            width: vw,
            height: vh
          }, force)
        }

        this.video.addEventListener('loadedmetadata', resizeRenderer)
        this.video.addEventListener('canplay', resizeRenderer)
        this.video.addEventListener('resize', resizeRenderer)
        this.video.addEventListener('playing', resizeRenderer)
        this.video.addEventListener('seeked', () => renderTime(true))

        // Initial resize attempt
        resizeRenderer()
      }

      await this._applyStyleOverride(this.set.subtitleStyle)
    } catch (e) {
      console.warn('[Subtitles-Debug] JASSUB init FAILED, falling back to DOM Subtitle Engine:', e)
      this.useDomSubtitles = true
      this.initDomSubtitleOverlay()
    }
  }

  lastSubtitleStyle: typeof defaults.subtitleStyle | undefined = undefined
  async _applyStyleOverride (subtitleStyle: typeof defaults.subtitleStyle) {
    if (!this.jassub || !this.jassub.renderer) return
    if (this.lastSubtitleStyle === subtitleStyle) return
    this.lastSubtitleStyle = subtitleStyle
    if (subtitleStyle !== 'none') {
      const overrideStyle: ASSStyle = {
        Name: 'DialogueStyleOverride',
        FontSize: 72,
        PrimaryColour: 0xFFFFFF00,
        SecondaryColour: 0xFF000000,
        OutlineColour: 0,
        BackColour: 0,
        Bold: 1,
        Italic: 0,
        Underline: 0,
        StrikeOut: 0,
        ScaleY: 1,
        Angle: 0,
        BorderStyle: 1,
        Outline: 4,
        Shadow: 0,
        Alignment: 2,
        MarginL: 135,
        MarginR: 135,
        MarginV: 50,
        Encoding: 1,
        treat_fontname_as_pattern: 0,
        Blur: 0,
        Justify: 0,
        ...STYLE_OVERRIDES[subtitleStyle]
      }
      try {
        await this.jassub.renderer.styleOverride(overrideStyle)
        await this.jassub.renderer.setDefaultFont(overrideStyle.FontName)
      } catch (e) {
        console.warn('[Subtitles] Failed to apply styleOverride:', e)
      }
    } else {
      try {
        await this.jassub.renderer.disableStyleOverride()
        await this.jassub.renderer.setDefaultFont('roboto medium')
      } catch (e) {
        console.warn('[Subtitles] Failed to apply disableStyleOverride:', e)
      }
    }
  }

  track (trackNumber: number | string) {
    const tracks = this._tracks.value

    tracks[trackNumber] ??= {
      events: new HashMap(),
      // @ts-expect-error initializing with empty object
      meta: {},
      styles: {}
    }

    return tracks[trackNumber]!
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructSub (subtitle: any, isNotAss: boolean, subtitleIndex: number, Style: number): ASSEvent {
    let Text = subtitle.text ?? ''
    if (isNotAss) { // converts VTT or other to SSA
      const matches: string[] | null = Text.match(/<[^>]+>/g) // create array of all tags
      if (matches) {
        matches.forEach(match => {
          if (match.includes('</')) { // check if its a closing tag
            Text = Text.replace(match, match.replace('</', '{\\').replace('>', '0}'))
          } else {
            Text = Text.replace(match, match.replace('<', '{\\').replace('>', '1}'))
          }
        })
      }
      // replace all html special tags with normal ones
      Text = Text.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, '\\h').replace(/\r?\n/g, '\\N')
    } else {
      Text = Text.replace(/\r?\n/g, '')
    }
    return {
      Start: subtitle.time,
      Duration: subtitle.duration,
      Style,
      Name: subtitle.name ?? '',
      MarginL: Number(subtitle.marginL) || 0,
      MarginR: Number(subtitle.marginR) || 0,
      MarginV: Number(subtitle.marginV) || 0,
      Effect: subtitle.effect ?? '',
      Text,
      ReadOrder: subtitle.readOrder ?? subtitleIndex,
      Layer: Number(subtitle.layer) || 0
    }
  }

  async selectCaptions (trackNumber: number | string) {
    this.current.value = trackNumber

    if (this.useDomSubtitles) {
      this.updateDomSubtitles()
      return
    }

    if (!this.jassub) return

    await this.jassub.ready
    if (trackNumber === -1) {
      await this.jassub.renderer.setTrack(defaultHeader)
      return await this.jassub.resize()
    }

    const track = this._tracks.value[trackNumber]
    if (!track) return

    lastSelectedTrack = track.meta as any

    const rawHeader = (track.meta.header || defaultHeader).trim()
    const fullHeader = rawHeader.includes('[Events]')
      ? rawHeader
      : `${rawHeader}\n\n[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n`

    await this.jassub.renderer.setTrack(fullHeader)
    if (track.meta?.type === 'ass') {
      let combinedDialogues = ''
      for (const [keyStr] of (track.events as any).map.entries()) {
        try {
          const origSub = JSON.parse(keyStr)
          combinedDialogues += mkvChunkToDialogue(origSub.text, origSub.time, origSub.duration) + '\n'
        } catch {}
      }
      if (combinedDialogues) {
        await this.jassub.renderer.processData(combinedDialogues)
      }
    } else {
      for (const subtitle of track.events) await this.jassub.renderer.createEvent(subtitle)
    }
    const lang = track.meta.language
    if (LANGUAGE_OVERRIDES[lang]) {
      const name = LANGUAGE_OVERRIDES[lang]
      await this.jassub.renderer.setDefaultFont(name)
    } else {
      await this.jassub.renderer.setDefaultFont('roboto medium')
    }
    await this.jassub.resize(true)
  }

  destroy () {
    if (this.domInterval) {
      clearInterval(this.domInterval)
      this.domInterval = null
    }
    this.domOverlayBottom?.remove()
    this.domOverlayBottom = null
    this.domOverlayTop?.remove()
    this.domOverlayTop = null

    this.jassub?.destroy()
    for (const { events } of Object.values(this._tracks.value)) {
      events.clear()
    }
  }

  static convertSubText (text: string, type: string) {
    const srtRx = /(?:\d+\r?\n)?(\S{9,12})\s?-->\s?(\S{9,12})(.*)\r?\n([\s\S]*)$/i
    const srt = (text: string) => {
      const subtitles = []
      const replaced = text.replace(/\r/g, '')
      for (const split of replaced.split(/\r?\n\r?\n/)) {
        const match: string[] | null = split.match(srtRx)
        if (match?.length !== 5) continue
        // timestamps
        match[1] = match[1]!.match(/.*[.,]\d{2}/)![0]
        match[2] = match[2]!.match(/.*[.,]\d{2}/)![0]
        if (match[1].length === 9) {
          match[1] = '0:' + match[1]
        } else {
          if (match[1][0] === '0') {
            match[1] = match[1].substring(1)
          }
        }
        match[1].replace(',', '.')
        if (match[2].length === 9) {
          match[2] = '0:' + match[2]
        } else {
          if (match[2][0] === '0') {
            match[2] = match[2].substring(1)
          }
        }
        match[2].replace(',', '.')
        // create array of all tags
        const matches = match[4]?.match(/<[^>]+>/g)
        if (matches) {
          matches.forEach(matched => {
            if (matched.includes('</')) { // check if its a closing tag
              match[4] = match[4]!.replace(matched, matched.replace('</', '{\\').replace('>', '0}'))
            } else {
              match[4] = match[4]!.replace(matched, matched.replace('<', '{\\').replace('>', '1}'))
            }
          })
        }
        subtitles.push('Dialogue: 0,' + match[1].replace(',', '.') + ',' + match[2].replace(',', '.') + ',Default,,0,0,0,,' + match[4]!.replace(/\r?\n/g, '\\N'))
      }
      return subtitles
    }
    const subRx = /[{[](\d+)[}\]][{[](\d+)[}\]](.+)/i
    const sub = (text: string) => {
      const subtitles = []
      const replaced = text.replace(/\r/g, '')
      let frames = 1000 / Number(replaced.match(subRx)?.[3])
      if (!frames || isNaN(frames)) frames = 41.708
      for (const split of replaced.split('\r?\n')) {
        const match = split.match(subRx)
        if (match) subtitles.push('Dialogue: 0,' + toTS((Number(match[1]) * frames) / 1000, 1) + ',' + toTS((Number(match[2]) * frames) / 1000, 1) + ',Default,,0,0,0,,' + match[3]?.replace('|', '\\N'))
      }
      return subtitles
    }
    if (type === 'ass') {
      return { type: 'ass', header: text }
    } else if (type === 'srt' || type === 'vtt') {
      return { type: 'srt', header: defaultHeader + srt(text).join('\n') }
    } else if (type === 'sub') {
      return { type: 'sub', header: defaultHeader + sub(text).join('\n') }
    } else {
      // subbers have a tendency to not set the extensions at all
      if (text.startsWith('[Script Info]')) return { type: 'ass', header: text }
      if (srtRx.test(text)) return { type: 'srt', header: defaultHeader + srt(text).join('\n') }
      if (subRx.test(text)) return { type: 'sub', header: defaultHeader + sub(text).join('\n') }
    }
  }
}
