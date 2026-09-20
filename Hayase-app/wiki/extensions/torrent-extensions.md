# Torrent Extensions

**What they do:**

* Search torrent source websites
* Return magnet links and metadata
* Hayase then torrents normally

**How they work:**

```
Extension → Torrent Source → Scrape results
           → Parse torrent info
           → Return to Hayase
Hayase → Download torrent metadata
      → Connect to torrent swarm
      → Stream content
```
