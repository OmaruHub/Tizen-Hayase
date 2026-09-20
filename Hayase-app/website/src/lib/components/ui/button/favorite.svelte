<script lang='ts'>
  import Heart from 'lucide-svelte/icons/heart'

  import type { Media } from '$lib/modules/anilist'

  import { Button, iconSizes, type Props } from '$lib/components/ui/button'
  import { fav } from '$lib/modules/anilist'

  type $$Props = Props & { media: Media }

  let className: $$Props['class'] = ''
  export { className as class }
  export let media: Media
  export let size: NonNullable<$$Props['size']> = 'icon-sm'
  export let variant: NonNullable<$$Props['variant']> = 'ghost'

</script>

<Button {size} {variant} class={className}>
  <Heart fill={fav(media) ? 'currentColor' : 'transparent'} size={iconSizes[size]} />
</Button>
