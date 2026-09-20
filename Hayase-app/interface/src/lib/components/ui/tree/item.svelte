<script lang='ts'>
  import ChevronRight from 'lucide-svelte/icons/chevron-right'

  import { getMenuContext, getLevelContext } from './context.ts'

  const { state, setActive, setInactive } = getMenuContext()
  const levelStore = getLevelContext()

  export let id: string = ''
  const stableId = id || crypto.randomUUID()
  $: currentId = id || stableId

  export let active = false
  $: level = $levelStore
  $: isActive = $state[level] === currentId
  $: showSubmenu = isActive

  $: activeSibling = $state[level]

  $: hasSub = $$slots.trigger

  import { tick } from 'svelte'

  let container: HTMLDivElement
  let buttonEl: HTMLButtonElement

  async function handleClick (e?: MouseEvent) {
    if (e) {
      e.stopPropagation()
    }
    if (hasSub) {
      if (isActive) {
        setInactive(level)
      } else {
        setActive(currentId, level)
        await tick()
        setTimeout(() => {
          const firstSubButton = container?.querySelector<HTMLButtonElement>('.tree-sub button')
          if (firstSubButton) {
            firstSubButton.focus()
          }
        }, 50)
      }
    } else {
      setInactive(level)
    }
  }

  function handleKeydown (e: KeyboardEvent) {
    if (e.key === 'ArrowLeft') {
      if (level > 0) {
        e.preventDefault()
        e.stopPropagation()
        setInactive(level)
        setTimeout(() => {
          const parentBtn = container?.closest('.tree-sub')?.parentElement?.querySelector<HTMLButtonElement>('button')
          if (parentBtn) parentBtn.focus()
        }, 50)
      }
    } else if (e.key === 'ArrowRight' && hasSub && !isActive) {
      e.preventDefault()
      e.stopPropagation()
      handleClick()
    }
  }
</script>

<div class='relative' bind:this={container}>
  <button class='w-full hover:bg-accent hover:text-accent-foreground flex select-none items-center rounded-sm py-2.5 leading-none font-bold text-sm outline-none pl-4 cursor-pointer text-left my-0.5'
    bind:this={buttonEl}
    on:keydown={handleKeydown}
    on:click={handleClick}
    on:click
    class:!bg-primary={isActive || active} class:!text-background={isActive || active}
    class:opacity-30={activeSibling}
    data-open={isActive}>
    {#if hasSub}
      <slot name='trigger' />
      <ChevronRight class='ml-auto h-4 w-4 mx-2' />
    {:else}
      <slot />
    {/if}

  </button>

  {#if showSubmenu && hasSub}
    <slot />
  {/if}
</div>
