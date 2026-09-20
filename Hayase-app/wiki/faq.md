# Frequently Asked Questions

## General Questions

### What is Hayase?

Hayase is a P2P (peer-to-peer) anime torrent streaming application that lets you watch video content before downloads complete. It's designed for streaming your own content across multiple devices without needing a central server.

See [What is Hayase?](about.md#what-is-hayase) for more details.

### Is Hayase free?

Yes, Hayase is free and source-available.

### Does Hayase provide anime or torrent sources?

No. Hayase is strictly a bring-your-own-content client. It never hosts, distributes, or links to unofficial repositories. You are responsible for sourcing media you have the rights to access and for complying with local laws.

### Is torrenting legal?

Torrenting is a technology - it's legal. What matters is what content you download:

* ✅ Legal: Public domain, Creative Commons, content you own
* ❌ Illegal: Copyrighted material without permission

You are responsible for ensuring you have legal rights to access any content you stream. See [Legal and Disclaimers](legal-and-disclaimers.md) for more information.

### Is this safe?

It's recommended that you read a guide about basics of torrenting. Hayase is open source and uses standard BitTorrent protocols. The safety of content depends on what you choose to download and your compliance with local laws.

### Do I need a VPN?

**For privacy:** Recommended. A VPN hides your torrenting activity from your ISP and other peers.

**For bypassing blocks:** Maybe. If your ISP blocks torrent sites or metadata services, a VPN can help. Often DNS over HTTPS is sufficient.

See [Bypassing Blocks](network/bypassing-blocks.md) for more information.

### Will this replace streaming sites?

Not really. The underlying source of video are still torrents, which aren't always seeded, so anime that's a few years old might not play back smoothly.

### Why is it a native app, not a website?

The BitTorrent protocol requires TCP/UDP to function, that is the only reason. Browsers can't access TCP/UDP which means they can't access the global BitTorrent swarm.

> Can't you make this just use WebRTC?

Yes. A BitTorrent implementation which uses WebRTC exists, but it's not yet adopted by any clients, and libtorrent \[the library which qBit and others use] is still working on/just added support for WebRTC, which means there's no swarm. This will hopefully change in the future.

## Technical Questions

### How much bandwidth do I need?

You need download speed that matches or exceeds the video's bitrate:

* **480p anime**: ~5 Mbps
* **720p anime**: ~10-15 Mbps
* **1080p movie**: ~15-30 Mbps

Most modern internet connections are sufficient. See [Bandwidth Requirements](core-concepts/torrent-streaming.md#bandwidth-requirements) for details.

### Can I use this on iPhone?

**Yes\*** Hayase is available on iOS, but due to platform limitations, it requires sideloading. It also only fully supports iOS 26 and above. While the app can run on older versions, stability may be significantly impacted.

See [iOS Limitations](getting-started/installation.md#ios-limitations) for more information.

### Can I reduce the upload speed?

No. This app is also meant to seed the torrents the user downloads, if you want freeleech go to some private tracker. Disabling seeding would undermine the torrent swarm the app relies on, which would make the app effectively destroy itself.

### Won't this kill swarm health?

Depends. On average no. The app is always seeding 1 torrent as long as it's open. Additionally the upload speed is forced to be x1.5 that of the download speed. Those 2 things combined will already make this app seed more than the average leecher which removes the torrent the moment it's downloaded.

### Can I seed torrents with Hayase?

Yes, Hayase seeds automatically while you download and after completion. However:

* It's optimized for streaming, not long-term seeding
* For extensive seeding, traditional clients are better
* You still support the ecosystem by seeding what you watch

### How do I know what bitrate I need?

Check the file size and duration:

**Formula:** Bitrate (Mbps) ≈ File Size (GB) × 8 / Duration (minutes) × 60

**Quick reference for 24-minute anime episodes:**

* \~300MB = ~4.5 Mbps
* \~600MB = ~9 Mbps
* \~1GB = ~15 Mbps

Your download speed should match or exceed this. See [Checking Video Bitrate](core-concepts/torrent-streaming.md#checking-video-bitrate).

### Does Hayase stream the video or does it store it?

Hayase only stores 1 torrent on your drive, unless Persist Files is enabled in settings. It doesn't stream the content into memory as it also needs to seed the data it downloads to keep the swarm alive. It's important to note that it stores 1 torrent, not 1 video. A single torrent can sometimes consist of many video files, and as such take up a lot of space.

## Extensions

### What's the difference between torrent and NZB extensions?

**Torrent extensions:**

* Search torrent sites
* Use the BitTorrent protocol
* Depend on seeders being available
* Free but can have dead torrents

**NZB extensions:**

* Search Usenet (NNTP)
* Much faster and more reliable
* Can revive dead torrents
* Requires Usenet provider subscription

### Why are my extensions showing "offline"?

**Common causes:**

1. **ISP/DNS blocking** - Extension sources are blocked
2. **Extension source is down** - The website itself is offline
3. **No internet connection** - Check your connectivity

**Solutions:**

* Enable DNS over HTTPS in settings
* Use a VPN
* Try different extensions
* Wait if source is temporarily down

See [Extension Issues](troubleshooting/extension-issues.md) and [Bypassing Blocks](network/bypassing-blocks.md).

### What extensions are there? How to make extensions?

You can find all information regarding extensions on the [extensions page](extensions/overview.md). Extensions are user-supplied; there is no official directory and the Hayase project does not endorse third-party repositories.

### Can I create my own extensions?

Yes! See the [Developer Guide for Extensions](extensions/development/creating-extensions.md) for instructions on creating custom extensions.

## Connectivity

### What is CGNAT and how does it affect me?

**CGNAT** (Carrier-Grade NAT) is when your ISP puts multiple customers behind a single public IP address. Common on:

* Mobile networks (4G/5G)
* Some residential ISPs
* Public WiFi

**Impact on Hayase:**

* Limits peer connections
* Reduces download speeds
* Makes port forwarding impossible

**Solutions:**

* Use VPN (gets you out of CGNAT)
* Switch to non-CGNAT connection
* Rely on peers with port forwarding

See [CGNAT Problems](troubleshooting/connection-issues.md#cgnat-and-peer-limits).

### Do I need port forwarding?

**Not required, but highly recommended.**

Port forwarding allows other peers to connect to you directly:

* Without it: You can only connect to peers with port forwarding
* With it: Anyone can connect to you

**Impact:**

* ✅ With port forwarding: 50+ potential peers
* ⚠️ Without: Maybe 20-30 peers

For streaming, more peers = more reliable experience. See [Port Forwarding Guide](network/torrenting-issues.md#port-forwarding-why-it-matters).

### Why can't I find any peers?

**Possible causes:**

1. **Dead torrent** - No one is seeding
2. **CGNAT** - Your network prevents connections
3. **No port forwarding** - Limited peer discovery
4. **Blocked trackers** - Can't reach tracker servers

**Solutions:**

* Try different content (may be dead torrent)
* Check seeder count before streaming
* Enable port forwarding
* Use VPN or DNS over HTTPS

See [Connection Issues](troubleshooting/connection-issues.md).

## Playback Issues

### Why won't the video play?

**Common causes:**

1. **Insufficient download speed** - Speed < bitrate
2. **Codec issues** - Hardware acceleration problems
3. **No peers** - Can't download the file
4. **Corrupted file** - Download errors

**Solutions:**

* Check download speed vs bitrate
* Try disabling hardware acceleration
* Verify peer connections
* Try different torrent

See [Playback Issues](troubleshooting/playback-issues.md).

### Video keeps buffering

**Causes:**

* Download speed insufficient for bitrate
* Unstable peer connections
* Network issues

**Solutions:**

* Check your actual download speed
* Try lower quality version
* Enable port forwarding
* Check if on WiFi (try wired)

See [Slow Streaming](troubleshooting/playback-issues.md#slow-streamingbuffering).

### Wrong episode is playing

This is a name resolution issue. Hayase tries to auto-detect episodes but sometimes fails with badly named batches.

**Solution:**

* Manually browse torrent files
  * In the player UI open the options menu \[...] and select Playlist
* Select correct file by actual filename
* Report problematic batches

See [Metadata and Detection Issues](troubleshooting/detection-issues.md).

### I selected an episode to play, but Hayase plays something else!

Finding desired episodes can sometimes be difficult, if Hayase auto-selects an episode incorrectly you can either disable auto-play torrents in settings to select torrents yourself during episode choosing, or manually find and paste in a .torrent file URL or a magnet URL into the episode search to play a desired episode manually. See [Episode Selection Issues](troubleshooting/detection-issues.md) for more information.

### Why is anime X not playing?

One of four reasons:

* The anime isn't seeded
* Your download speed isn't fast enough
* Your ISP blocks Torrenting, see [Bypassing Blocks](network/bypassing-blocks.md) for a potential fix, or simply use a VPN
* The extensions couldn't find a matching torrent for the anime

## Storage

### How much storage do I need?

Depends on usage:

* **Casual streaming** (stream and delete): 50GB minimum
* **Regular use** (keep favorites): 200GB recommended
* **Large library**: 1TB+

Remember: Batch torrents pre-allocate the full size even if you only watch one episode. See [Storage Requirements](core-concepts/storage-management.md#disk-space-requirements).

### Can I use a network drive?

**Yes. Please don't unless you know what you're doing.**

Network drives cause:

* Extreme performance problems
* Playback stuttering
* File corruption
* App crashes

Always use local storage. See [Network Drives](core-concepts/storage-management.md#network-drive-mounting-and-why-you-shouldnt).

### Why did Hayase use 10GB when I only watched one episode?

Batch torrents pre-allocate the full size:

* Even if batch is 10GB and episode is 300MB
* Hayase can allocate 10GB immediately
* This prevents fragmentation and ensures space is available
* It's a technical requirement of how torrenting works

See [Piece Allocation](core-concepts/storage-management.md#file-allocation-strategies) and [Torrent Piece Edges](core-concepts/storage-management.md#torrent-pieces-and-file-edges).

### I have an existing media library, can Hayase import it?

Yes, however it's not simple.

See [Importing Existing Libraries](library/managing-content.md#importing-existing-torrent-libraries) for instructions.

## Comparisons

### Why not use Real-Debrid?

Real-Debrid (and similar debrid services) are often recommended, but they're not ideal for Hayase:

**Problems with debrid:**

* Just a CDN for private torrents
* Often doesn't expose raw torrent files
* Sometimes transcodes video (quality loss)
* Speed overkill for streaming (you only need bitrate-matching speed)
* Relies on torrents being alive
* Doesn't seed (hurts ecosystem)
* Costs money

**Better alternative:** NZB extensions

* Much faster than debrid
* Can revive dead torrents
* No transcoding
* Better reliability

See [Why Not Debrid](comparisons/debrid-services.md) for detailed explanation.

### How is Hayase different from Stremio/Popcorn Time?

**Architecture:**

* Hayase: Client-client (each device independent)
* Stremio/Popcorn Time: Still centralized in practice

**Extensions:**

* Hayase: User-controllable, developer-friendly
* Others: Often bundled or restricted

### How is Hayase different from Jellyfin/Plex?

**Completely different models:**

**Jellyfin/Plex:**

* Client-server architecture
* Central server stores all content
* Server transcodes for clients
* Requires powerful server hardware

**Hayase:**

* Client-client architecture
* Each device independent
* No central server needed
* Torrent swarm provides content

**When to use each:**

* Jellyfin/Plex: Permanent centralized library
* Hayase: Portable, distributed streaming

See [Client-Client Architecture](about.md#client-client-architecture-explained).

### How is this different from sequential qBit?

Unlike qBit's sequential, this will prioritise downloading torrent pieces directly needed for playback, which with the user seeking isn't always just sequential.

## Platform-Specific

### (Android) App crashes on launch

**Likely cause:** Outdated WebView

**Solution:**

1. Open Google Play Store
2. Search "Android System WebView"
3. Update to latest version
4. Restart device
5. Launch Hayase

See [Android WebView Issues](platform-issues/android/android-troubleshooting.md#webview-issues).

If the update does not help, see [WebView DevTools Flags](platform-issues/android/android-troubleshooting.md#webview-devtools-flags-android-tv) for advanced performance tuning.

### (Linux) Black screen or won't start

**Likely causes:**

* Electron display server issues
* Missing libraries
* GPU acceleration problems

**Solutions:**

* Try different Electron flags (X11 vs Wayland)
* Install missing dependencies
* Disable hardware acceleration

See [Linux Display Server Issues](platform-issues/linux/display-server-issues.md).

### (Windows) Antivirus blocking Hayase

Windows Defender may flag Hayase due to BitTorrent functionality.

**Solution:**

* Add exclusion for Hayase folder
* This is safe - Hayase is open source

See [Windows Troubleshooting](platform-issues/windows/windows-troubleshooting.md).

## Features

### Can I watch with friends remotely?

Yes! Use WatchTogether (W2G) integration:

* Synchronized playback
* P2P connection between devices
* Works across internet

**Note:** May have issues with CGNAT. See [Watch2Gether Integration](network/w2g-integration.md).

### Can I download for offline viewing?

Yes! Just let content finish downloading:

* Download while connected
* Files stay on device
* Play anytime without internet

See [Offline Mode](network/offline-mode.md).

### Can I cast to my TV?

Yes! Hayase supports:

* Chromecast
* Smart TVs with casting
* Any device on same network

See [Casting](getting-started/basic-usage.md#casting).

### Can I play my own torrents?

Yes. You can just paste/drag-drop a torrent file/magnet link in the episode search UI, and Hayase will then play that torrent as if it was that episode.

### Can I close the miniplayer?

No. The miniplayer provides feedback that something is happening in the background. Closing it would make the user feel like the app is lagging \[because it's maxing out your internet in the background by torrenting] when nothing is happening.

### Why isn't \[specific feature] available?

Hayase is optimized for its client-client model:

* No "export" (unnecessary - bring your device)
* No "pre-download to server" (no server)
* No user accounts (no central service)

If you think a feature makes sense, suggest it through the feedback channels.

## Troubleshooting

### Nothing works, where do I start?

**Basic checklist:**

1. Internet connection working?
2. Extensions installed and enabled?
3. Can search return results?
4. Selected content has seeders?
5. Enough disk space?

If all yes and still issues, see specific troubleshooting guides:

* [Playback Issues](troubleshooting/playback-issues.md)
* [Connection Issues](troubleshooting/connection-issues.md)
* [Extension Issues](troubleshooting/extension-issues.md)

### Hayase crashed too many times.

This is likely because Hayase updated from a very old version to a very new one. Uninstall Hayase, go to %appdata%/Hayase remove all files and re-install it.

### Where can I get help?

* Check this wiki documentation
* Platform-specific troubleshooting guides
* Community forums (if available)
* GitHub issues (for bugs)

### How do I report bugs or request features?

Through the official channels:

* GitHub issues (preferred for bugs)
* Community forums (for discussions)

When reporting bugs, include:

* Hayase version
* Operating system
* Detailed steps to reproduce
* Any error messages

***

**Can't find your question?** Check the specific documentation sections or troubleshooting guides for more detailed information.
