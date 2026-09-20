# Metadata and Detection Issues

Problems with episode/anime detection in batches.

## How Name Resolution Works

Batches contain files with names like:

```
[GroupName] Show Name - 05 [1080p][HEVC].mkv
```

Hayase needs to:

1. Parse the filename
2. Extract episode number
3. Match to correct metadata (title, description, thumbnail)
4. Display in a user-friendly way

### Pattern Matching

Hayase looks for episode numbers using various patterns:

* "05", "E05", "S01E05", "- 05 -"
* Handles various naming conventions
* Works with most standard releases

## Wrong Episode Detected

### Non-Standard Numbering

**Example:**

```
Batch contains:
  - Episode 00 (Special).mkv
  - Episode 01.mkv
  - Episode 02.mkv
  
Hayase might:
  - Skip Episode 00
  - Map Episode 01 to metadata Episode 00
  - Everything off by one
```

**Solution:** Find better-named torrent.

### Multiple Seasons in One Batch

**Example:**

```
Batch contains:
  Season 1/
    - Episode 01-12.mkv
  Season 2/
    - Episode 01-12.mkv
    
Hayase might:
  - Lose season distinction
```

**Solution:** Use single-season torrents instead.

### OVAs and Specials

**Example:**

```
Batch contains:
  - Episodes 01-12.mkv
  - OVA 1.mkv
  - OVA 2.mkv
  - Special.mkv
  
Hayase might:
  - Not recognize OVAs
  - Place them incorrectly
  - Show wrong metadata
```

**Solution:** Find separate torrents for OVAs or manually browse video files:

* In the player UI open the options menu \[...] and select Playlist
* Select correct file by actual filename

### Files Named by Title (No Numbers)

**Example:**

```
Files named by title instead of number:
  "The First Episode.mkv"
  "The Second Episode.mkv"

Detection relies on alphabetical order
May fail completely
```

**Solution:** Find properly numbered torrents.

## Wrong Anime Detected

**Why it happens:**

* Torrent name is ambiguous
* Similar show names exist
* Metadata API confusion
* Old vs new anime with same name

**Example:**

```
Torrent: "Fullmetal Alchemist"
Could be:
- Fullmetal Alchemist (2003)
- Fullmetal Alchemist: Brotherhood (2009)

Hayase might pick wrong one
```

**Solution:** Manually select the correct anime from search or override detection:

* In the player UI open the options menu \[...] and select Playlist
* Select correct file by name

## Multiple Shows in One Batch

**Example:**

```
Torrent: "Fall 2024 Anime Collection"
Contains multiple different shows
  
Hayase will:
  - Try to match all to one series
  - Completely fail
  - Show wrong metadata for everything
```

**Solution:** Avoid mixed-content batches. Download individual show torrents instead.

## When Detection Fails

**Symptoms:**

* Wrong episode numbers displayed
* Episodes out of order
* Missing episodes
* Wrong anime metadata shown

**What Hayase does:**

* Shows files in alphabetical order
* Lets you access files directly

**What you can do:**

* Manually browse torrent files
  * In the player UI open the options menu \[...] and select Playlist
  * Select correct file by name
* Check actual filenames to identify correct episodes
* Report problematic releases to improve detection
* Find better-named torrents

### "Wrong episode playing"

**Cause:** Filename parsing failed

**Solution:**

* Manually browse torrent files
  * In the player UI open the options menu \[...] and select Playlist
  * Select correct file by name
* Report the issue for improvement
* Batch doesn't actually contain the episode

**Possible causes:**

* Batch doesn't actually contain them
* Detection skipped special episodes
* Files hidden in subdirectories

**Solution:**

* Check torrent file list
* Browse files directly
* Verify batch contents before downloading by reading file name

***

**Related:**

* [Torrents and Batches](../core-concepts/torrents-and-batches.md)
