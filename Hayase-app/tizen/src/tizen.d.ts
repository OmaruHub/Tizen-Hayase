declare const tizen: any
declare const webapis: any

declare module 'chromecast-caf-receiver/cast.framework.messages' {
  export interface MediaInformation {
    contentId?: string
    contentType?: string
    streamType?: string
    metadata?: any
    duration?: number
    customData?: any
    [key: string]: any
  }
}
