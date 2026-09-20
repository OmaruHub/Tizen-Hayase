# Basic Usage

This guide covers the day-to-day usage of Hayase for streaming content.

## Finding Content

### Using Search

The primary way to find content in Hayase is through search:

1. Click the **Search** button or icon
2. Type what you're looking for (anime title, movie name, etc.)
3. Press Play/Continue/Rewatch
4. Browse results from your installed extensions

### Understanding Search Results

Results show information from multiple extensions:

* **Releaser** - Who uploaded the content
* **Title** - Name of the content
* **Extension Icons** - Which extension found it
* **Type** - Single episode, batch, best quality release, alt quality release.
* **Tags** - Audio language, subtitles, source (BluRay, WEB-DL), etc.
* **Quality** - 720p, 1080p, etc.
* **Size** - Total file size
* **Seeders** - Number of people sharing (more = better)
* **Date Added** - When it was uploaded

**What to look for:**

* ✅ **Already Downloaded** = instant playback
* ✅ **More seeders** = faster, more reliable streaming
* ✅ **Recent uploads** = more likely to have seeders
* ✅ **Known releasers** = trusted quality
* ✅ **Appropriate size** = matches expected quality
* ✅ **Best/Alt quality** = higher resolution or different audio/subtitle options
* ❌ **Zero seeders** = dead torrent, won't stream

## Streaming Your First Video

### Starting a Stream

1. Click on any search result
2. Hayase will automatically select the first playable file or continue from where you left off based on your list progress
3. The video player opens and starts buffering

### What Happens Next

**Initial Connection (1-2 seconds):**

* Hayase connects to peers in the torrent swarm
* You'll see "Resolving Torrent Metadata"

**Buffering (5-15 seconds):**

* Hayase downloads the metadata of the video required for playback
* Buffer indicator shows desired video buffer, not total download
* Playback starts when sufficient buffer is ready

**Playback:**

* Video plays while Hayase continues downloading ahead
* You can see download progress in the player UI
* Hayase automatically manages speed and buffer

### Player Controls

Standard video player controls:

* **Play/Pause** - Spacebar or click
* **Seek** - Click timeline (only to already-downloaded portions)
* **Volume** - Click volume icon or use arrow keys
* **Fullscreen** - Click fullscreen icon or press F
* **Subtitles** - Click CC icon if available
* **Options** - Click ... for more settings

**Note on Seeking:**

* You can only seek anywhere you want, even to unbuffered and undownloaded parts
* Hayase will download the necessary pieces on-the-fly with minimal delay

## Managing Downloads

### Active Downloads

While streaming, your download continues in the background

**Download Stats:**

* **Download speed** - Current download rate
* **Upload speed** - You're seeding to others
* **Peers** - Number of connected peers

**Managing Speed:**

* Hayase automatically manages download speed
* It prioritizes pieces you need for streaming
* After you finish watching, it continues seeding what you downloaded

### Completed Downloads

Once a download completes:

