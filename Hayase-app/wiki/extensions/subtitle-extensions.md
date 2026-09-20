# Subtitle Extensions

**What they do:**

* Search for subtitle files for a specific anime episode
* Return subtitles in various formats (VTT, SRT, ASS, SSA, TXT, etc.)
* Hayase matches them with the corresponding video file

**How they work:**

```
Extension → Subtitle Source → Search by episode info
           → Return subtitle URLs with language tags
Hayase → Download subtitle
      → Match to video
      → Display during playback
```

They are especially useful for niche languages which might not have torrents subbed or dubbed in that language, but do have subtitle files available. By using subtitle extensions, users can still enjoy content in their preferred language.

Subtitle extensions implement the `SubtitleSource` class with a `test()` method to verify connectivity and a `single()` method that returns subtitle results. Unlike torrent or NZB extensions, they only need a single query method since subtitle matching is per-episode.

**Query format:**

Subtitle extensions receive an `AnimeQuery` object without the `resolution` or `exclusions` fields. The query includes the episode number, anilist ID, titles, and other metadata for accurate matching.

**Result format:**

Each result contains a direct URL to the subtitle file and a language code identifying the subtitle language.
