<script lang='ts'>
  import type { HTMLImgAttributes } from 'svelte/elements'

  import { cn } from '$lib/utils'

  type $$Props = HTMLImgAttributes & { color?: string | null | undefined }

  export let src: $$Props['src'] = ''
  export let alt: $$Props['alt'] = ''
  let className: $$Props['class'] = ''
  export { className as class }

  export let color: string | null | undefined = 'transparent'

</script>

<div class={className}>
  <img {src} {alt} on:load class={cn(className)} decoding='async' loading='lazy' />
</div>
