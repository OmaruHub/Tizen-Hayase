import type { Writable } from 'svelte/store'

export const DIALOG_KEY = Symbol('dialog-key')

export type DialogContext = Writable<{
  open: boolean
  portal: string | HTMLElement
  openDialog: () => void
  closeDialog: () => void
}>
