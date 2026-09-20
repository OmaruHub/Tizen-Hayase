# Torrents and Batches

Understanding how Hayase handles different types of torrents is essential for efficient streaming.

## What Are Batches?

A batch is a single torrent containing multiple files - usually multiple episodes, an entire season, or even a complete series.

### Types of Torrents

**1. Single Episode Torrent**

* One torrent = one video file
* Simplest case
* Often found for weekly releases

**Example:**

```
Torrent: "Show Name - Episode 05.mkv"
Content: Single 1GB video file
```

**2. Multi-Episode Batch**

* One torrent = multiple episodes
* Common for completed seasons
* More efficient than individual torrents

**Example:**

```
Torrent: "Show Name - Season 1 [1080p]"
Content:
  - Episode 01.mkv (600MB)
  - Episode 02.mkv (580MB)
  - Episode 03.mkv (620MB)
  ...
  - Episode 12.mkv (590MB)
Total: 7.2GB
```

**3. Complete Series Batch**

* One torrent = multiple seasons/entire series
* Best for completed series
* Can be very large (90GB+)

**Example:**

```
Torrent: "Show Name - Complete Series"
Content:
  Season 1/
    - Episode 01-12.mkv
  Season 2/
    - Episode 01-12.mkv
  Season 3/
    - Episode 01-12.mkv
Total: 25GB
```

## How Hayase Handles Batches

### One Torrent at a Time

**Critical rule: Hayase streams ONE torrent at a time.**

This means:

* If you're watching from a batch, that entire batch is "active"
* You can switch between episodes within the same batch instantly
* Starting a different torrent pauses or deletes the current one

### Why This Limitation?

**Technical reasons:**

1. **Peer connections are per-torrent** - each torrent needs its own set of peers
2. **Piece prioritization conflicts** - can't optimize for multiple torrents simultaneously, some people have bad hardware
3. **Bandwidth management** - streaming needs consistent bandwidth
4. **Storage pre-allocation** - multiple active torrents multiply storage needs

**Practical impact:**

* ✅ Watching episode after episode from same batch: seamless
* ❌ Watching different shows simultaneously: must choose one
* ✅ Pausing one torrent to watch another: works fine

### Selective Downloading

**The good news:** You don't download the entire batch!

When you select an episode from a batch:

1. Hayase identifies which file(s) you want
2. Only those files are prioritized for download
3. Other files in the batch are deprioritized (but see piece edges!)

**Example:**

* Batch contains 12 episodes (7.2GB total)
* You watch Episode 5 (600MB)
* Hayase downloads ~650MB (Episode 5 + piece edges)
* Other episodes remain mostly undownloaded

**Important:** Due to [torrent piece edges](storage-management.md#torrent-pieces-and-file-edges), you may download small portions of adjacent files.

## Storage Planning

### Pre-Allocation Requirements

**Remember:**

* Batches pre-allocate the full torrent size
* Plan for total batch size, not per-episode
* See [Storage Management](storage-management.md) for details

**Example planning:**

```
Want to watch: 3 different shows
Each has: 12-episode season batch
Each batch: 7GB

Need: 21GB free minimum
Recommended: 30GB+ for comfort
```

### Seeding from Batches

You seed the episodes you've fully downloaded, even if you haven't downloaded the entire batch. This helps maintain torrent health while only committing storage to episodes you actually watched.

***

**Related:**

* [Torrent Streaming](torrent-streaming.md)
* [Storage Management](storage-management.md)
* [Metadata and Detection Issues](../troubleshooting/detection-issues.md)
