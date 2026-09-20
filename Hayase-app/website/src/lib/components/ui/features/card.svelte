<script lang='ts'>
  import { cn } from '$lib/utils'

  export let image: string
  export let title: string
  export let description: string
  export let imageMode: 'cover' | 'contain' = 'contain'

  let className = ''
  export { className as class }
</script>

<div class={cn('bg-neutral-950 rounded-lg shadow pt-3 px-6 flex flex-col col-span-1 h-[500px] min-h-0', className)}>
  <h4 class='text-center font-bold text-white text-2xl mt-2'>{title}</h4>
  <p class='my-3 text-muted-foreground text-sm text-center whitespace-pre-wrap leading-normal'>{description}</p>
  <div class='grow w-full overflow-clip flex relative min-h-0'>
    <div class='overlay-gradient-top-bottom pointer-events-none absolute top-0 left-0 w-full h-full z-50' />
    <img src={image} alt={image.substring(0, image.length - 5)} class='w-full h-full {imageMode === 'cover' ? 'object-cover' : 'object-contain'}' />
  </div>
</div>

<style>
  .overlay-gradient-top-bottom {
    background: linear-gradient(0deg, #0a0a0a, #0a0a0a00 30%, #0a0a0a00 70%, #0a0a0a);
  }
</style>
