# Playback Issues

Common problems when trying to play video content and how to solve them.

## Video Won't Play

**Unsupported Container**

* Very rare, but some formats not supported
* .mkv, .mp4, .avi usually work
* Exotic formats may fail

**Solution:**

* Try different release/encode
* Or use external player temporarily

### Hardware Acceleration Problems

**Symptoms:**

* Video plays but stutters badly
* High CPU usage during playback
* White/Black screen instead of video

**Debugging:**

**1. Check if hardware acceleration is working:**

**2. Test with HW acceleration disabled:**

**3. Update GPU drivers:**

* Windows: GeForce Experience, AMD Adrenalin, or Intel Driver Assistant
* Linux: See GPU Acceleration guide
* macOS: System update usually handles this

**4. Try different ANGLE backend:**

This is not recommended for most situations, but can help in rare cases.

* Settings → Video Playback → ANGLE Backend

* Try: OpenGL, Vulkan, D3D11 (Windows)

* Different backends use GPU differently

* One might work better

**Platform-specific:**

* **Linux:** See [GPU Acceleration](../platform-issues/linux/gpu-acceleration.md)
* **Windows:** See [Windows Troubleshooting](../platform-issues/windows/windows-troubleshooting.md)
* **macOS:** Update system, usually fixes it

### Insufficient Download Speed

**Symptoms:**

* Video plays for a few seconds
* Buffering...
* Plays a few more seconds
* Repeat

**The problem:**

* Download speed < Video bitrate
* You're consuming faster than downloading
* Buffer depletes, playback stops

**Check your speeds:**

* During playback, check stats overlay:

* Download speed: 2 MB/s

* Video bitrate: 5 Mbps (0.625 MB/s)

* If download > bitrate: Should work

* If download < bitrate: Will buffer

**Solutions:**

**1. Wait for buffer:**

* Pause playback
* Let download catch up
* More buffer = more stable playback

**2. Improve connectivity:**

* Enable port forwarding
* Use wired instead of WiFi
* Close other bandwidth-intensive apps
* Check for ISP throttling (use VPN)

**3. Check torrent health:**

* View peers/seeders
* Few seeders = slow downloads
* Try different torrent with more seeders

**See:** [Torrent Streaming](../core-concepts/torrent-streaming.md#bandwidth-requirements)


## Slow Streaming/Buffering

### Checking Your Bitrate Requirements

**How to know what speed you need:**

**Method 1: File size calculation**

Formula: Bitrate (Mbps) ≈ File Size (GB) × 8 / Duration (minutes) × 60

Example:

* File: 600MB (0.6GB)
* Duration: 24 minutes
* Bitrate: 0.6 × 8 / 24 / 60 ≈ 3.3 Mbps

Need at least 3.3 Mbps download speed

**Method 2: Check stats in Hayase:**

During playback:
Stats overlay shows:

* Current bitrate
* Required download speed

### Peer Connection Issues

**Symptoms:**

* Few or no peers connected
* Download speed very slow
* "Finding peers..." for minutes

**Check peer count:**

During download:
Shows: X peers connected

<5 peers: Problem likely
5-20 peers: Okay
20+ peers: Good

**Causes and solutions:**

**1. No port forwarding:**

Symptom: Can connect to few peers
Solution: Set up port forwarding
See: Torrenting Issues

**2. CGNAT:**

Symptom: Very limited connections
Solution: Use VPN with port forwarding
See: [Connection Issues - CGNAT and Peer Limits](connection-issues.md#cgnat-and-peer-limits)

**3. Dead torrent:**

Symptom: 0-1 seeders shown
Solution: Try different torrent

**4. Blocked tracker:**

Symptom: Can't connect to tracker
Solution: Enable DNS over HTTPS or VPN
See: Bypassing Blocks

**5. Firewall:**

Symptom: No incoming connections
Solution: Allow Hayase through firewall

### Network Bottlenecks

**Check for bottlenecks:**

**1. WiFi congestion:**

Symptom: Speed fluctuates, drops often
Solution:

* Use 5GHz instead of 2.4GHz
* Move closer to router
* Use wired connection
* Change WiFi channel

**2. Other devices:**

Symptom: Speed fine when alone, slow with family
Solution:

* QoS on router (prioritize your device)
* Download during off-peak hours
* Upgrade internet plan

**3. ISP throttling:**

Symptom: Slow only for torrents
Test: Use VPN, speed improves
Solution: Use VPN for torrents

**4. Router limitations:**

Symptom: Speed caps at certain point
Old routers can't handle many connections
Solution: Upgrade router or limit connections


## Audio/Subtitle Problems

### No Audio

**Causes:**

1. Wrong audio track selected
2. Audio device issue

**Solutions:**

1. Player → Audio Tracks → Select different track
2. Try different release/encode
3. Check system audio output

### Audio Out of Sync

**Causes:**

1. Bad encode
2. System performance

**Solutions:**

1. Try different torrent

### Subtitles Not Showing

**Causes:**

1. No subtitle track in file
2. Subtitles disabled
3. Wrong subtitle track
4. PGS subtitles unsupported

**Solutions:**

1. Check if file has subs (properties)
2. Try different torrent

### Subtitles Out of Sync

**Manual adjustment:**

```
Player → Subtitles → Subtitle Delay → Adjust timing
+ or - seconds until synced
```

**Permanent fix:**

* Usually means bad encode
* Try different torrent/release


## Emergency Playback

If nothing works, you can play the partially downloaded file with an external player. See [External Player Settings](../settings/settings-reference.md#external-player-settings).

***

**Related:**

* [Torrent Streaming](../core-concepts/torrent-streaming.md)
* [Connection Issues](connection-issues.md)
