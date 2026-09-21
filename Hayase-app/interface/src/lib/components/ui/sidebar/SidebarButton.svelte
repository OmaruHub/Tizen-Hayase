<script lang='ts' context='module'>
  import { cubicInOut } from 'svelte/easing'
  import { crossfade } from 'svelte/transition'

  const [send, receive] = crossfade({
    duration: 150,
    easing: cubicInOut
  })

  const key = 'active-sidebar-tab'
</script>

<script lang='ts'>
  import { goto } from '$app/navigation'
  import { page } from '$app/stores'
  import { Button, type Props } from '$lib/components/ui/button'
  import { cn } from '$lib/utils.js'

  type $$Props = Props
  export let href: string | null | undefined = undefined

  let className: $$Props['class'] = undefined
  export { className as class }

  $: routePath = href ? href.replace(/^(\/#|#)/, '') : ''
  $: isActive = Boolean(routePath && $page.route.id?.startsWith(routePath))

  function handleClick (e: MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!href) return

    // Clean href to strictly be '#/route'
    const route = href.replace(/^[/#]+/, '')
    let cleanHash = '#/' + route

    if (cleanHash === '#/app/settings') {
      cleanHash = '#/app/settings/player'
    } else if (cleanHash === '#/app/profile') {
      cleanHash = '#/app/settings/accounts'
    } else if (cleanHash === '#/app/client') {
      cleanHash = '#/app/client/overview'
    }

    console.log('[TV-Sidebar] Navigating to:', cleanHash)
    try {
      goto(cleanHash)
    } catch (err) {
      console.warn('[TV-Sidebar] goto error:', err)
      location.hash = cleanHash
      window.dispatchEvent(new Event('hashchange'))
    }
  }
</script>

<Button
  data-sidebar-button="true"
  variant={isActive ? 'default' : 'ghost'}
  on:click={handleClick}
  class={cn(className, 'px-2 w-10 relative md:pl-4 md:w-12 md:rounded-l-none group/sidebar duration-300 bg-transparent cursor-pointer')}
  tabindex={0}
  {...$$restProps}
>
  {#if isActive}
    <div class='bg-primary absolute inset-0 rounded-md md:rounded-l-none group-select/sidebar:bg-primary/70 -z-[1]' in:send={{ key }} out:receive={{ key }} />
  {/if}
  <slot />
</Button>

