# Offline Mode

## How Offline Mode Works

Hayase doesn't require you to manually enable offline mode. Instead, the app automatically detects when you lose internet connectivity and displays an "Offline" indicator at the top of the interface.

Behind the scenes, Hayase continuously caches all data it encounters for **2 weeks**. This means that if you lose internet access at any point, the app will seamlessly fall back to this cached data and continue functioning normally. You don't need to prepare anything in advance - offline mode works dynamically based on what you've already viewed or downloaded.

### Cache Management

The app intelligently manages its cache to balance functionality with storage usage:

* **Metadata and text data** are automatically cached as you browse
* **Images and banners** may not be cached due to their large file sizes
* **Cache expires after 2 weeks** to keep data fresh and save storage space

You can monitor cache age through the library view, which displays the last played date for each torrent. If this date appears **yellow or red**, the cached metadata for that torrent may have expired, potentially preventing playback while offline. To refresh the cache, simply play the torrent while you have an internet connection.

## What Works Without Internet

When offline, Hayase provides the following functionality:

### Metadata

* You can still view all anime, thread, comments, and anime search results that were previously cached while online in the past 2 weeks
* You can still create and manage your lists, but changes won't sync until you're back online
* You can still view and edit your profile information, but changes won't sync until you're back online
* You can create comments and threads, but they won't be posted until you're back online

### Playback

* **Downloaded torrents** in your library can be played normally
* **Cached anime information** remains accessible
* **Previously viewed episodes** with cached metadata will work

### Library Access

* The library view displays all downloaded torrents
* Click any downloaded torrent to play it without using the episode search
* View last played dates to check cache freshness

### Torrent Search Functionality

* Torrent search results will show **existing downloaded library entries**
* **Extensions with offline support** may still return results if they:
  * Have their own offline handling mechanisms
  * Work from local data sources
* Most extensions won't return new results while offline

## Limitations

While Hayase works remarkably well offline, there are some limitations to be aware of:

### Content Discovery

* You cannot discover or search for **new anime** that isn't already cached
* Extension results will be limited to what's stored locally
* New torrent lookups won't be available

### Media Assets

* **Images and banners** may not display if they weren't previously cached
* Thumbnails for episodes you haven't viewed may be missing

### Expired Cache

* Torrents with expired cache (indicated by yellow/red dates) may fail to play
* Metadata older than 2 weeks will need to be refreshed when online

## Recommendations for Offline Use

To get the most out of offline mode, consider these settings:

1. **Enable Persist Storage**: Prevents torrents from being deleted, allowing you to accumulate a library of content to watch later. Without this, you won't be able to build up downloaded content for offline viewing.
2. **Disable Streamed Download**: Allows you to download entire batches of episodes rapidly instead of streaming them on-demand. This ensures you have complete episodes available offline.
3. **Pre-cache Content**: While online, browse through anime you want to watch offline to ensure their metadata is cached.
4. **Monitor Cache Age**: Check the library view for yellow or red dates, and refresh those torrents while online to maintain offline availability.
