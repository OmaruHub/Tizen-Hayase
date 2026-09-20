# Settings Reference

This page provides a comprehensive reference for all settings available in Hayase.

## Account Settings

### AniList

* **Enable Sync**: Enable synchronization with your AniList account
* **Title Language**: What title language to use throughout the app
  * Romaji (e.g., Shingeki no Kyojin)
  * English (e.g., Attack on Titan)
  * Native (e.g., 進撃の巨人)
  * Romaji Stylised
  * English Stylised
  * Native Stylised
* **Adult Content**: Shows hentai content on AniList (account-level setting)

### Kitsu

* **Enable Sync**: Enable synchronization with your Kitsu account

### MyAnimeList

* **Enable Sync**: Enable synchronization with your MyAnimeList account

### Local Library

* **Enable Sync**: Enable local library functionality for offline tracking

## App Settings

### General

* **Hide App To Tray** (Desktop only): Makes the app hide to tray instead of closing when you close the window. Useful if you want to keep the torrent client open in the background to seed/leech.

### Debug Settings

* **Logging Levels**: Enable logging of specific parts of the app. These logs are saved to `%appdata%/Hayase/logs/main.log` or `~/config/Hayase/logs/main.log`.
  * None: No logging
  * All: Log everything
  * Torrent: Log torrent-related operations only
  * Interface: Log UI-related operations only

## Interface Settings

### Rich Presence (Desktop only)

* **Show Details in Discord Rich Presence**: Shows currently played anime and episode in Discord rich presence.

### Visibility Settings

* **Show Hentai**: Shows hentai content throughout the app. If disabled, all hentai content will be hidden and not shown in search results, but shown if present in your list. Note: This is also an AniList account setting, so make sure it is enabled in account settings as well to avoid inconsistencies.
* **Hide Spoilers**: Hides potential spoilers such as titles, descriptions, episode images and ratings throughout the app.

### UI Settings

* **UI Scale**: Change the zoom level of the interface. Range: 0.3 to 2.5
* **Navigation Buttons**: Show backwards/forwards navigation buttons for when mouse buttons aren't available.
* **ANGLE Backend** (Desktop only): What ANGLE backend to use for rendering. **DON'T CHANGE WITHOUT REASON!** On some Windows machines D3D9 might help with flicker. Changing this setting to something your device doesn't support might prevent Hayase from opening which will require a full reinstall. While Vulkan is an available option it might not be fully supported on Linux.
  * Default
  * D3D9
  * D3D11
  * Warp
  * GL
  * GLES
  * SwiftShader
  * Vulkan
  * Metal

## Extension Settings

### Lookup Settings

* **Torrent Quality**: What quality to use when trying to find torrents. "None" might rarely find less results than specific qualities. This doesn't exclude other qualities from being found like 4K or weird DVD resolutions. Non-1080p resolutions might not be available for all shows, or find way less results.
* **Auto-Select Torrents**: Automatically selects torrents based on quality and amount of seeders. Disable this to have more precise control over played torrents.
* **Lookup Preference**: What to prioritize when looking for and sorting results.
  * Quality: Focus on the best quality available (often means big file sizes)
  * Size: Focus on the smallest file size available
  * Availability: Pick results with the most peers regardless of size and quality

## Client Settings

### Security Settings

* **Use DNS Over HTTPS**: Enables DNS Over HTTPS, useful if your ISP blocks certain domains. On Android this is a system setting that cannot be changed here. It's usually named 'Private DNS' or 'DNS over HTTPS'.
* **DNS Over HTTPS URL** (Desktop only): What URL to use for querying DNS Over HTTPS.

### Torrent Client Settings

