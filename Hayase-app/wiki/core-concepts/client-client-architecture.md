# Client-Client Architecture

Understanding Hayase's architecture is key to understanding why it works differently from traditional media servers.

## What is Client-Client?

### The Fundamental Difference

**Traditional Model (Client-Server):**

```
[Server] ← stores all content
   ↓
   ↓ streams to
   ↓
[Client 1] [Client 2] [Client 3]
```

**Hayase Model (Client-Client):**

```
[Device 1] ←→ [Torrent Swarm] ←→ [Device 2]
    ↓                                  ↓
  Plays                              Plays
```

### How It Works

Each Hayase instance:

1. **Acts independently** - Connects to torrent swarms directly
2. **Manages its own storage** - Downloads and stores content locally
3. **Handles its own playback** - No transcoding, no server needed
4. **Can share with peers** - But doesn't require a central server

**Key principle:** Every device running Hayase is equal. There's no "server" and no "client" - each device is both.

### The Torrent Swarm as "Server"

In a sense, the torrent swarm itself acts as your distributed server:

* Thousands of peers worldwide store pieces of content
* You download from whoever has what you need
* You contribute back by seeding
* No single point of failure
* No single owner or administrator

## vs Client-Server (Jellyfin/Plex)

### Client-Server Architecture (Traditional)

**How Jellyfin/Plex Works:**

1. **Central Server**
   * Stores all your media files
   * Runs 24/7 on dedicated hardware
   * Requires significant resources (CPU, RAM, storage, bandwidth)

2. **Transcoding**
   * Server converts video formats on-the-fly
   * CPU/GPU-intensive operation
   * Required when client doesn't support native format

3. **Streaming**
   * Server sends stream to client over network
   * Limited by server's upload bandwidth
   * Multiple simultaneous streams multiply resource usage

**Example Scenario:**

```
Server: Powerful PC with 20TB storage, always on
Dad watching: 1080p stream → Server transcodes
Mom watching: 720p stream → Server transcodes  
Kid watching: 480p stream → Server transcodes

Server CPU: 80% usage
Upload bandwidth: Maxed out
Result: Everyone experiences buffering
```

### Client-Client Architecture (Hayase)

**How Hayase Works:**

1. **No Central Server**
   * Each device downloads from torrent swarm independently
   * No single device stores everything
   * Devices can be online/offline independently

2. **No Transcoding**
   * Each device plays files natively
   * CPU/GPU usage only for decoding (much lighter)
   * Hardware acceleration handles most work

3. **Independent Streaming**
   * Each device gets content from swarm
   * No shared bandwidth bottleneck
   * More viewers = more potential peers, actually helps!

**Same Scenario with Hayase:**

```
Dad's laptop: Connects to swarm, downloads at 10 Mbps
Mom's tablet: Connects to swarm, downloads at 8 Mbps
Kid's phone: Connects to swarm, downloads at 5 Mbps

Server: None
Transcoding: None
Home upload bandwidth: Unused
Result: Everyone streams smoothly
```

### Detailed Comparison

| Aspect | Client-Server (Jellyfin/Plex) | Client-Client (Hayase) |
|--------|------------------------------|------------------------|
| **Infrastructure** | Requires dedicated server | No server needed |
| **Setup Complexity** | Server setup, port forwarding, DDNS | Install app, done |
| **Hardware Costs** | Server PC, drives, electricity | Zero extra hardware |
| **Scalability** | Limited by server resources | Unlimited (swarm scales) |
| **Upload Bandwidth** | Critical bottleneck | Not used |
| **Transcoding** | Often required (CPU intensive) | Never needed |
| **Single Point of Failure** | Yes (server down = nothing works) | No (each device independent) |
| **Content Location** | Centralized (all on server) | Distributed (on each device) |
| **Remote Access** | Need server accessible from internet | Works anywhere internet available |
| **Multi-user** | Shares server resources | Each user independent |

### When Each Makes Sense

**Use Hayase When:**

