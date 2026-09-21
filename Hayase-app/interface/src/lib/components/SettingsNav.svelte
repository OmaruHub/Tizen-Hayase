<script lang='ts'>
  import { cubicInOut } from 'svelte/easing'
  import { crossfade } from 'svelte/transition'

  import { goto } from '$app/navigation'
  import { page } from '$app/stores'
  import { Button } from './ui/button'
  import { breakpoints, cn } from '$lib/utils.js'

  let className: string | undefined | null = ''
  export let items: Array<{ href: string, title: string }>
  export { className as class }

  const [send, receive] = crossfade({
    duration: 150,
    easing: cubicInOut
  })

  const key = 'active-settings-tab'

  function handleClick (href: string) {
    if (!href) return
    const route = href.replace(/^[/#]+/, '')
    const cleanHash = '#/' + route
    console.log('[TV-SettingsNav] Navigating to:', cleanHash)
    try {
      goto(cleanHash)
    } catch {
      location.hash = cleanHash
      window.dispatchEvent(new Event('hashchange'))
    }
  }
</script>

<nav class={cn('flex flex-col md:flex-row lg:flex-col gap-y-1 gap-x-2 pb-2 sm:pb-0', className)}>
  {#each items as { href, title }, i (i)}
    {@const cleanPath = href.replace(/^[/#]+/, '')}
    {@const isActive = Boolean($page.route.id && cleanPath.startsWith($page.route.id.replace(/^\//, '')))}
    <Button
      type='button'
      variant={isActive ? 'default' : 'ghost'}
      size={$breakpoints.md ? 'default' : 'lg'}
      class='bg-muted md:bg-transparent relative font-semibold justify-start last:odd:col-span-2 cursor-pointer'
      tabindex={0}
      on:click={() => handleClick(href)}
    >
      {#if isActive}
        <div class='bg-primary absolute inset-0 rounded-md' in:send={{ key }} out:receive={{ key }} />
      {/if}
      <div class='relative transition-colors duration-300'>
        {title}
      </div>
    </Button>
  {/each}
</nav>
