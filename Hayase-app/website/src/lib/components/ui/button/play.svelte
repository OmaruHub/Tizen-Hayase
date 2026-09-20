<script lang='ts'>
  import Play from 'lucide-svelte/icons/play'

  import { Button, iconSizes, type Props } from '$lib/components/ui/button'
  import { list, type Media } from '$lib/modules/anilist'
  import { cn } from '$lib/utils'

  type $$Props = Props & { media: Media }

  let className: $$Props['class'] = ''
  export { className as class }
  export let media: Media
  export let size: NonNullable<$$Props['size']> = 'xs'
</script>

<Button class={cn(className, 'font-bold flex items-center justify-center')} {size}>
  <Play fill='currentColor' class='mr-2' size={iconSizes[size]} />
  {@const status = list(media)}
  {#if status === 'COMPLETED'}
    Rewatch Now
  {:else if status === 'CURRENT' || status === 'REPEATING' || status === 'PAUSED'}
    Continue
  {:else}
    Watch Now
  {/if}
</Button>
