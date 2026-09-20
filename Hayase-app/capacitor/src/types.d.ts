declare module 'bridge' {
  export interface BridgeChannel<T = unknown> {
    on: (event: string, listener: (data: T) => void) => void
    removeListener: (event: string, listener: (data: T) => void) => void
    send: (channel: string, message: T) => void
  }
  export const channel: BridgeChannel
}
