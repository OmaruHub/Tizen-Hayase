<script lang='ts'>
  import { onMount } from 'svelte'

  import { Button } from '../button'
  import Play from '../icons/Play.svelte'

  import * as Dialog from '$lib/components/ui/dialog'

  let container: HTMLDivElement
  let top = 0
  let left = 0
  /** @param {MouseEvent} param0 */
  function followMouse ({ clientX, clientY }: MouseEvent) {
    if (!clientX || !clientY) return
    const containerRect = container.getBoundingClientRect()
    left = clientX - containerRect.left
    top = clientY - containerRect.top
  }

  let mounted = false
  onMount(() => {
    mounted = true
  })
</script>

{#if mounted}
  <Dialog.Root>
    <Dialog.Trigger class='no-scale contents'>
      <div class='relative play-container group' on:mousemove={followMouse} on:wheel={followMouse} bind:this={container} style:--left={left + 'px'} style:--top={top + 'px'}>
        <Button variant='ghost' class='left-1/2 top-1/2 group-hover:left-[clamp(0px,var(--left),100%)] group-hover:top-[clamp(0px,var(--top),100%)]
          absolute backdrop-blur size-10 -translate-x-1/2 -translate-y-1/2 transform-gpu rounded-full z-10 hover:bg-primary/30 no-scale [offset-position:center]
          group-hover:transition-[background] transition-all shadow group-hover:shadow-none shadow-white px-0'>
          <Play fill='currentColor' size='0.9rem' class='ml-0.5' />
        </Button>
        <img src='app.webp' alt='app' class='max-w-full object-contain aspect-[2/1] px-5 w-full' />
        <div class='overlay-gradient absolute px-4 top-0 left-0 w-full h-full pointer-events-none' />
      </div>
    </Dialog.Trigger>
    <Dialog.Content class='p-0 max-w-[unset] !w-auto'>
      <video src='https://raw.githubusercontent.com/hayase-app/website/main/docs/showcase.mp4' controls class='w-[1000px]' />
    </Dialog.Content>
  </Dialog.Root>
{:else}
  <div class='relative play-container group'>
    <Button variant='ghost' class='left-1/2 top-1/2
      absolute backdrop-blur size-10 -translate-x-1/2 -translate-y-1/2 transform-gpu rounded-full z-10 hover:bg-primary/30 no-scale [offset-position:center]
      group-hover:transition-[background] transition-all shadow group-hover:shadow-none shadow-white px-0'>
      <Play fill='currentColor' size='0.9rem' class='ml-0.5' />
    </Button>
    <img src='app.webp' alt='app' class='max-w-full object-contain aspect-[2/1] px-5 w-full' />
    <div class='overlay-gradient absolute px-4 top-0 left-0 w-full h-full pointer-events-none' />
  </div>
{/if}

<style>
  .overlay-gradient {
    background: linear-gradient(0deg, #000 15.27%, rgba(0, 0, 0, 0.92) 41.28%, rgba(0, 0, 0, 0.25) 74.32%);
  }
</style>
