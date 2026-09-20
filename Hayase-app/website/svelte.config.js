import adapter from '@sveltejs/adapter-static'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // @ts-expect-error no typedef for this
  onwarn: (warning, handler) => {
    if (warning.code === 'a11y_media_has_caption') return
    if (warning.code === 'element_invalid_self_closing_tag') return
    handler(warning)
  },
  preprocess: vitePreprocess({}),
  kit: {
    adapter: adapter({ fallback: '404.html' }),
    prerender: {
      concurrency: 1,
      crawl: true,
      entries: ['*'],
      origin: 'https://hayase.watch'
    },
    alias: {
      'lucide-svelte/dist/Icon.svelte': './node_modules/lucide-svelte/dist/Icon.svelte'
    }
  },
  runtime: ''
}

export default config
