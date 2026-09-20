import type { Plugin } from '@capacitor/core'

export interface MediaMetadata {
  title: string
  description: string
  image: string
  duration: number
}

export interface MediaState {
  state: number
  position: number
  playbackRate: number
}

export interface MediaSessionPlugin extends Plugin {
  setMediaSession: (metadata: MediaMetadata) => Promise<void>
  setPlaybackState: (state: MediaState) => Promise<void>
}
