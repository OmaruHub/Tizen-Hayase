# Extensions Overview

Extensions are plugins that allow Hayase to search for and access content from various sources. Understanding how they work is essential for getting the most out of Hayase.

## What Are Extensions?

### The Concept

Extensions are **modular plugins** that add content sources to Hayase:

```
Hayase Core (no content sources)
    +
Extensions (provide content sources)
    =
Functional streaming app
```

**Without extensions:** Hayase can play torrents, but can't search for them
**With extensions:** Hayase becomes a complete streaming solution

### Extension Architecture

**How they work:**

1. User searches for "Attack on Titan"
2. Hayase sends query to all enabled extensions
3. Each extension:
   * Connects to its source (website/API)
   * Searches for content
   * Returns results to Hayase
4. Hayase aggregates and displays results or errors the extensions encountered

## Extension Types

Hayase supports four types of content source extensions:

* Torrent extensions - See [Torrent Extensions](torrent-extensions.md)
* NZB extensions - See [NZB Extensions](nzb-extensions.md)
* Subtitle extensions - See [Subtitle Extensions](subtitle-extensions.md)
* HTTP extensions - See [HTTP Extensions](http-extensions.md)

Additionally, Hayase supports Chrome extensions as plugins for extended functionality - See [Plugins](plugins.md).

## Installing and Managing Extensions

### Installing Extensions

**From repository:**

1. Settings → Extensions → Repositories
2. Input a full repository URL (e.g., https://example.website/manifest.json)
3. Click "Import Extensions"
4. Wait for download, this might show errors if the extension is invalid, or tries to overwrite an existing extension with the same name.
5. Extension appears in "Extensions" tab

### Installing Plugins

Plugins are Chrome extensions that can be installed from `.crx` files, `.zip` archives, or unpacked directories via `manifest.json`. See [Plugins](plugins.md) for a full guide.

### Configuring Extensions

**Each extension may have settings:**

Settings → Extensions → \[Extension Name] → Configure Icon on the right

Common settings:

* API keys
* NZB options such as logins, pool size, domain, etc.
* Language (for multi-language extensions)
* Filter options

### Enabling/Disabling Extensions

**Enable:**

Settings → Extensions → \[Extension] → Toggle ON
Extension now active in searches

**Disable:**

Toggle OFF
Extension won't appear in searches
Still installed, can re-enable anytime

**Why disable:**

* Extension often offline
* Low-quality results
* Temporary debugging
* Reduce search time

### Updating Extensions

Extensions automatically check for updates when Hayase starts. There's no manual updates necessary.

### Uninstalling Extensions

**Remove extension:**

Settings → Extensions → \[Extension] → Settings → Uninstall

**This doesn't remove:**

* Content downloaded through extension
* Watch history

## Language Support (Sub/Dub/Multi-language)

Extensions can specialize in different language tracks:

### Sub (Subtitled)

**What it means:**

Original audio (usually Japanese for anime)

* Subtitles in your language

**Extensions marked "Sub":**

Search for subtitled releases
Return results with subs, but also possibly extra dubbed audio

### Dub (Dubbed)

**What it means:**

Audio replaced with your language
May or may not have original audio

**Extensions marked "Dub":**

Search for dubbed releases
Return English audio versions

### Both

**What it means:**

Contains releases with both sub and dub options
User can choose during playback

### Multi-language Extensions

Some extensions support multiple languages, sometimes with a language setting:

Settings → Extensions → \[Extension] → Language
Select: English, Spanish, French, etc.

Extension now *should* search for that language

## Extension Online/Offline Behavior

### Online Mode

**Normal operation:**

```
Extension → Connects to source
          → Searches
          → Returns results
```

**If source is down:**

```
Extension → Timeout after 10 seconds
          → Shows "Offline" or "Error"
          → Doesn't block other extensions
```

### Offline Mode

**Cached results:**

Some extensions cache recent searches
May show cached results offline
Usually stale after a few hours

### Extension Offline Indicators

**In extension list:**

🔴 Extension Name - Status: Offline
🟢 Extension Name - Status: Online

### Troubleshooting Offline Extensions

**If extension shows offline:**

**1. Check your internet**

Obvious, but verify

**2. Check source website**

Visit website manually in browser
If down: Extension will be offline
Wait for site to return

**3. DNS/ISP blocking**

Site may be blocked
Enable DoH or VPN
See [Bypassing Blocks](../network/bypassing-blocks.md) for detailed guide.

**4. Extension outdated**

Website changed, extension broken
Update extension
Or wait for extension dev to update

**5. Extension offline**

Extension's source is down
Wait for website to return

## Extension Best Practices

**Verify result accuracy:**

Check that search results match what you're looking for by examining:

* Title/name accuracy
* File size
* Seeders/peers count (for torrents)
* Other metadata details

**Monitor extension quality:**

Extensions are marked with icons in search results, allowing you to:

* Identify which extension provided each result
* Spot patterns of low-quality results
* Disable or uninstall problematic extensions

**Trust your sources:**

Only install extensions from repositories you trust. Extensions have network access and see your search queries, so use reputable sources.

## Privacy and Security

### What Extensions Can Access

**Network access:**

* Extensions connect to their source websites
* Can send HTTP requests
* Can receive responses

**Your searches:**

* Extensions see what you search for
* Sent to source website
* Logged by source (not Hayase)

**Cannot access:**

* Your files
* Other extensions' data
* System files
* Browser history
* Passwords

### Sandboxing

**Hayase sandboxes extensions:**

* Each extension runs in isolation
* Can't interfere with each other
* Can't access Hayase core
* Limited permissions

**Protects against:**

* Malicious extensions
* Extension bugs
* Interference

## Common Questions

### "Why do I need extensions?"

**Answer:**
Hayase is a torrent streaming client, not a content provider. Extensions provide the content discovery layer that Hayase doesn't include by design.

Think of it like:

* Browser (Hayase) vs Search Engine (Extensions)
* Media Player (Hayase) vs Netflix (Extensions)

### "Are extensions legal?"

Extensions themselves are just code that searches websites. The legality depends on what content you access through them. See [Legal](../legal-and-disclaimers.md).

### "Why are some extensions offline?"

* Source website is down
* Site is blocked by ISP
* Extension needs updating

See troubleshooting above.

### "Can I create my own extension?"

Yes! See [Creating Extensions](development/creating-extensions.md) for developer documentation.

**Related:**

* [Torrent Extensions](torrent-extensions.md)
* [NZB Extensions](nzb-extensions.md)
* [Subtitle Extensions](subtitle-extensions.md)
* [HTTP Extensions](http-extensions.md)
* [Plugins](plugins.md)
* [Creating Extensions](development/creating-extensions.md)
* [Bypassing Blocks](../network/bypassing-blocks.md)