* It's available for instant playback (no buffering)
* Hayase seeds it to other users
* It stays in your library until you delete it or play another file, unless you have persistent storage enabled, see [Settings Reference](../settings/settings-reference.md#torrent-client-settings)

### Storage Management

**To manually manage storage:**

1. Go to **Library**
2. Select content you want to remove
3. Select **Delete**

## Working with Batches

### What is a Batch?

A batch is a single torrent containing multiple episodes or even multiple seasons:

* **Single episode**: One file, one torrent
* **Season batch**: All episodes of a season in one torrent
* **Series batch**: Entire series in one torrent

### Playing from Batches

When you select a batch, Hayase streams only one episode (not the whole batch)

**Important:**

* You don't download the entire batch to watch one episode
* Hayase intelligently downloads only what you need
* Other episodes in the batch remain available

### Episode Detection

Hayase automatically detects which episode is which:

* It reads filenames within the batch
* It matches them to episode numbers
* It fetches metadata (title, description, thumbnail)

**Sometimes this fails:**

* Badly named files confuse the detection
* You might see wrong episode numbers or titles
* See [Metadata and Detection Issues](../troubleshooting/detection-issues.md) for details

## Using Multiple Devices

### The Client-Client Model

Remember: Hayase uses client-client architecture. Each device is independent:

**Scenario 1: Watching at Home**

* Use Hayase on your computer or TV device
* Content streams directly from torrents

**Scenario 2: Watching at a Friend's House**

* Open Hayase on your phone
* Cast to their TV via Chromecast
* No home server needed!

**Scenario 3: Family Sharing**

* Each family member runs Hayase on their device
* Everyone can watch different content simultaneously
* No single server bottleneck

### Casting

Hayase supports casting to:

* **Chromecast** devices
* **Smart TVs** with casting support
* **Devices on the same network**

**To cast:**

1. Ensure you're on the same network as the target device
2. Click the **Cast** icon in Hayase
3. Select your target device
4. Start playing content

For Watch2Gether (synchronized watching with friends), see [Watch2Gether Integration](../network/w2g-integration.md).

## Offline Mode

Hayase has an offline mode for when you don't have internet:

### What Works Offline

✅ Playing already-downloaded content
✅ Browsing your library
✅ Managing downloads
✅ Local playback features

### What Doesn't Work Offline

❌ Searching for new content (extensions need internet)
❌ Streaming new torrents (needs peers)
❌ Fetching metadata (thumbnails, descriptions)
❌ Extension updates

**To use offline:**

1. Nothing! Hayase automatically detects no internet, automatically caches metadata for offline use.
2. Just open Hayase and go to your library.

See [Offline Mode](../network/offline-mode.md) for more details.

## Understanding Bandwidth Usage

### Download Speed

You need enough download speed to match the video bitrate:

| Video Quality | Bitrate | Required Download Speed |
|---------------|---------|-------------------------|
| 480p SD | 1-2 Mbps | 2-3 Mbps |
| 720p HD | 2-5 Mbps | 5-7 Mbps |
| 1080p FHD | 5-15 Mbps | 10-20 Mbps |
| Blu-ray FHD | 25-100 Mbps | 50-120 Mbps |

**Note:** These are approximate. Actual bitrates vary by encoder and content.

### Upload Speed (Seeding)

While you stream, you also upload to other peers:

* This is how torrenting works - everyone shares
* Your upload speed doesn't affect your streaming

**Is seeding required?**

* Technically yes, it's part of the protocol
* Practically, Hayase handles this automatically
* You support the ecosystem by seeding

## Tips for Best Experience

### For Smooth Streaming

1. **Enable port forwarding** - Dramatically improves peer connectivity
2. **Use wired connection** when possible - More stable than WiFi
3. **Install reliable extensions** - More reliable sources = better streaming

### For Better Quality

1. **Check file sizes** - Larger usually means better quality
2. **Read file names** - Often indicate quality (e.g., "BluRay", "WEB-DL")
3. **Try different extensions** - Quality varies by source

### For Privacy

1. **Use a VPN** - Masks your IP
2. **Enable DNS over HTTPS** - Prevents DNS snooping
3. **Check extension sources** - Know what you're connecting to

## Common Usage Scenarios

### Watching a Weekly Series

1. Search for the series
2. Add it to your **Watchlist** (if available)
3. You'll see the series in the calendar

### Binge Watching

1. Find a season batch torrent
2. Continue to next episode seamlessly
3. Hayase manages the download automatically

### Sharing with Friends

1. Bring your device (phone, laptop) to their location
2. Connect to their network
3. Cast to their TV
4. Stream your content

### Travel Usage

1. Download content before you leave (while on good internet)
2. Watch downloaded content anywhere in offline mode
3. Download more when you reach your destination

***

**Next:**

* [Understanding Torrent Streaming](../core-concepts/torrent-streaming.md)
* [Extensions Overview](../extensions/overview.md)
* [Troubleshooting Common Issues](../troubleshooting/playback-issues.md)