* You want portable content (laptop, phone, etc.)
* You don't want to maintain a server
* You watch content and move on (don't hoard)
* You want to share with friends in different locations
* You have limited upload bandwidth at home
* You don't want infrastructure costs
* You value simplicity and independence

## Why No Export/Pre-download Features

Many users coming from traditional media servers ask: "Why can't I export content from Hayase?" or "Why no pre-download to server?"

The answer: **These features don't make sense in client-client architecture.**

### The "Export" Question

**In Jellyfin/Plex:**
"Export" means: Take content from server, copy to portable device

**Why it exists:**

* Server stores content
* Client (phone/tablet) doesn't have content
* Need to copy server → client for offline viewing

**In Hayase:**
"Export" is meaningless because:

* Content is already on your device
* Each device IS the "server" for its own content
* Nothing to export - it's already there!

**What users really want:**
Access content on multiple devices

**Hayase solution:**
Just install Hayase on each device! Each device downloads what it needs.

### The "Pre-download to Server" Question

**What users imagine:**

* Hayase downloads torrent to a "server"
* Then other devices access from that server
* Recreating Jellyfin/Plex inside Hayase

**Why this defeats the purpose:**

1. **You'd need a server** (the thing Hayase avoids)
2. **Server becomes bottleneck** (the problem Hayase solves)
3. **Upload bandwidth limited** (the reason Hayase exists)
4. **Single point of failure** (what Hayase eliminates)

**The misunderstanding:**
Users think: "I need one copy to serve many devices"

**The reality:**
With torrenting, you can have many copies:

* Download on device 1: Gets from swarm
* Download on device 2: Gets from swarm (+ device 1!)
* Download on device 3: Gets from swarm (+ devices 1 & 2!)

Each additional device actually HELPS by adding more peers!

## Bring Your Device, Bring Your Content

This is the core philosophy of Hayase: Your content goes where you go.

### Practical Scenarios

**The Jellyfin/Plex way:**

```
You: Going on trip, want to watch content
Option 1: Leave server running at home (electricity cost, risk)
Option 2: Pre-download to phone (limited by server upload speed)
Option 3: Take server with you (impractical)
```

**The Hayase way:**

```
You: Going on trip
Before leaving: Download content on laptop/phone via Hayase
During trip: Watch from local storage (offline mode)
At hotel: Download more content from swarm
```

**Key difference:** Content lives on the device you're traveling with.

### The Philosophy

**Traditional media servers:**
"I have a central library that I access from anywhere"

**Hayase:**
"I have content on the devices I use, accessible anywhere"

**The difference:**

* Traditional: Content tied to location (your home)
* Hayase: Content tied to you (your devices)

### Technical Benefits

**No Upload Bandwidth Constraint:**

* Server model: Limited by your home upload
* Hayase: Limited by torrent swarm

**No Hardware Requirements:**

* Server model: Need powerful CPU, lots of storage, always-on PC
* Hayase: Any device you already own

**No Single Point of Failure:**

* Server model: Server dies = nothing works
* Hayase: One device dies = use another device

**Better Scalability:**

* Server model: More users = need more server power
* Hayase: More users = more peers = better for everyone!

## Common Questions

### "But I want all my content in one place!"

**Answer:** You can have it on one device if you want:

* Install Hayase on your main laptop
* Download all your content there
* Use that device as your "portable server"

**Difference from Jellyfin:**

* That laptop doesn't need to be always-on
* Other people don't depend on it
* You can take it anywhere

### "What about watch history sync?"

* Watch history can sync via AniList/MAL/Kitsu/etc.
* Optional feature for those who want it

### "Isn't this just making my phone/laptop the server?"

**No! Key differences:**

* Your device serves content to itself only
* Other people download from swarm, which is distributed
* If your device is off, others still work fine
* No transcoding, no bandwidth bottleneck

***

**Related:**

* [Home](../about.md)
* [Torrents and Batches](torrents-and-batches.md)
