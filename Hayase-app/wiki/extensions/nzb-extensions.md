# NZB Extensions

* Search Usenet/NNTP indexers using infoHashes
* Return .nzb files (Usenet equivalent of torrents)
* Hayase downloads from Usenet servers

**How they work:**

```
Extension → Usenet Indexer → Search results
           → Return NZB to Hayase
Hayase → Download from Usenet servers directly
      → Not peer-to-peer, direct download
      → Stream content
```

When you select a torrent to be played Hayase will query all enabled NZB extensions for that torrent's infoHash. Each extension will search for matching content and return any found NZB files to Hayase. Hayase then uses the NZB to download the content directly from your Usenet provider's servers, allowing you to stream it immediately without waiting for peers.

## What is NNTP/Usenet?

Usenet is one of the oldest computer network communication systems, predating the modern web. It was originally designed as a distributed discussion system but has evolved into a powerful platform for binary file distribution.

**Key concepts:**

* **NNTP (Network News Transfer Protocol)**: The protocol used to access Usenet servers
* **Newsgroups**: Organized hierarchical categories where content is posted
* **Binary posts**: Files split into multiple articles and encoded for distribution
* **Retention**: How long Usenet providers store content (often 3,000+ days)

**How it differs from torrents:**

Unlike BitTorrent, which relies on peer-to-peer file sharing, Usenet is a client-server architecture. You download directly from high-speed Usenet servers operated by commercial providers, ensuring consistent speeds and availability.

## How NZB Extensions Work

NZB extensions integrate Usenet functionality into Hayase by bridging the gap between search and download:

**The workflow:**

1. **Search Request**: When you search in Hayase, NZB extensions find NZBs using infoHashes or search terms
2. **Direct Download**: Hayase uses the NZB to download content directly from your Usenet provider's servers
3. **Streaming**: As chunks download, Hayase can begin streaming immediately

**Requirements:**

* A Usenet provider subscription
* Properly configured NZB extension

## Advantages over Torrents

NZB extensions offer several compelling benefits compared to traditional torrent extensions:

* Downloads at your maximum connection speed (no dependency on seeders)
* Consistent performance regardless of content popularity
* Content doesn't "die" - no seeders required
* Long retention periods mean old content stays accessible
* Works well behind restrictive NAT/firewalls
* No port forwarding needed

## Reviving Dead Content

One of the most powerful features of NZB extensions is their ability to access content that would be considered "dead" on torrent networks:

* Many Usenet providers offer 3,000+ days (8+ years) of retention
* Some providers maintain 5,000+ days of retention
* Content uploaded years ago is still downloadable at full speed

This means Hayase can stream even dead torrents as long as the user has an NZB extension configured and the content is still available on Usenet. Then as the user streams, Hayase will seed the content to other torrent peers, reviving the torrent and making it available to others again.
