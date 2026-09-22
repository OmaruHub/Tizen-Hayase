<script lang='ts' context='module'>
  import { writable } from 'svelte/store'

  import { searchStore } from '$lib'

  export const defaultPlayEp = (media: Media, episode: number) => searchStore.set({ media, episode })
  export const playEp = writable(defaultPlayEp)
</script>

<script lang='ts'>
  import { onDestroy } from 'svelte'
  import Castplayer, { activeDisplay } from './castplayer.svelte'
  import Externalplayer from './externalplayer.svelte'
  import Player from './player.svelte'

  import type { MediaInfo } from '$lib/components/ui/player/util'
  import type { resolveFilesPoorly, ResolvedFile } from './resolver'

  import { goto } from '$app/navigation'
  import { cover, episodes, title, type Media } from '$lib/modules/anilist'
  import { fillerEpisodes } from '$lib/modules/extensions'
  import { settings } from '$lib/modules/settings'
  import { server } from '$lib/modules/torrent'
  import { w2globby } from '$lib/modules/w2g/lobby'

  export let mediaInfo: NonNullable<Awaited<ReturnType<typeof resolveFilesPoorly>>>

  function fileToMedaInfo (file: ResolvedFile): MediaInfo {
    return {
      file,
      episode: Number(file.metadata.episode),
      media: file.metadata.media,
      session: {
        title: title(file.metadata.media),
        description: `Episode ${file.metadata.episode} / ${episodes(file.metadata.media) || '?'}`,
        image: cover(file.metadata.media) ?? ''
      }
    }
  }

  let current = fileToMedaInfo(mediaInfo.target)
  let lastTargetKey = (mediaInfo?.target?.hash || '') + '_' + (mediaInfo?.target?.metadata?.episode || '')
  $: {
    const newTargetKey = (mediaInfo?.target?.hash || '') + '_' + (mediaInfo?.target?.metadata?.episode || '')
    if (mediaInfo?.target && newTargetKey !== lastTargetKey) {
      lastTargetKey = newTargetKey
      current = fileToMedaInfo(mediaInfo.target)
    }
  }

  $: $w2globby?.mediaIndexChanged(mediaInfo.resolvedFiles.indexOf(current.file))
  $: $w2globby?.on('index', index => {
    const file = mediaInfo.resolvedFiles[index]
    if (file) {
      mediaInfo.target = file
      lastTargetKey = (file.hash || '') + '_' + (file.metadata?.episode || '')
      current = fileToMedaInfo(file)
    }
  })

  function hasNext (file: MediaInfo) {
    const currentIndex = mediaInfo.targetAnimeFiles?.findIndex(f => f.id === file.file.id || f.name === file.file.name) ?? -1
    if (currentIndex !== -1 && currentIndex < (mediaInfo.targetAnimeFiles?.length ?? 0) - 1) return true
    return Number(file.episode) < (episodes(file.media) || Infinity)
  }
  function hasPrev (file: MediaInfo) {
    const currentIndex = mediaInfo.targetAnimeFiles?.findIndex(f => f.id === file.file.id || f.name === file.file.name) ?? -1
    if (currentIndex > 0) return true
    return Number(file.episode) > 1
  }
  function playNext () {
    let episode = parseInt('' + current.episode) + 1
    if ($settings.playerSkipFiller) {
      while (fillerEpisodes[current.media.id]?.includes(episode)) {
        episode++
      }
      episode = Math.min(episode, episodes(current.media) || Infinity)
    }
    playEpisode(current.media, episode)
  }
  function playPrev () {
    let episode = parseInt('' + current.episode) - 1
    if ($settings.playerSkipFiller) {
      while (fillerEpisodes[current.media.id]?.includes(episode)) {
        episode--
      }
      episode = Math.max(1, episode)
    }
    playEpisode(current.media, episode)
  }

  function playEpisode (media: Media, episode: number) {
    const isPlayerActive = typeof location !== 'undefined' && location.hash.includes('/app/player')
    // If not currently inside the player, always open the torrent search modal so the user can choose a torrent
    if (!isPlayerActive) {
      return searchStore.set({ media, episode })
    }

    if (episode === current.episode && media.id === current.media.id) return searchStore.set({ media, episode })
    const targetEpisodeNum = Number(episode)
    const currentIndex = mediaInfo.targetAnimeFiles?.findIndex(f => f.id === current.file.id || f.name === current.file.name) ?? -1
    let file = mediaInfo.targetAnimeFiles?.find(res => Number(res.metadata.episode) === targetEpisodeNum)
      ?? mediaInfo.resolvedFiles.find(res => Number(res.metadata.episode) === targetEpisodeNum && (!media?.id || res.metadata.media?.id === media.id))
      ?? mediaInfo.resolvedFiles.find(res => Number(res.metadata.episode) === targetEpisodeNum)

    if (!file && currentIndex !== -1 && mediaInfo.targetAnimeFiles) {
      if (episode > current.episode && currentIndex + 1 < mediaInfo.targetAnimeFiles.length) {
        file = mediaInfo.targetAnimeFiles[currentIndex + 1]
      } else if (episode < current.episode && currentIndex - 1 >= 0) {
        file = mediaInfo.targetAnimeFiles[currentIndex - 1]
      }
    }

    if (file) {
      mediaInfo.target = file
      lastTargetKey = (file.hash || '') + '_' + (file.metadata?.episode || '')
      current = fileToMedaInfo(file)
      server.last.update(last => ({ media: current.media, episode: current.episode, id: last!.id }))
      if (typeof location !== 'undefined' && !location.hash.includes('/app/player')) {
        goto('/#/app/player')
      }
    } else {
      searchStore.set({ media, episode })
    }
  }

  $: $playEp = playEpisode

  onDestroy(() => {
    $playEp = defaultPlayEp
  })

  function selectFile (file: ResolvedFile) {
    mediaInfo.target = file
    lastTargetKey = (file.hash || '') + '_' + (file.metadata?.episode || '')
    current = fileToMedaInfo(file)
    server.last.update(last => ({ media: current.media, episode: current.episode, id: last!.id }))
  }

  $: next = hasNext(current)
    ? playNext
    : undefined

  $: prev = hasPrev(current)
    ? playPrev
    : undefined
</script>

<!-- TODO: inefficient, but safe -->
{#key current}
  {#if $settings.enableExternal}
    <Externalplayer mediaInfo={current} videoFiles={mediaInfo.resolvedFiles} {selectFile} {prev} {next} />
  {:else if $activeDisplay}
    <Castplayer mediaInfo={current} videoFiles={mediaInfo.resolvedFiles} {selectFile} {prev} {next} />
  {:else}
    <Player mediaInfo={current} otherFiles={mediaInfo.otherFiles} videoFiles={mediaInfo.resolvedFiles} {selectFile} {prev} {next} />
  {/if}
{/key}