* **Torrent Download Location**: Path to the folder used to store torrents. By default this is the OS's TEMP/TMP cache folder, which might lose data when your OS tries to reclaim storage. On Android, SD Card saves to the card's Download folder. If SD Card is not available, torrents will automatically be saved to the phone's Downloads folder.
* **Persist Files**: Keeps torrent files instead of deleting them after a new torrent is played. This doesn't seed the files, only keeps them on your drive. This will quickly fill up your storage.
* **Streamed Download**: Only downloads the data that's directly needed for playback, down to the minute, instead of downloading an entire batch of episodes. Will not buffer ahead more than a few seconds, and will stop downloading once the few second buffer is filled. Saves bandwidth and reduces strain on the peer swarm.
* **Transfer Speed Limit**: Download/Upload speed limit for torrents in Mb/s. Higher values increase CPU usage, and values higher than your storage write speeds will quickly fill up RAM. Range: 1 to 50 Mb/s
* **Max Number of Connections**: Number of peers per torrent. Higher values will increase download speeds but might quickly fill up available ports if your ISP limits the maximum allowed number of open connections. Range: 1 to 512
* **Forwarded Torrent Port**: Forwarded port used for incoming torrent connections. 0 automatically finds an open unused port. Change this to a specific port if you forwarded manually, or if you use a VPN. Range: 0 to 65536
* **DHT Port**: Port used for DHT connections. 0 is automatic. Range: 0 to 65536
* **Disable DHT**: Disables Distributed Hash Tables for use in private trackers to improve privacy. Might greatly reduce the amount of discovered peers.
* **Disable PeX**: Disables Peer Exchange for use in private trackers to improve privacy. Might greatly reduce the amount of discovered peers.

## Playback Settings

### Subtitle Settings

* **Find Missing Subtitle Fonts**: Automatically finds and loads fonts that are missing from a video's subtitles, using fonts installed on your OS.
* **Subtitle Render Resolution Limit**: Max resolution to render subtitles at. If your resolution is higher than this setting, the subtitles will be upscaled linearly. This will GREATLY improve rendering speeds for complex typesetting for slower devices. It's best to lower this on mobile devices which often have high pixel density where their effective resolution might be ~1440p while having small screens and slow processors.
* **Subtitle Dialogue Style Overrides**: Selectively override the default dialogue style for subtitles. This will not change the style of typesetting (fancy 3D signs and songs). **Warning**: The heuristic used for deciding when to override the style is rather rough, and enabling this option can lead to incorrectly rendered subtitles.
  * None
  * Gandhi Sans Bold
  * Noto Sans Bold
  * Roboto Bold

### Language Settings

* **Preferred Subtitle Language**: What subtitle language to automatically select when a video is loaded if it exists. This won't find torrents with this language automatically. If not found defaults to English.
* **Preferred Audio Language**: What audio language to automatically select when a video is loaded if it exists. This won't find torrents with this language automatically. If not found defaults to Japanese.

### Playback Behavior

* **Auto-Play Next Episode**: Automatically starts playing next episode when a video ends.
* **Pause On Lost Visibility**: Pauses/Resumes video playback when the app loses visibility.
* **PiP On Lost Visibility**: Automatically enters Picture in Picture mode when the app loses visibility.
* **Auto-Complete Episodes**: Automatically marks episodes as complete when you finish watching them. Requires account login.
* **Deband Video**: Reduces banding (compression artifacts) on dark and compressed videos. High performance impact. Recommended for seasonal web releases, not recommended for high quality blu-ray videos.
* **Seek Duration**: Seconds to skip forward or backward when using the seek buttons or keyboard shortcuts. Higher values might negatively impact buffering speeds. Range: 1 to 50 seconds
* **Auto-Skip Intro/Outro**: Attempt to automatically skip intro and outro. This WILL sometimes skip incorrect chapters, as some of the chapter data is community sourced.
* **Auto-Skip Filler**: Automatically skip filler episodes. This WILL skip ENTIRE episodes.

### Player Interface

* **Minimal UI**: Forces minimalistic player UI, hides controls.

### External Player Settings

* **Enable External Player**: Opens a custom user-picked external video player to play video, instead of using the built-in one.
* **External Video Player**: Executable for an external video player. Make sure the player supports HTTP sources. On Android this is replaced by a system file picker to select the player app.
