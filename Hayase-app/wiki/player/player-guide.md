# Player Guide

This guide covers all the features, controls, gestures, and options available in Hayase's video player.

## Overview

Hayase includes a feature-rich video player with support for multiple playback modes:

* **Built-in Player**: Full-featured web-based player with advanced controls
* **External Player**: Launches videos in your system's default video player
* **Cast Player**: Streams content to Chromecast/Cast-compatible devices

## Basic Controls

### Playback Controls

* **Play/Pause**: Click the play button or press `Space` to toggle playback
* **Skip Back**: Jump to the previous episode (if available)
* **Skip Forward**: Jump to the next episode (if available)
* **Auto-play**: Automatically plays the next episode when the current one ends (configurable in settings)

### Seeking

* **Seekbar**: Click or drag on the seekbar to jump to a specific time
* **Hover Preview**: Hover over the seekbar to see thumbnail previews and timestamps
* **Keyboard Shortcuts**:
  * Arrow keys to seek forward/backward
  * Click and drag for precise seeking
* **Chapter Markers**: Visual indicators on the seekbar show chapter boundaries

### Volume Control

* **Volume Slider**: Adjust audio level
* **Mute Toggle**: Click the volume icon to mute/unmute
* **Keyboard Control**: Use volume shortcuts to adjust audio level
* **Exponential Volume**: Non-Android platforms use exponential volume scaling for better control

## Advanced Features

### Picture-in-Picture (PIP)

* Enable PIP mode to watch in a floating window while using other applications
* Click the PIP button or use the keyboard shortcut
* PIP window includes subtitle rendering and video deband support

### Fullscreen Mode

* Click the fullscreen button or use keyboard shortcut
* Screen orientation locks to landscape in fullscreen on supported devices
* Automatic fullscreen on Android TV
* See [Android Troubleshooting](../platform-issues/android/android-troubleshooting.md) if you have performance issues

### Subtitles

#### Subtitle Selection

* Access subtitle options through the Options menu
* Choose from available subtitle tracks
* Load external subtitle files
* Disable subtitles by selecting "None"

#### Subtitle Delay Adjustment

* Fine-tune subtitle timing in the Options menu
* Adjust delay in seconds to sync subtitles with audio
* Changes apply in real-time

### Audio & Video Tracks

* **Audio Track Selection**: Switch between available audio tracks (different languages, commentary, etc.)
* **Video Track Selection**: Choose between different video streams if available
* Tracks are organized by language in the Options menu

### Chapters

* Navigate between chapters through the Options menu
* Visual chapter markers on the seekbar
* Automatic chapter skipping for intro/outro sequences (if configured)
* Chapter titles display when hovering over the seekbar

### Playback Speed

Adjust playback rate from the Options menu:

* 0.5x (Half speed)
* 0.75x
* 1x (Normal)
* 1.25x
* 1.5x
* 1.75x
* 2x (Double speed)

Playback speed preference is saved between sessions.

### Screenshots

* Take screenshots with the screenshot button in Options menu
* Screenshots capture current frame with subtitles rendered
* Keyboard shortcut available for quick screenshots

### Video Deband

* Enable/disable video debanding through the Options menu
* Reduces color banding artifacts in gradients
* GPU-accelerated debanding using WebGL shaders
* Configurable in player settings

## Playlist Management

### Episode Selection

* Access the playlist through the Options menu or Playlist button
* Click any episode to switch playback
* Current episode is highlighted
* Skip filler episodes option (configurable in settings)

### Automatic Episode Progression

* Automatically advances to the next episode when current episode completes
* Respects watch2gether room synchronization
* Can be disabled in settings

## Gestures & Interactions

### Mouse/Touchpad

* **Click**: Play/pause
* **Double-click**: Fullscreen toggle
* **Scroll wheel**: Adjust volume, hold shift for seeking
* **Hover seekbar**: Preview thumbnails and chapters
* **Drag seekbar**: Seek to specific time
* **Hold down**: x2 speed, release to return to normal speed

### Touch Gestures

* **Single tap**: Play/pause
* **Double tap**: Fullscreen toggle
* **Swipe on seekbar**: Seek through video

### Keyboard Shortcuts

The player includes extensive keyboard shortcuts. Access the keybinds editor through Options menu to:

* View all available shortcuts
* Customize keybindings with drag-and-drop
* Set multiple keys for the same action
* Reset to defaults

Common shortcuts include:

* Play/pause toggle
* Seek forward/backward
* Volume adjustment
* Fullscreen toggle
* PIP toggle
* Next/previous episode
* Screenshot capture

## Player Settings Integration

Several player behaviors can be configured in app settings:

### Auto-completion

* **Player Autocomplete**: Automatically marks episode as watched when reaching 90% or last 3 minutes
* Integrates with tracking services (AniList, etc.)

### Auto-play

* **Player Autoplay**: Automatically starts next episode when current one finishes
* Works with WatchTogether synchronization

### Filler Skipping

* **Skip Filler**: Automatically skips known filler episodes
* Applies to both auto-advance and manual navigation

### Audio Preferences

* **Audio Language**: Preferred audio track language
* Automatically selects matching audio track when available

### Visual Settings

* **Deband**: Enable/disable debanding by default
* Applies to all playback sessions

## Casting to Devices

### Setup

1. Ensure cast devices are on the same network
2. Cast-compatible devices will appear in Options > Cast menu

### Controls

* Select target device from Cast menu
* Standard playback controls available during casting
* Stop casting button to end session
* Playlist and episode navigation supported

### Cast Metadata

* Episode information displays on cast device
* Poster images and descriptions included
* Progress synchronization

## External Player Mode

When external player mode is enabled:

* Videos launch in system default player or configured application
* Basic playback tracking (elapsed time estimation)
* Auto-completion still works based on episode duration
* Limited control interface with episode navigation
* Playlist management available

## Player Statistics

Toggle playback statistics to view:

* Current playback time and duration
* Buffer health and status
* Frame rate and rendering information
* Network speed and download statistics
* Format and codec information

Access statistics through player controls or keyboard shortcut.

## Time Display Format

Toggle between time display modes:

* **Positive**: Shows elapsed time (e.g., 5:23)
* **Negative**: Shows remaining time (e.g., -19:37)

Click the time display to toggle format.

## Immersive Mode

The player automatically enters immersive mode when:

* Video is playing
* No buffering is occurring
* Pointer is inactive for 3 seconds
* Not in PIP mode

In immersive mode:

* Controls fade out
* Cursor hides
* Seekbar minimizes
* Move pointer to restore controls

## Watch Progress Tracking

* Progress automatically saved during playback
* Resume from last position when reopening
* Integration with tracking services (AniList, MyAnimeList, etc.)
* Manual progress updates through completion detection

## WatchTogether Integration

When in a WatchTogether room:

* Synchronized playback across all participants
* Automatic episode switching synchronized
* Seek operations broadcasted to room
* Participant count affects auto-advance behavior

## Miniplayer Mode

When navigating away from the player page:

* Compact miniplayer appears
* Click to return to full player
* Basic episode information displayed
* Limited controls

## Troubleshooting

### Subtitles Out of Sync

* Use subtitle delay adjustment in Options
* Try reloading subtitles
* Check if correct subtitle track is selected

### Cast Not Working

* Ensure devices on same network
* Check cast device compatibility
* Restart cast device
* Verify firewall settings
