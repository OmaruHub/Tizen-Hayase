# Torrent Streaming

This guide explains how torrent streaming works, why it's different from traditional torrenting, and what you need for a good streaming experience.

## How Torrent Streaming Works

### Traditional Torrenting vs Streaming

**Traditional Torrent Client (qBittorrent, Transmission, etc.):**

1. Downloads pieces in random order
2. Optimizes for overall swarm health
3. Waits for complete download before playing
4. No urgency - downloading happens over hours or days
5. Focuses on long-term seeding

**Hayase (Torrent Streaming):**

1. Downloads pieces (for the most part) sequentially (beginning to end)
2. Optimizes for immediate playback, this includes video metadata, (which might be spread randomly throught the file), subtitle and font files
3. Starts playing as soon as buffer is ready
4. Urgent - needs specific pieces RIGHT NOW
5. Focuses on real-time streaming

### Sequential Downloading

When you start streaming, Hayase:

1. **Identifies the video file** you want to watch
2. **Requests pieces required for playback** starting from the video metadata and seekhead
3. **Prioritizes pieces ahead of playback** to build a buffer
4. **Deprioritizes pieces far ahead** that you won't need soon

**Why sequential?**

* Video files must be decoded for the most part from start to finish
* Random pieces are useless until you have the beginning
* Sequential download enables streaming before completion

### The Challenge: Finding the Right Peers

Not all peers have the same pieces:

* **Seeders** have the complete file (good!)
* **Leechers** have partial files (useful if they have what you need)

Traditional torrent clients don't care which pieces they get from which peer. Hayase does:

* It needs to find peers **who have the beginning of the file**
* It needs to find them **quickly** (within seconds)
* It needs to **maintain connections** to peers with upcoming pieces

This is why...

## Why Hayase is More Aggressive with Peers

### More Connections

Hayase opens **significantly more peer connections** than traditional clients:

**Traditional client:** 50-100 connections
**Hayase:** 200-500+ connections (depending on settings)

**Why?**

* More connections = higher chance of finding peers with needed pieces
* Streaming can't wait - it needs pieces NOW
* More redundancy = more stable streaming

### Rapid Peer Shuffling

Hayase constantly evaluates peer usefulness:

* Peers with pieces you need right now: **kept**
* Peers with only pieces far ahead: **disconnected**
* Peers with slow speeds: **replaced**

This "shuffling" happens constantly to maintain optimal streaming:

* Traditional client: "I'll get that piece eventually, no rush"
* Hayase: "I need pieces 150-200 in the next 30 seconds or playback stutters"

### Choking Algorithm Differences

BitTorrent uses "choking" to manage bandwidth:

* Clients "choke" peers they're not uploading to
* They "unchoke" peers they are uploading to

**Traditional clients** unchoke based on:

* Reciprocity (tit-for-tat)
* Upload speed optimization
* Long-term relationships

**Hayase** unchokes based on:

* Immediate piece availability
* Download speed for critical pieces
* Short-term needs

This makes Hayase appear "selfish" to the swarm, but it's necessary for streaming. Hayase remedies this by forcing seeding, and ALWAYS seeding while the app is open.

## Bandwidth Requirements

### The Bitrate Concept

Video bitrate = how much data per second the video needs:

* **Higher bitrate** = better quality, more data
* **Lower bitrate** = lower quality, less data

**For streaming to work, your download speed must match or exceed the video bitrate.**

### Typical Bitrates by Quality

| Content Type | Resolution | Typical Bitrate | Required Speed |
|--------------|------------|-----------------|----------------|
| Low quality anime | 480p | 1-2 Mbps | 2-3 Mbps |
| Standard anime | 720p | 2-5 Mbps | 5-7 Mbps |
| High quality anime | 1080p | 5-10 Mbps | 10-15 Mbps |
| BluRay anime | 1080p | 10-15 Mbps | 15-20 Mbps |
| Movie (compressed) | 1080p | 5-15 Mbps | 10-20 Mbps |
| Movie (BluRay) | 1080p | 25-100 Mbps | 50-120 Mbps |

**Note:** These are approximations. Actual bitrates vary by:

* Encoder used (x264, x265/HEVC, AV1)
* Encoding quality settings
* Content complexity (action scenes need more bits)

### Checking Video Bitrate

You can often tell bitrate from file size:

**Formula:** `Bitrate (Mbps) ≈ File Size (GB) × 8 / Duration (minutes) × 60`

**Example:** 24-minute anime episode, 300MB file

* 300MB × 8 / 24 / 60 = 1.67 Mbps

**Quick Reference:**

* **~100MB per 24min** = ~1.5 Mbps (VERY low quality)
* **~300MB per 24min** = ~4.5 Mbps (low quality)
* **~600MB per 24min** = ~9 Mbps (medium quality)
* **~1GB per 24min** = ~15 Mbps (good quality)
* **~5GB per 24min** = ~75 Mbps (excellent quality)

### What Speed Do You Need?

**Minimum:** Match the video bitrate
**Recommended:** 1.2x the video bitrate (for buffer)
**Ideal:** 2x the video bitrate (for comfort)

**Example:**

