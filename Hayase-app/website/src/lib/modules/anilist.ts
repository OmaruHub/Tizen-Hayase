// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Media = any

export function progress (media: Pick<Media, 'mediaListEntry' | 'id'>): number | undefined {
  return media.mediaListEntry?.progress ?? undefined
}

export function of (media: Pick<Media, 'aired' | 'notaired' | 'episodes' | 'mediaListEntry' | 'id'>): string | undefined {
  const count = episodes(media)
  if (count === 1 || !count) return

  const prog = progress(media)
  if (!prog || prog === count) return `${count} Episodes`

  return `${prog} / ${count} Episodes`
}

export function banner (media: Pick<Media, 'trailer' | 'bannerImage' | 'coverImage'>): string | undefined {
  if (media.bannerImage) return media.bannerImage
  if (media.trailer?.id) return `https://i.ytimg.com/vi/${media.trailer.id}/maxresdefault.jpg`
  return media.coverImage?.extraLarge as string | undefined
}

export function title (media: Pick<Media, 'title'>): string {
  return media.title?.userPreferred ?? 'TBA'
}

export function fav (media: Pick<Media, 'isFavourite' | 'id'>): boolean {
  return media.isFavourite
}

export function coverMedium (media: Pick<Media, 'trailer' | 'bannerImage' | 'coverImage'>): string | undefined {
  return media.coverImage?.medium?.replace('/small/', '/medium/') ?? banner(media)
}

const RELATION_MAP = {
  ADAPTATION: 'Adaptation',
  PREQUEL: 'Prequel',
  SEQUEL: 'Sequel',
  PARENT: 'Parent',
  SIDE_STORY: 'Side Story',
  CHARACTER: 'Character',
  SUMMARY: 'Summary',
  ALTERNATIVE: 'Alternative',
  SPIN_OFF: 'Spin Off',
  OTHER: 'Other',
  SOURCE: 'Source',
  COMPILATION: 'Compilation',
  CONTAINS: 'Contains'
}

export function relation (relation: 'ADAPTATION' | 'PREQUEL' | 'SEQUEL' | 'PARENT' | 'SIDE_STORY' | 'CHARACTER' | 'SUMMARY' | 'ALTERNATIVE' | 'SPIN_OFF' | 'OTHER' | 'SOURCE' | 'COMPILATION' | 'CONTAINS' | null) {
  if (!relation) return 'N/A'
  return RELATION_MAP[relation]
}

const FORMAT_MAP = {
  TV: 'TV Series',
  TV_SHORT: 'TV Short',
  MOVIE: 'Movie',
  SPECIAL: 'Special',
  OVA: 'OVA',
  ONA: 'ONA',
  MUSIC: 'Music',
  MANGA: 'Manga',
  NOVEL: 'Novel',
  ONE_SHOT: 'One Shot'
}

export function format (media: Pick<Media, 'format'>): string {
  // @ts-expect-error yes
  if (media.format != null) return FORMAT_MAP[media.format]

  return 'N/A'
}

export function list (media: Media): 'CURRENT' | 'PLANNING' | 'COMPLETED' | 'DROPPED' | 'PAUSED' | 'REPEATING' | null | undefined {
  return media.mediaListEntry?.status
}

export function episodes (media: Pick<Media, 'aired' | 'notaired' | 'episodes' | 'mediaListEntry' | 'id'>): number | undefined {
  if (media.episodes) return media.episodes

  const upcoming = media.aired?.n?.[media.aired.n.length - 1]?.e ?? 0
  const past = media.notaired?.n?.[media.notaired.n.length - 1]?.e ?? 0
  const progress = media.mediaListEntry?.progress ?? 0

  return Math.max(upcoming, past, progress)
}

export function season (media: Pick<Media, 'season' | 'seasonYear'>) {
  return [media.season?.toLowerCase(), media.seasonYear].filter(s => s).join(' ')
}

export function duration (media: Pick<Media, 'duration'>) {
  if (!media.duration) return
  return `${media.duration} Minute${media.duration > 1 ? 's' : ''}`
}

export function desc (media: Pick<Media, 'description'>) {
  return notes(media.description?.replace(/<[^>]+>/g, '').replace(/\n+/g, '\n') ?? 'No description available.')
}

export function notes (string: string) {
  return string.replace(/\n?\(?Source: [^)]+\)?\n?/m, '').replace(/\n?Notes?:[ |\n][^\n]+\n?/m, '')
}
