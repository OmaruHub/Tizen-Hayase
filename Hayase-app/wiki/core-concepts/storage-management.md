# Storage Management

Understanding how Hayase manages storage is crucial for avoiding common problems and ensuring smooth operation.

## How Torrent Storage Works

### The Basics

When you stream a torrent, Hayase needs to:

1. Allocate space for the entire torrent
2. Download pieces as needed
3. Write pieces to disk
4. Keep track of what's been downloaded

This is more complex than it sounds!

## Torrent Pieces and File Edges

### Understanding Pieces

Torrents are divided into fixed-size pieces:

* Typical piece size: 256KB to 16MB
* Each piece has a unique hash for verification
* Pieces don't align with file boundaries

### The Edge Case Problem

Here's a critical issue many users don't understand:

**Scenario:** A season batch with 12 episodes, each ~300MB

```
Episode 1: 0-300MB
Episode 2: 300-600MB
Episode 3: 600-900MB
...
```

**But torrent pieces are fixed, say 4MB each:**

```
Piece 1: 0-4MB    (contains start of Episode 1)
Piece 2: 4-8MB    (contains part of Episode 1)
...
Piece 75: 300-304MB (contains END of Ep1 and START of Ep2!)
Piece 76: 304-308MB (contains part of Episode 2)
```

**The problem:**

* To watch Episode 2, you need piece 75
* Piece 75 also contains the end of Episode 1
* Hayase must download ALL of piece 75 even if you skip Episode 1
* This "bleeding" happens at every file boundary

### Impact on Storage

**What this means:**

* Watching Episode 5 alone may download parts of Episodes 4 and 6
* A 12-episode batch might allocate space for ALL episodes immediately
* Even if you only want Episode 1, Hayase might pre-allocate several gigabytes

**Example:**

* Total batch size: 4GB (12 episodes)
* You want to watch Episode 6 (300MB)
* Hayase pre-allocates: 900MB
* You download: ~350MB (Episode 6 + piece edges)
* Disk space used: 900MB

**This is why you might see "no disk space" errors even when trying to watch a single small episode!**

## Network Drive Mounting

### The Temptation

It's tempting to set Hayase's storage location to:

* A NAS (Network Attached Storage)
* A network share (SMB/CIFS)
* A cloud-synced folder (Dropbox, OneDrive, etc.)

**Don't do this unless you know what you're doing. Seriously.**

### Why

**1. Latency**

* Writing to network storage adds 10-100ms+ per write
* Might limit your write flushing, reading to high RAM usage if your download speeds are too high

**2. Reliability Issues**

* Network hiccups cause write failures, make sure your network is stable!
* Torrents become corrupted
* Hayase may crash or hang

**3. File Locking**

* Network protocols handle locking differently, make sure this isn't a problem on your network storage!
* Can cause corruption if multiple devices access same files
* Hayase may fail to open files for playback

### The Exception

**Read-only access to completed torrents:** If you want to play already-completed torrents from a NAS, this can work:

* Point to network location

But even this is not for inexperienced users. DYOR.

### Proper Network Sharing

**If you want to share content across devices:**

1. Use Hayase's client-client model
2. Each device runs Hayase and downloads independently
3. No central storage needed
4. Each device manages its own local storage

## Automatic Storage Management

### How Hayase Manages Space

Hayase automatically manages storage to prevent running out of space:

**Persist Files is off:**

1. Keeps only one torrent at a time
2. Deletes old torrents when new ones are played

**Persist Files is on:**

* Keeps multiple torrents
* Never deletes anything automatically

### Manual Storage Management

**View Storage Usage:**

* Client → Library
* See per-torrent usage

**Delete Content:**

* Slect any torrent
* Select "Delete"

## Storage Location Best Practices

### Choosing a Location

**Ideal:**

* Local HDD with 60GB+ free space
* Ensure it's not nearly full
* Not used for system/critical files

**Avoid:**

* System drive (C: on Windows) if it's small
* External drives that might be disconnected
* Cloud-synced folders

### External Drives

Using an external drive (USB, etc.) is possible but:

**Pros:**

* Can be very large
* Portable storage

**Cons:**

* USB 2.0 might be too slow (use USB 3.0+)
* Can be disconnected accidentally
* May have power management issues

**If using external:**

* Use USB 3.0 or faster
* Disable power saving for the drive
* Ensure it's always connected when using Hayase

## Disk Space Requirements

### Planning Your Storage

**Per-content estimates:**

* Anime episode (720p): ~600MB
* Anime episode (1080p): ~1GB
* Movie (1080p): 2-10GB (varies widely)
* Season batch (12 episodes, 1080p): ~7GB-30GB

**Recommendations by usage:**

**Light user** (stream and delete):

* 50GB minimum
* Just enough for a few episodes/movies at once

**Regular user** (keep favorites):

* 200GB recommended
* Room for several seasons or dozens of movies

**Heavy user** (large library):

* 1TB+ recommended
* Maintain extensive collection

### The Reality of Batches

Remember the piece edge problem:

* Plan for batch sizes, not individual episode sizes

## Troubleshooting Storage Issues

### "No space left on device"

**Check actual space:**

1. Open file manager
2. Check Hayase's storage location
3. See how much is actually free

**Common causes:**

* Other programs filled the drive
* Hayase didn't clean up old downloads
* Pre-allocation for large batch

**Solutions:**

* Clear space manually via library menu
* Relocate storage location

### Torrent corrupted

**Causes:**

* Disk write failed
* Storage disconnected mid-write
* File system errors
* Network drive issues
* Modifying files outside Hayase

**Solutions:**

* Check disk health
* Don't use network drives
* Ensure storage stays connected
* Run file system check (chkdsk, fsck)

Hayase will automagically re-verify and redownload corrupted pieces.

### "Slow performance" related to storage

**Symptoms:**

* Stuttering video despite good download speed
* High disk usage
* Slow seeking

**Causes:**

* Slow HDD
* Fragmented files
* Disk nearly full

**Solutions:**

* Keep 20%+ free space
* Defragment (HDD only, never SSD)
* Close other disk-intensive programs

***

**Related:**

* [Torrent Streaming](torrent-streaming.md)
* [Torrents and Batches](torrents-and-batches.md)