* Video bitrate: 5 Mbps
* Minimum speed: 5 Mbps
* Recommended: 12 Mbps
* Ideal: 10 Mbps

**Most modern internet connections are more than sufficient:**

* 25 Mbps connection: Handles 1080p anime easily
* 50 Mbps connection: Handles most 1080p content
* 100 Mbps connection: Handles everything including 4K, BluRays etc.

## Buffer Management

### What is Buffering?

Buffering is downloading ahead of your current playback position:

* Creates a safety margin for speed fluctuations
* Prevents stuttering if speeds drop temporarily
* Allows seeking within buffered range

### Hayase's Buffer Strategy

**Initial Buffer (before playback):**

* Downloads first 5-15 seconds of video
* Ensures smooth startup
* Waits for sufficient buffer before starting playback

**Ongoing Buffer (during playback):**

* Maintains 30-60 seconds or mode ahead of playback, depending on many factors determined dynamically by the browser
* Prioritizes pieces just ahead of playback

## Settings That Impact Speed

### Download Speed Limit

* Set maximum download speed
* Useful if you need bandwidth for other activities
* Don't set lower than video bitrate!
* Don't set higher than your storage/network/device can handle!

### Connection Limits

**Connections per torrent:**

* More connections = better piece availability
* Too many = overhead and diminishing returns
* Default (15-50) is usually optimal, however hayase can handle a few thousand connections

### Upload Speed

**Does upload speed affect streaming?**

* **Short answer:** No, your download is independent
* **Long answer:** Some peers use tit-for-tat, but most don't require it for streaming

## Factors Affecting Streaming Quality

### 1. Torrent Health

**Seeders:**

* More seeders = more reliable
* 10+ seeders = excellent
* 1-5 seeders = okay but risky
* 0 seeders = won't work (dead torrent), unless you use NZB extensions which can revive dead torrents

**Leechers:**

* Other people downloading
* Useful if they have pieces you need
* Too many leechers vs seeders = slower

### 2. Network Conditions

**Port Forwarding:**

* Dramatically improves peer connectivity
* Without it, you can only connect to peers with port forwarding
* See [Torrenting Issues](../network/torrenting-issues.md#port-forwarding-why-it-matters)

**CGNAT:**

* Carrier-Grade NAT limits peer connections
* Common on mobile networks and some ISPs
* Makes streaming more difficult
* Can kill your entire network
* See [CGNAT Problems](../troubleshooting/connection-issues.md#cgnat-and-peer-limits)

### 3. Piece Availability

**Piece distribution matters:**

* If nobody has the first pieces, streaming fails
* Very fresh torrents \[<5 minutes of age] may not have good piece distribution
* Older torrents may have gaps (missing pieces)

**Hayase handles this by:**

* Requesting rare pieces aggressively
* Constantly searching for new peers
* Cycling connections to find needed pieces

### 4. Your Hardware

**CPU:**

* Video decoding requires CPU power
* Hardware acceleration helps a LOT! (GPU decoding, reduces CPU usage to 0%-2%)
* Weak CPUs may struggle with high bitrate/4K
* Subtitle rendering can also tax CPU

**Storage:**

* SSD: Not recommended at all, will only diminish the health of your storage drive over time
* Standard HDD: Generally fine for all bitrates
* Slow HDD: May cause stuttering during seeks, but not a big problem for normal playback
* Network drive: Works if fast enough, but adds latency during seeking and may limit download speeds

**Network:**

* Wired > WiFi (more stable)
* WiFi can work but may have dropouts
* Distance from router matters

## Troubleshooting Slow Streaming

### "Video keeps buffering"

**Check your download speed:**

1. Look at Hayase's speed indicator
2. Compare to video bitrate
3. If speed < bitrate, you'll buffer

**Possible causes:**

* Slow internet connection
* Not enough seeders
* Poor peer connectivity (CGNAT, no port forwarding)
* ISP throttling torrents

**Solutions:**

* Try lower quality version
* Wait for more seeders
* Pick a different torrent
* Enable port forwarding
* Use VPN (may help with throttling)

### "Can't find any peers"

**The torrent may be dead:**

* Check seeder count
* Try different release/torrent

**You may have connectivity issues:**

* Check port forwarding
* Check for CGNAT
* Try different network

### "Speed is good but still buffers"

**Could be:**

* Piece availability issue (peers don't have what you need)
* Hardware decoding problem
* Storage bottleneck
* CPU overload in torrent client from multi-gigabit speeds

**Try:**

* Different torrent
* Disable hardware acceleration
* Check storage isn't full

## Advanced: How Piece Selection Works

For the technically curious, here's how Hayase selects pieces:

### Priority Levels

1. **Critical (immediate):** Pieces needed in next 10 seconds
2. **High:** Pieces needed in the video buffer seconds
3. **Don't need:** Pieces far ahead or behind playback, only if Streamed Download is enabled, see [Settings Reference](../settings/settings-reference.md#torrent-client-settings)

***

**Related Reading:**

* [Torrents and Batches](torrents-and-batches.md)
* [Storage Management](storage-management.md)
* [Network Configuration](../network/torrenting-issues.md)
