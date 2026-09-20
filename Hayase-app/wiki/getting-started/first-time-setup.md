# First Time Setup

Congratulations on installing Hayase! This guide will walk you through the initial configuration to get you streaming as quickly as possible.

## Initial Configuration

When you first launch Hayase, you'll be greeted with a setup wizard. If you skipped it, don't worry - you can access all these settings later from the Settings menu.

### 1. Storage Location

Hayase needs to store downloaded content somewhere. Choose a location with adequate free space:

**Recommended minimum:**

* **2GB** for casual streaming (keeps recent content)
* **100GB+** for extensive libraries
* **1TB+** if you want to maintain a large collection

**Important Notes:**

* Hayase automatically manages disk space, deleting old content when needed
* You can change this location later in Settings → Storage

### 2. Network Configuration (Optional)

For the best streaming experience, you should consider:

#### Port Forwarding (Recommended)

Port forwarding significantly improves your ability to connect to peers:

**Don't know how?** See [Port Forwarding Guide](../network/torrenting-issues.md#port-forwarding-why-it-matters) for detailed instructions.

#### DNS Configuration (If Needed)

If you experience issues loading extensions or metadata:

1. Enable **DNS over HTTPS** in Hayase settings
2. Or manually change your system DNS to:
   * Cloudflare: `1.1.1.1` and `1.0.0.1`
   * Google: `8.8.8.8` and `8.8.4.4`

See [Bypassing ISP/DNS Blocking](../network/bypassing-blocks.md) for more information.

## Installing Extensions

Extensions are how Hayase finds content to stream. You **must** install at least one extension to use Hayase.

### What Are Extensions?

Think of extensions as search engines for content:

* **Torrent extensions** search torrent sites for content
* **NZB extensions** search Usenet (NNTP) for content

For detailed information, see [Extensions Overview](../extensions/overview.md).

### Installing Your First Extension

1. Go to **Settings** → **Extensions**
2. Click **Add Extension**

**Recommended for beginners:**

* Install 1-2 different torrent extensions for variety
* If you have Usenet access, also install NZB extensions

### Extension Languages

Many extensions support multiple languages or audio tracks:

* **Sub**: Subtitled content (original audio + subtitles)
* **Dub**: Dubbed content (audio in your language)
* **Multi**: Both sub and dub available

Choose extensions that match your language preferences.

## Basic Settings

### Streaming Settings

**Download Speed:**

* Leave at the default (recommended) - Hayase automatically adjusts
* Manual setting: Match your internet speed's download capacity but don't exceed your storage write speeds!

At least 15 Mbit/s (1.8 MB/s) is required to stream 1080p video real-time. >25 Mbit/s is recommended for a buffer-free experience. This value changes a lot based on the content type you're streaming - Blu-ray rips require much higher speeds than typical anime torrents.

See [Bandwidth Requirements](../core-concepts/torrent-streaming.md#bandwidth-requirements) for more details.

**Peer Connections:**

* Leave at default (recommended) - Hayase automatically adjusts during setup
* Hayase uses more connections than traditional torrent clients - this is normal and necessary for smooth streaming

More is almost always better, unless you're behind a CGNAT, where setting max connections too high can cut out internet in your entire household.

See [CGNAT and Peer Limits](../troubleshooting/connection-issues.md#cgnat-and-peer-limits) for more information.

### Video Playback Settings

**Hardware Acceleration:**

* Don't disable this unless you have issues
* Improves performance and reduces CPU usage

**ANGLE Backend (Advanced):**

* Leave at **Default** unless you have SERIOUS GPU problems
* Can help with some driver issues on Linux/Windows
* See [GPU Acceleration](../platform-issues/linux/gpu-acceleration.md) for details

### Privacy Settings

**VPN Recommendation:**
Consider using a VPN when torrenting:

* Masks your IP from other peers
* Encrypts traffic from your ISP
* Provides privacy

Hayase works with all VPN providers - just connect before launching Hayase.

## Testing Your Setup

Let's make sure everything works:

### 1. Test Extensions

1. Open Hayase's search or browse interface
2. Search for any content
3. You should see results from your installed extensions

**If no results appear:**

* Check your internet connection
* Verify extensions are installed and enabled
* Verify extension settings (API keys, etc.)
* Verify that the content you're searching has been published
* See [Extension Issues](../troubleshooting/extension-issues.md)

### 2. Test Streaming

1. Select any video from search results
2. Click play
3. The video should start within 10-30 seconds

**If the video doesn't play:**

* Check your download speed (Settings → Stats)
* Verify you're connected to peers
* See [Playback Issues](../troubleshooting/playback-issues.md)

### 3. Check Peers

While streaming, check the stats overlay:

* You should see multiple peers connected
* Download speed should match or exceed video bitrate

**If no peers connect:**

* You may be behind CGNAT - see [Connection Issues](../troubleshooting/connection-issues.md)
* Try enabling port forwarding
* The torrent may be dead - try different content

## Understanding Your First Stream

When you start your first stream, here's what happens:

1. **Hayase connects to peers** - This may take 3-20 seconds
2. **Streamed download begins** - Hayase downloads from the content needed directly for playback
3. **Playback starts** - Once enough buffer is downloaded
4. **Continuous streaming** - Hayase downloads ahead of your playback position

**What speeds do you need?**

You don't need blazing fast internet! You only need download speed that matches the video's bitrate:

* **720p anime**: ~2-5 Mbps (0.25-0.6 MB/s)
* **1080p anime**: ~5-15 Mbps (0.6-1.8 MB/s)
* **1080p movie**: ~10-25 Mbps (1.2-3 MB/s)
* **Blu-ray content**: ~50-100 Mbps (6-12 MB/s)

Most home internet connections are more than sufficient!

## Next Steps

Now that you're set up, learn more about:

* **[How Torrent Streaming Works](../core-concepts/torrent-streaming.md)** - Understand what's happening under the hood
* **[Torrents and Batches](../core-concepts/torrents-and-batches.md)** - How Hayase handles different torrent types
* **[Extensions Guide](../extensions/overview.md)** - Get the most out of extensions
* **[Basic Usage](basic-usage.md)** - Day-to-day usage tips

## Common First-Time Issues

### "Resolving Metadata..." Stuck

* The torrent may be dead - try different content
* You may be behind CGNAT - see [Network Issues](../network/torrenting-issues.md)
* Port forwarding may help

### "Video won't play"

* Check hardware acceleration settings
* Ensure you have sufficient download speed
* See [Playback Issues](../troubleshooting/playback-issues.md)

### "Extensions won't load"

* Check your internet connection
* Try changing DNS settings
* See [Bypassing Blocks](../network/bypassing-blocks.md)

### "App is slow/laggy"

* Make sure hardware acceleration is enabled
* Check system resources (CPU/RAM usage)
* See platform-specific troubleshooting guides

***

**Need Help?** Check the [FAQ](../faq.md) or platform-specific troubleshooting guides.
