// See https://kit.svelte.dev/docs/types#app
import type { CompositionEventHandler } from 'svelte/elements'

// for information about these interfaces

declare global {

  namespace App {
    // interface Error {}
    // interface Locals {}
    // interface PageData {}

    // interface PageState {}
    // interface Platform {}
  }

  // interface Navigator {
  //   userAgentData: {
  //     getHighEntropyValues: (keys: string[]) => Promise<Record<string, string>>
  //   }
  // }

  declare namespace svelteHTML {
    interface HTMLAttributes<T> {
      'on:navigate'?: CompositionEventHandler<T>
    }
  }

  // declare module '*.svelte' {
  //   export default SvelteComponentTyped
  // }
}

export {}
