# Why Not Real-Debrid / Debrid Services?

Many users ask about using Real-Debrid, AllDebrid, Premiumize, or similar "debrid" services with Hayase. While these services are popular, they're actually a poor fit for Hayase's use case.

## What Debrid Actually Is (CDN for Private Torrents)

### Understanding Debrid Services

Debrid services are essentially:

1. **Private torrent servers** that download torrents to their own servers
2. **CDN (Content Delivery Network)** that serves cached content
3. **Premium link generators** that bypass file host restrictions

**How they work:**

```
You → Debrid Service → Torrent Swarm
                    ↓
                  Cache
                    ↓
You ← HTTP Stream ← Debrid Service
```

### The Business Model

* You pay monthly (~$3-15/month)
* They maintain servers that download torrents
* They cache popular content
* You download from their servers via HTTP

**Key point:** It's not magic - it's just someone else torrenting for you and then serving it to you via HTTP.

## Problems with Debrid for Hayase

### 1. No Unified Access to Raw Torrent Files

**The Problem:**

* Some debrid services don't expose the actual torrent contents
* They only provide HTTP links to cached content

**Impact:**

* Can't use debrid with Hayase's streaming engine
* Defeats the purpose of streaming

### 2. Quality Loss from Transcoding

**The Problem:**

* Some debrid services transcode video to save bandwidth
* They may convert H.265 to H.264
* They may reduce bitrate
* They may re-encode already compressed video

**Impact:**

* Quality degradation (especially visible in anime)
* Loss of HDR/Dolby Vision
* Artifacting and banding
* You paid for BluRay quality, got web-dl quality

### 3. Speed Misconceptions for Streaming

**The Misconception:**
"Debrid gives me 100+ MB/s downloads!"

**The Reality for Streaming:**
You only need enough speed to match the video bitrate:

* 1080p anime: ~10-15 Mbps (1-2 MB/s)
* 1080p movie: ~15-30 Mbps (2-4 MB/s)
* 4K movie: ~50-100 Mbps (6-12 MB/s)

**Most home internet easily provides this.**

**Debrid's 100 MB/s is overkill:**

* You're streaming, not downloading to watch later
* The extra speed doesn't improve streaming experience
* It's solving a problem that doesn't exist for streaming

**Cost Analysis:**

```
Debrid: $5-15/month = $60-180/year
For: Speed you don't need

Better internet: Maybe $10-20/month more
For: Speed for EVERYTHING, not just streaming
```

### 4. Dead Torrents Problem (Debrid Can't Help)

**The Misconception:**
"Debrid has everything cached!"

**The Reality:**

* Debrid caches popular content only
* Niche/older content not cached
* If torrent is dead, debrid can't help
* They still need seeders to cache content initially

**Example:**

```
You want: Obscure 2005 anime, dead torrent
Debrid status: Not cached
Debrid tries to download: No seeders
Result: Debrid also fails
```

**NZB alternative:** Usenet retention goes back 5-10+ years, independent of torrent health.

### 5. No Seeding = Ecosystem Damage

**The Problem:**
When you use debrid:

1. Debrid downloads from swarm (leeches)
2. You download from debrid (HTTP)
3. No one seeds back to the swarm

**Impact on Ecosystem:**

* Swarms become weaker (more leechers, fewer seeders)
* Torrents die faster
* Future availability decreases
* Hurts the community that created the content

**Ethical consideration:**

* Upload groups spend time and money creating releases
* Seeders maintain availability
* Debrid users take without giving back
* Contributes to torrent death

### 6. Cost vs Benefit Analysis

**Debrid Costs:**

* Real-Debrid: ~$4/month ($50/year)
* AllDebrid: ~$4/month ($50/year)
* Premiumize: ~$12/month ($150/year)

**What You Get:**

* Speed you don't need (for streaming)
* Possible quality loss
* No seeding (ecosystem damage)
* Still reliant on torrent health
* Privacy concerns (your activities tied to account)
* Subject to service outages
* Subject to DMCA takedowns

**Better Alternatives:**

**Option 1: Just use torrents directly (free)**

