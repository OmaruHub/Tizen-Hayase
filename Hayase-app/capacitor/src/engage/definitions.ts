import type { Plugin } from '@capacitor/core'

export interface EngageAccount {
  accoundId: string
  profileId?: string
  locale?: string
}

export const PlatformType = {
  UNSPECIFIED: 0,
  ANDROID_TV: 1,
  ANDROID_MOBILE: 2,
  IOS: 3
} as const

export const WatchNextType = {
  UNKNOWN: 0,
  CONTINUE: 1,
  NEXT: 2,
  NEW: 3,
  WATCHLIST: 4
} as const

export interface EngageUri {
  uri: string
  type: typeof PlatformType[keyof typeof PlatformType]
}

export interface EngageImage {
  uri: string
  width: number
  height: number
}

export interface EngageAvailabilityWindow {
  startTimestampMillis: number
  endTimestampMillis: number
}

export interface EngageContentRating {
  rating: string
  agencyName: string
}

export type EngageEntry = EngageTvEpisodeEntry | EngageSeasonEntry | EngageShowEntry | EngageMovieEntry

export type EngageContinueEntry = EngageTvEpisodeEntry | EngageMovieEntry

// https://developer.android.com/guide/playcore/engage/tv
// https://developer.android.com/guide/playcore/engage/recommendations
// https://developer.android.com/guide/playcore/engage/watch#provide-entity-data
interface EngageBase {
  type: string
  availabilityTimeWindows?: EngageAvailabilityWindow[]
  infoPageUri?: string
  contentRatings?: EngageContentRating[]
  entityId?: string
  watchNextType?: typeof WatchNextType[keyof typeof WatchNextType] // REQUIRED ONLY FOR CONTINUATION CLUSTERS
  name: string
  posterImages: EngageImage[]
  lastEngagementTimeMillis?: number // REQUIRED ONLY FOR CONTINUATION CLUSTERS
  lastPlayBackPositionTimeMillis?: number // REQUIRED ONLY FOR CONTINUATION CLUSTERS WHEN WATCHTYPE IS CONTINUE
}

interface EngagePlayback extends EngageBase {
  genres: string[]
  platformSpecificPlaybackUris: EngageUri[]
  downloadedOnDevice?: boolean
  durationMillis: number
}

export interface EngageTvEpisodeEntry extends EngagePlayback {
  type: 'tv_episode'
  isNextEpisodeAvailable?: boolean
  episodeNumber: number
  seasonNumber: string
  showTitle: string
  seasonTitle: string
  airDateEpochMillis: number
}

export interface EngageMovieEntry extends EngagePlayback {
  type: 'movie'
  description: string
  releaseDateEpochMillis: number
}

interface EngageRecommendation extends EngageBase {
  infoPageUri: string
  playBackUri?: string
  genres: string[]
  firstEpisodeAirDateEpochMillis?: number
  latestEpisodeAirDateEpochMillis?: number
}

export interface EngageShowEntry extends EngageRecommendation {
  type: 'tv_show'
  seasonCount: number
}

export interface EngageSeasonEntry extends EngageRecommendation {
  type: 'tv_season'
  seasonNumber: number
  episodeCount: number
}

export interface ContinuationCluster {
  accountProfile: EngageAccount
  entries: EngageContinueEntry[]
}

export interface FeaturedCluster {
  entries: EngageEntry[]
}

export interface RecommendationCluster {
  entries: EngageEntry[]
  title?: string
  subtitle?: string
  actionText?: string
  actionUri?: string
}

export interface RecommendationClusterOptions {
  accountProfile: EngageAccount
  clusters: RecommendationCluster[]
}

export interface EngagePlugin extends Plugin {
  isServiceAvailable: () => Promise<{result: boolean}>
  publishContinuationCluster: (cluster: ContinuationCluster) => Promise<void>
  publishRecommendationCluster: (options: RecommendationClusterOptions) => Promise<void>
  publishFeaturedCluster: (cluster: FeaturedCluster) => Promise<void>
  deleteContinuationCluster: () => Promise<void>
  deleteFeaturedCluster: () => Promise<void>
  deleteRecommendationClusters: () => Promise<void>
}
