# HTTP Extensions

**What they do:**

* Search for content available via direct HTTP download
* Return direct file URLs or web seed links
* Hayase streams content directly over HTTP

**How they work:**

```
Extension → HTTP Source → Search by infoHash/name
           → Return direct download URLs
Hayase → Download from HTTP server
      → Stream content
```

HTTP extensions implement the `WebSeedSource` class and are useful for sources that serve files directly over HTTP rather than through peer-to-peer networks like BitTorrent. They combine aspects of both torrent and NZB extensions:

* Like torrents, they can provide content indexed by infoHash
* Like NZBs, they provide direct download URLs for immediate streaming
* Support optional authorization headers for private sources
* Can include per-file rate limiting

**When to use HTTP extensions:**

* Direct download anime streaming sites
* Private file hosts with HTTP access
* Web seed sources for BitTorrent content
* Sites that serve files via direct links

**Query format:**

HTTP extensions receive a `WebSeedQuery` which includes `hash`, `name`, and episode metadata (similar to NZB queries).

**Result format:**

Each result contains a direct URL to the file, with optional authorization headers, rate limiting, and file indexing information.