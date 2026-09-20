# WatchTogether (W2G) Integration

WatchTogether allows you to watch content synchronously with friends over the internet, with synchronized playback, pause, and seeking.

## What is WatchTogether (W2G)?

### The Concept

Watch content with friends remotely:

```
You in City A          Friend in City B
     ↓                        ↓
  Playing                  Playing
  Episode 5                Episode 5
     ↓                        ↓
  Synchronized - same timestamp, same playback state
```

**Features:**

* Synchronized playback (everyone sees same frame)
* Synchronized controls (pause affects everyone)
* Chat integration
* Works across internet (not just LAN)

### How It's Different from Screen Sharing

**Screen Sharing (Discord/Zoom):**

You → Encode video → Stream → Friend decodes

* High bandwidth needed
* Quality loss from re-encoding
* Lag/delay common
* Host does all the work

**WatchTogether:**

You → Download from torrent swarm
Friend → Download from same torrent swarm
Both → Sync playback position via P2P

* Each person streams independently
* No quality loss
* Minimal bandwidth for sync only
* Distributed load

### Use Cases

**1. Long-Distance Relationships**

* Watch shows together despite distance
* Feel like you're in same room

**2. Watch Parties**

* Multiple friends in different locations
* All watch premiere together
* React in real-time

**3. Family Separated**

* Parents in one city
* Kids in another
* Watch movies together

## P2P Connection Requirements

W2G uses **WebRTC** for peer-to-peer connections. This requires:

### Network Requirements

**1. Both Users Need:**

* Internet connection
* Hayase installed
* Same content available (same torrent)
* NAT traversal capability

**2. At Least One User Needs:**

* Public IP OR port forwarding OR UPnP

**3. Firewall:**

* Must allow WebRTC connections
* Usually works by default

### How WebRTC Works

**Connection Establishment:**

1. You → Signal server: "Want to connect to Friend"
2. Friend → Signal server: "I accept"
3. Signal server → Exchanges connection info (ICE candidates)
4. You ←→ Direct P2P connection ←→ Friend

**After connection established:**

Signal server → No longer involved
You ←→ Direct P2P ←→ Friend

Data flow:

* Playback position
* Play/pause commands
* Seek position
* Chat messages
* Current torrent

**Hayase uses public STUN/TURN servers by default.**

## CGNAT Problems with W2G

If either user is behind CGNAT, they may not be able to establish a direct P2P connection. This can cause prevent you from connecting to friends and using W2G features. See [Connection Issues](../troubleshooting/connection-issues.md#cgnat-and-peer-limits) for more details and potential workarounds.

### Can't Find Friend

**Symptoms:**

* Friend doesn't appear in W2G list
* Can't send connection request

**Check:**

**1. Both Online**

Obvious but verify both connected to internet

**2. Blocked by Firewall**

* Hayase blocked from internet access
* Allow in firewall settings

**3. Not behind CGNAT**

## Setting Up W2G Session

### Creating a Session

**1. Start W2G Room**

Hayase → WatchTogether

Automatically creates room and connects to signal server.

**2. Invite Friends**

* Copy room link or code
* Send to friends

**3. Wait for Friends to Join**

**4. Start Watching**

* Select content (same torrent for all)
* Press play
* Everyone's playback syncs automatically

### Joining a Session

**1. Receive Invite**

* Friend sends room link or code

**2. Open in Hayase**

* Click link (opens Hayase automatically)

Or:

* Hayase → WatchTogether → Paste code anywhere

## Privacy and Security

### What Data is Shared

**Shared with peers:**

* Current playback position
* Play/pause state
* Your display name
* Chat messages (if enabled)

**NOT shared:**

* Your file locations
* Your watch history
* Your account info

### Signal Server

**What it knows:**

* You're trying to connect
* Who you're connecting to
* Connection metadata

**What it doesn't know:**

* What you're watching
* Your messages (encrypted)
* Your files

**After P2P established:**

Signal server no longer involved
All data goes peer-to-peer

### Encryption

**W2G connection:**

Encrypted via WebRTC (DTLS)
Same encryption as video calls
Secure from eavesdropping

## Comparison with Alternatives

### vs Discord Screen Share

**W2G Advantages:**

* No quality loss (each person streams directly)
* Lower bandwidth (sync only, not video)
* No host bottleneck (everyone independent)
* Better quality possible

**Discord Advantages:**

* Easier setup (just share screen)
* Works with any content (not just torrents)
* Integrated voice/video
* Works in more restrictive networks (no P2P needed)

### vs Other Sync Services

**W2G Advantages:**

* Works with torrents (not just streaming services)
* True P2P (no relay server needed)
* Privacy-focused

**Other services:**

* May have more features
* May be more polished UI
* Usually don't support torrents
* Often require accounts

***

**Related:**

* [Connection Issues](../troubleshooting/connection-issues.md#cgnat-and-peer-limits) (CGNAT problems)
* [Basic Usage](../getting-started/basic-usage.md)
