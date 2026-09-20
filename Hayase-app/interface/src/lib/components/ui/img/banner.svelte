<script lang='ts'>
  import { Load } from '.'

  import type { HTMLAttributes } from 'svelte/elements'

  import { banner, cover, title, type Media } from '$lib/modules/anilist'
  import { episodesCached } from '$lib/modules/anizip'
  import { breakpoints } from '$lib/utils'
  import SUPPORTS from '$lib/modules/settings/supports'

  export let media: Media

  type $$Props = HTMLAttributes<HTMLImageElement> & { media: Media }

  $: isDesktopOrTV = Boolean($breakpoints.md || SUPPORTS.isTV || SUPPORTS.isTizen || SUPPORTS.isTizenTV)
  $: src = isDesktopOrTV ? banner(media) : cover(media)
  $: isYoutube = src?.startsWith('https://i.ytimg.com/')
  let className: $$Props['class'] = ''
  export { className as class }

  // hq720 or maxresdefault is highest, but default so omitted
  const sizes = ['sddefault', 'hqdefault', 'mqdefault', 'default']
  let sizeAttempt = 0

  function verifyThumbnail (e: Event) {
    if (!isYoutube) return
    const img = e.target as HTMLImageElement
    if (img.naturalWidth === 120 && img.naturalHeight === 90) {
      img.src = `https://i.ytimg.com/vi/${media.trailer?.id}/${sizes[sizeAttempt++]}.jpg`
    }
  }

  $: id = media.id
</script>

{#if SUPPORTS.isTV || SUPPORTS.isTizen || SUPPORTS.isTizenTV}
  {#if src}
    <Load {src} alt={title(media)} class={className} on:load={verifyThumbnail} />
  {/if}
{:else if isDesktopOrTV}
  {#await episodesCached(id)}
    {#if src}
      <Load {src} alt={title(media)} class={className} on:load={verifyThumbnail} />
    {/if}
  {:then metadata}
    {@const banner = metadata?.backdrops?.sort((a, b) => b.vote_average - a.vote_average).find(i => i.iso_639_1 == null && i.aspect_ratio > 1.2)?.file_path}
    {@const cover = metadata?.posters?.sort((a, b) => b.vote_average - a.vote_average).find(i => i.iso_639_1 == null && i.aspect_ratio > 1.2)?.file_path}
    {@const fallback = banner || cover}
    {#if fallback}
      <Load src={fallback} alt={title(media)} class={className} />
    {:else if src}
      <Load {src} alt={title(media)} class={className} on:load={verifyThumbnail} />
    {/if}
  {:catch}
    {#if src}
      <Load {src} alt={title(media)} class={className} on:load={verifyThumbnail} />
    {/if}
  {/await}
{:else if src}
  <Load {src} alt={title(media)} class={className} on:load={verifyThumbnail} />
{/if}
