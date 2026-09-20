# Welcome to Hayase

## What is Hayase?

Hayase is a P2P (peer-to-peer) anime torrent streaming application that lets you watch video content before downloads complete. Unlike traditional torrent clients that require you to wait for the entire file to download, Hayase intelligently streams the video as it downloads, giving you an instant streaming experience.

Think of it as "Netflix for your own content" - but instead of relying on a central server, Hayase runs directly on your devices and shares content peer-to-peer with your friends and family.

## Why Hayase vs Traditional Streaming?

### The Problem with Traditional Media Servers

Traditional media server setups (like Jellyfin or Plex) use a **client-server architecture**: one powerful central server stores all your content and streams it to multiple clients. This sounds great in theory, but has significant limitations:

* **Resource constraints**: Your server needs enough CPU power to transcode video for multiple users simultaneously
* **Upload bandwidth bottleneck**: Your home internet's upload speed limits how many people can stream at once
* **Single point of failure**: If the server is down, nobody can watch anything
* **Infrastructure costs**: Requires dedicated hardware, storage, and electricity

### The Hayase Approach

Hayase uses a **client-client architecture** instead. Each device runs Hayase independently and can:

* Stream content directly from torrents without a central server
* Share content peer-to-peer with other Hayase users
* Work on any device you carry (laptop, phone, tablet)
* Bring your content anywhere you go

**Example scenario**: You're visiting a friend's house and want to watch something together. With Jellyfin, you'd need your home server to be accessible and have enough upload bandwidth. With Hayase, you simply:

1. Open Hayase on your phone
2. Cast to their TV via Chromecast
3. Start streaming - no server needed

## Client-Client Architecture Explained

The key difference is that Hayase treats every device as equal:

* **No central server** = No single point of failure
* **No transcoding overhead** = Each device handles its own playback
* **No upload bandwidth limits** = Content comes from the torrent swarm, not your home connection
* **Portable content** = Your library goes wherever your device goes

This is why Hayase doesn't have features like "export downloads" or "pre-download to server" - they're unnecessary. Just bring the device with Hayase installed, and you bring your content with you.

### When to Use Hayase vs Traditional Servers

**Use Hayase when:**

* You want to share content with family/friends across different locations
* You don't want to maintain a 24/7 server
* You need flexibility to watch content anywhere
* You have multiple devices and want portability
* You want to be able to stream content instantly without waiting for downloads, on impulses

**Use Jellyfin/Plex when:**

* You already have a powerful dedicated server
* All your users are on the same local network
* You need centralized administration and user management
* You want to maintain a permanent, catalogued library manually

## Quick Start Guide

Ready to get started? Here's what you need to do:

1. **Install Hayase** - Download for your platform (Windows, Linux, macOS, Android)
2. **Choose Extensions** - Install torrent or NZB extensions to find content
3. **Configure Network** (optional) - Set up port forwarding for better connectivity
4. **Start Streaming** - Search for content and start watching immediately

### Important: Bring Your Own Content

**Hayase is a "bring your own content" application.** It's a tool for streaming content that you already own or have the legal right to access. Hayase does not host, provide, or distribute any content itself - you are responsible for ensuring you have the legal right to access any content you stream through the application.

Think of Hayase like a video player or a web browser: it's a tool that works with content you provide, but doesn't determine what you use it for.

***

**Next Steps:**

* [Installation Guide](getting-started/installation.md)
* [Understanding Torrent Streaming](core-concepts/torrent-streaming.md)
* [Setting Up Extensions](extensions/overview.md)