* Zero cost
* Full quality
* Supports ecosystem
* Works with Hayase perfectly

**Option 2: NZB/Usenet ($5-15/month)**

* Similar cost to debrid
* Much faster and more reliable
* Revives dead torrents
* No reliance on seeders
* Better privacy
* Works great with Hayase

## When Debrid Might Make Sense

### Scenarios Where Debrid Could Work

**1. Traditional Download-Then-Watch:**

* You download full files before watching
* Not streaming (defeats Hayase's purpose)
* Using with other apps, not Hayase

**2. Very Poor Internet:**

* <5 Mbps download speed
* Can't stream torrents reliably

**But even then:**

* Upgrade internet (more broadly useful)
* Use lower quality releases
* Consider NZB as alternative

### Why These Don't Apply to Hayase

Hayase is designed for streaming from torrents:

* You watch while downloading
* Speed requirements are low (just match bitrate)
* Debrid's advantages don't apply
* Debrid's disadvantages are significant

## The Better Alternative: NZB Extensions

Instead of debrid, use NZB extensions with Usenet:

### Why NZB > Debrid for Hayase

**Speed:**

* Usenet: Consistently maxes your connection
* Debrid: Variable, depends on cache/load
* Winner: **Usenet**

**Reliability:**

* Usenet: 99.9% uptime, independent of peers
* Debrid: Depends on torrent swarm health
* Winner: **Usenet**

**Dead Content:**

* Usenet: 5-10+ year retention
* Debrid: Only if recently cached
* Winner: **Usenet**

**Quality:**

* Usenet: No transcoding, original files
* Debrid: May transcode
* Winner: **Usenet**

**Ecosystem:**

* Usenet: Independent, doesn't harm torrents
* Debrid: Damages torrent ecosystem
* Winner: **Usenet**

**Cost:**

* Usenet: $5-15/month
* Debrid: $3-15/month
* Winner: **Tie** (similar cost)

### How to Use NZB with Hayase

1. Subscribe to Usenet provider
2. Install NZB extensions in Hayase
3. Configure with your credentials
4. Enjoy fast, reliable streaming

See [NZB Extensions](../extensions/nzb-extensions.md) for detailed setup.

## Common Debrid Arguments Debunked

### "But I already pay for debrid"

**Response:**

* Sunk cost fallacy
* Use it for other apps if you want
* But it's not optimal for Hayase
* Consider switching to Usenet when renewal comes

### "Debrid is faster"

**Response:**

* Only matters for downloading full files
* For streaming, you only need bitrate-matching speed
* Most internet is already fast enough
* If not, Usenet is actually faster AND more reliable

### "Debrid is more convenient"

**Response:**

* For download-then-watch: maybe
* For streaming: torrents are equally convenient
* Hayase handles torrents transparently
* No added convenience from debrid

### "Debrid is safer/more private"

**Response:**

* Actually less private (activities tied to account)
* VPN with torrents is more private
* Debrid providers can be compelled to share logs

### "Everyone uses debrid"

**Response:**

* Many users don't understand the tradeoffs
* Popularity doesn't mean it's right for your use case
* Hayase is designed for direct torrent streaming
* For Hayase specifically, debrid is suboptimal

## Summary

### Debrid's Problems for Hayase

* No raw torrent file access
* Potential quality loss
* Speed overkill (expensive for no benefit)
* Doesn't solve dead torrents
* Damages ecosystem
* Privacy concerns
* Costs money

### Better Alternatives

* **Direct torrents:** Free, full quality, supports ecosystem
* **NZB/Usenet:** Fast, reliable, revives dead content

### The Bottom Line

**For Hayase, debrid services are:**

* Not necessary (you don't need the speed)
* Not optimal (quality/ecosystem concerns)
* Not cheaper (similar cost to better alternatives)

**Just use:**

* Direct torrents for free
* Or NZB extensions for premium experience
* Save your money or spend it on Usenet instead

***

**Related:**

* [NZB Extensions](../extensions/nzb-extensions.md)
* [Torrent Streaming](../core-concepts/torrent-streaming.md)
