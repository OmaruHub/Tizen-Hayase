# Creating Extensions

## Extension Structure

An extension is made of two files: a **manifest** (JSON) that describes it, and an **extension script** (JavaScript) that implements it.

### The Manifest

Create a JSON file that tells Hayase what your extension does:

```json
[
  {
    "manifestVersion": 2,          // Manifest version, currently should be set to 2
    "deprecated": false,           // If the extension is deprecated
    "name": "My Extension",        // User-friendly name shown in Hayase
    "description": "Searches ExampleSite for torrents", // Description of what the extension does
    "id": "myextension",           // Unique identifier used internally
    "version": "1.0.0",            // Version number for updates
    "type": "torrent",             // Extension type: "torrent", "nzb", "subtitle", or "http"
    "accuracy": "medium",          // Search accuracy: "low", "medium", or "high"
    "ratio": 0,              // Seeding ratio ("perma" or number), optional, not implemented yet
    "icon": "https://example.com/icon.png",
    "media": "sub",                // Media type: "sub", "dub", or "both", purely informational
    "url": "aHR0cHM6Ly9leGFtcGxlLmNvbQ==", // Base64-encoded URL for CORS enablement, optional
    "languages": ["US"],           // Supported language/country codes, purely informational
    "update": "https://example.com/manifest.json", // URL to check for updates, optional
    "code": "https://example.com/script.js",       // URL to the extension code, must be CORS-enabled
    "updatePeers": false,          // Let Hayase scrape peer counts from trackers, torrent-only, optional
    "rateLimit": 10,               // Max requests per second to the source, optional
    "options": {                   // User-configurable options, optional
      "apiKey": {
        "type": "string",
        "description": "API key for ExampleSite",
        "default": ""
      },
      "enableCache": {
        "type": "boolean",
        "description": "Cache search results locally",
        "default": true
      }
    }
  }
]
```

The `type` field determines what kind of extension you're building:

| Type | Source class | What it does |
|------|-------------|--------------|
| `"torrent"` | `TorrentSource` | Access content from your personal torrent library |
| `"nzb"` | `NZBSource` | Access content from your Usenet provider |
| `"subtitle"` | `SubtitleSource` | Search for subtitle files by episode |
| `"http"` | `WebSeedSource` | Access content from your personal HTTP file server |

Notable fields:

* **`accuracy`** - Used to give users an idea of the quality of the extension, and to rank low quality extensions lower. Set this based on how accurate the extension is: `"low"` for string searches with irrelevant results, `"medium"` for ID-mapped mostly accurate results, `"high"` for perfect accuracy.
* **`url`** - The base URL of the extension, used to enable CORS for the extension's API requests. If the extension doesn't require CORS requests, leave empty.
* **`options`** - User configurable options displayed in the extension settings. Their values are passed to the extension at runtime.
* **`manifestVersion`** - The version of the manifest format. Currently should be set to `2`. Future breaking changes that are not backwards compatible should increment this version number.
* **`update`** - URL to the manifest file for update checking. Should return a manifest with a higher version number when an update is available. Usually the same URL as the manifest. Optional.
* **`code`** - URL to the extension code. Must be CORS-enabled.
* **`rateLimit`** - Max requests per second to the source site. If set, Hayase throttles requests automatically.

### Manifest field reference

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `manifestVersion` | `number` | Yes | Manifest format version. Currently `2`. |
| `deprecated` | `boolean` | No | Whether the extension is deprecated. |
| `name` | `string` | Yes | User-friendly name shown in Hayase. |
| `description` | `string` | Yes | Description of the extension and what it does. |
| `id` | `string` | Yes | Unique identifier used internally. |
| `version` | `string` | Yes | Version string for update checking. |
| `type` | `"torrent" \| "nzb" \| "subtitle" \| "http"` | Yes | Extension type, determines which source class to use. |
| `accuracy` | `"high" \| "medium" \| "low"` | Yes | How reliable results are. High = perfect ID matching, medium = mostly correct, low = string search with potential false positives. |
| `ratio` | `"perma" \| number` | No | Seeding ratio requirement. Not yet implemented. |
| `icon` | `string` | Yes | URL to the extension's icon. |
| `media` | `"sub" \| "dub" \| "both"` | Yes | Type of media the extension provides. Purely informational. |
| `url` | `string` | No | Base URL for CORS enablement. Should be the domain of the source API/website. |
| `languages` | `CountryCodes[]` | Yes | Languages the extension supports for sub/dub. This doesn't include the language of the source itself — e.g. a raw subtitle source can be turned off to get raw Japanese audio. Purely informational. |
| `update` | `string` | No | URL to the manifest file for update checking. Should return a manifest with a higher version number when an update is available. Usually the same URL as the manifest. |
| `code` | `string` | Yes | URL to the extension code. Must be CORS-enabled. |
| `options` | `SearchOptions` | No | Schema for defining user-configurable options in the manifest. See [Using Options](#using-options). |
| `updatePeers` | `false` | No | If `false`, Hayase scrapes peer counts from trackers instead of relying on extension-provided values. Torrent-only. |
| `rateLimit` | `number` | No | Max requests per second to the source site. Hayase throttles automatically. |

### The Extension Script

Extension scripts are JavaScript files that implement the functionality of the extension. They run inside a sandboxed Web Worker environment, which means they don't have access to the DOM or many browser APIs, but can perform network requests and use standard JavaScript features.

They **must be bundled** and export an object or a class instance via ESM's `export default` syntax. Which class you use depends on your extension type.

The `test` method checks if the extension is working properly. It should return `true` if working and throw an error if not. The error message will be shown to the user, so it should be descriptive and user-friendly. Any network, parsing, or other errors should be caught and handled properly.

The `single`, `batch`, and `movie` methods perform searches. If your extension doesn't differentiate between search types, it can just implement one method and return results for all query types, or return no results for the types it doesn't support.

***

## Torrent Extensions

A torrent extension indexes your personal torrent collection and returns matching results.

**Minimal example:**

```js
export default new class extends TorrentSource {
  async test() {
    const res = await fetch("https://example.com")
    return res.ok
  }

  single(query) {
    return searchSite(query.titles[0], query.episode)
  }

  batch(query) {
    return searchSite(query.titles[0], `${query.episodeCount}`)
  }

  movie(query) {
    return searchSite(query.titles[0], "movie")
  }
}
```

**Methods:**

| Method | Called when | Return |
|--------|-------------|--------|
| `test()` | Checking if extension works | `Promise<true>` or throw |
| `single(query)` | User searches for one episode | `TorrentResult[]` or `undefined` |
| `batch(query)` | User wants a batch/全集 release | `TorrentResult[]` or `undefined` |
| `movie(query)` | User searches for a movie | `TorrentResult[]` or `undefined` |

**The query object** contains everything you need to search:

```js
{
  media: { /* AniList Media object */ },
  anilistId: 153152,          // AniList ID
  anidbAid: 12345,            // AniDB anime ID (may be undefined)
  anidbEid: 67890,            // AniDB episode ID (may be undefined)
  tvdbId: 98765,              // TheTVDB anime ID (may be undefined)
  tvdbEId: 54321,             // TheTVDB episode ID (may be undefined)
  imdbId: "tt1234567",        // IMDb ID (may be undefined)
  tmdbId: "98765",            // TMDB anime ID (may be undefined)
  titles: ["Attack on Titan", "Shingeki no Kyojin", "進撃の巨人"],
  episode: 5,
  episodeCount: 25,           // Total episodes for the series
  absoluteEpisodeNumber: 5,   // For non-standard numbering (may be undefined)
  resolution: "1080",         // Requested resolution or empty string
  exclusions: ["x265", "web-dl"],
  fetch: fetch                // Use this for CORS-enabled requests
}
```

Use the provided IDs for accurate matching. Fall back to `titles` for string searches. Filter out results matching `exclusions`.

Notably `exclusions` is a list of keywords that the app wants to exclude from search results. For example, if the environment doesn't support x265, it can add "x265" to the exclusions list and the extension should filter out any results that contain "x265" in their title.

**Return a `TorrentResult`:**

```js
{
  title: "[SubGroup] Attack on Titan - 05 [1080p].mkv",
  link: "magnet:?xt=urn:btih:...",
  seeders: 42,
  leechers: 10,
  downloads: 500,
  accuracy: "high",
  hash: "a1b2c3d4e5f6...",
  size: 1073741824,
  date: new Date("2024-01-15"),
  type: "batch"   // optional: "batch" | "best" | "alt"
}
```

`seeders`, `leechers`, and `downloads` give the user an idea of the torrent's popularity and availability, but can be left as 0 since Hayase tries to update peer counts before presenting results, unless explicitly disabled.

The `type` field indicates the type of release. `"batch"` for multi-episode packs. `"best"` and `"alt"` should only be set if the content is manually verified to be the best or second-best release for that content - never guess!

`accuracy` is a per-result override for the extension's overall accuracy. Use it to mark unreliable results, for example if a string search returns a very common title prone to false positives.

***

## NZB Extensions

NZB extensions search your Usenet provider and return direct download links. They receive a query with `hash` and `name` instead of `resolution` and `exclusions`.

**Minimal example:**

```js
export default new class extends NZBSource {
  async test() {
    const res = await fetch("https://indexer.example.com")
    return res.ok
  }

  single({ hash, name, file, ...query }) {
    return fetchNZB(hash, file)
  }

  batch({ hash, name, files, ...query }) {
    return fetchBatchNZB(hash, files[0])
  }
}
```

| Method | Query includes | Return |
|--------|---------------|--------|
| `single(query)` | `{ hash, name, file }` | URL string or `undefined` |
| `batch(query)` | `{ hash, name, files[] }` | URL string or `undefined` |

The returned URL should point to an NZB file. It can be gzipped - Hayase handles decompression automatically.

The `hash` and `name` fields identify the content, while `file` or `files` specifies which file(s) to retrieve depending on whether the query is single or batch.

**Tip:** NZB extensions are powerful because Usenet providers offer long retention periods, making older content accessible even when no longer available elsewhere.

***

## HTTP / WebSeed Extensions

HTTP extensions return direct download URLs, useful for accessing content from your personal file server or CDN.

**Minimal example:**

```js
export default new class extends WebSeedSource {
  async test() {
    const res = await fetch("https://cdn.example.com")
    return res.ok
  }

  single({ hash, name, file }) {
    return {
      url: `https://cdn.example.com/${hash}/${file.name}`,
      rateLimit: 300
  }

  batch({ hash, name, files }) {
    return files.map(f => ({
      url: `https://cdn.example.com/${hash}/${f.name}`,
      index: f.index
    }))
  }
}
```

| Method | Query includes | Return |
|--------|---------------|--------|
| `single(query)` | `{ hash, name, file: WebSeedFile }` | `WebSeedResult` or `undefined` |
| `batch(query)` | `{ hash, name, files: WebSeedFile[] }` | `WebSeedResult[]` or `undefined` |

**`WebSeedFile`:**

```js
{ name: "episode-05.mkv", index: 2 }
```

**`WebSeedResult`:**

```js
{
  url: "https://cdn.example.com/...",
  authorization: `Bearer ${token}`,  // optional, for private sources
  index: 2,                       // optional, matches WebSeedFile index
  rateLimit: 300                  // optional, requests/second
}
```

***

## Subtitle Extensions

Subtitle extensions search for subtitle files. They only need a `single` method since subtitles are matched per-episode.

**Minimal example:**

```js
export default new class extends SubtitleSource {
  async test() {
    const res = await fetch("https://subs.example.com")
    return res.ok
  }

  single({ anilistId, episode, titles, fetch }) {
    return [
      { url: `https://subs.example.com/${anilistId}/${episode}/en.vtt`, language: "US" },
      { url: `https://subs.example.com/${anilistId}/${episode}/es.vtt`, language: "ES" }
    ]
  }
}
```

The query is an `AnimeQuery` without `resolution` or `exclusions`. Each result needs a direct URL to a subtitle file (VTT, SRT, ASS, SSA, TXT, etc.) and a two-letter language code.

***

## Using Options

If your manifest defines an `options` object, those values are passed to your extension methods as the second argument. Use them to let users configure API keys, toggle features, or set preferences:

```js
single(query, options) {
  if (!options.apiKey) {
    throw new Error("API key is required. Set it in extension settings.")
  }

  return searchWithKey(query, options.apiKey)
}
```

The options object is a `Record<string, number | string | boolean>` where each key matches one defined in the manifest, with the value resolved to the user's configured setting or the default.

***

## Error Handling

Any of your extension's methods can throw an error if something goes wrong - for example if a network request fails, the response is in an unexpected format, or the extension isn't configured properly. Throw errors with user-friendly messages:

```js
single(query) {
  const res = await query.fetch("https://example.com/api")
  if (!res.ok) throw new Error("The source site returned an error. Try again later.")
  const data = await res.json()
  if (!data.results) throw new Error("Unexpected response format from source.")
  // ...
}
```

The error message is shown directly to the user, so make it descriptive and explain what went wrong and how to fix it.

***

## Online/Offline Mode

Hayase queries extensions and shows search results even when the user is offline, allowing them to see previously searched content and continue watching. You can support offline mode by caching previous search results and returning them when offline, or by hardcoding values in the extension's source code. Check connectivity with `navigator.isOnline`:

```js
async single(query) {
  if (!navigator.isOnline) {
    return hardcodedResults[query.anilistId]
  }

  const res = await query.fetch("https://example.com/search")
  const results = await res.json()
  // cache results for offline use
  return results
}
```

Be mindful that the user won't be able to download new content while offline, unless another device on the LAN has it cached via Local Service Discovery.

***

## More Examples

```js
single(query) {
  const results = await fetchResults(query)

  return results
    .filter(r => !query.exclusions.some(ex => r.title.toLowerCase().includes(ex)))
    .map(r => ({
      ...r,
      title: r.title.replace(/^\[.*?\]\s*/, ""),
      seeders: r.seeders ?? 0
    }))
}
```

```js
async single(query) {
  const encrypted = await fetch(`https://example.com/encrypted/${query.anilistId}`)

  const key = await crypto.subtle.importKey(
    "raw",
    decodeKey(),
    { name: "AES-CBC" },
    false,
    ["decrypt"]
  )

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-CBC", iv: new Uint8Array(16) },
    key,
    await encrypted.arrayBuffer()
  )

  return parseResults(decrypted)
}
```

***

## Type Reference

### `AnimeQuery`

The base query object passed to torrent, subtitle, and (in part) NZB/HTTP extensions.

```ts
interface AnimeQuery {
  media: any                    // AniList Media object
  anilistId: number             // AniList anime ID
  anidbAid?: number             // AniDB anime ID
  anidbEid?: number             // AniDB episode ID
  tvdbId?: number               // TheTVDB anime ID
  tvdbEId?: number              // TheTVDB episode ID
  imdbId?: string               // IMDb ID
  tmdbId?: string               // TMDB anime ID
  titles: string[]              // Titles and alternative titles
  episode: number               // Episode number
  episodeCount?: number         // Total episode count for the series
  absoluteEpisodeNumber?: number // Absolute episode number for non-standard numbering
  resolution: '2160' | '1080' | '720' | '540' | '480' | ''
  exclusions: string[]          // Keywords to exclude from searches, this might be unsupported codecs (e.g., "x265"), sources (e.g., "web-dl"), or other keywords (e.g., "uncensored")
  fetch: typeof globalThis.fetch // Use instead of global fetch for CORS
}
```

### `NZBQuery`

Extends `AnimeQuery` (without `resolution`/`exclusions`) with hash/name and a file or files field.

```ts
type NZBQuery = {
  hash: string
  name: string
} & Omit<AnimeQuery, 'resolution' | 'exclusions'> & ({ file: string } | { files: string[] })
```

### `WebSeedQuery`

Same shape as NZBQuery but uses `WebSeedFile` instead of raw strings.

```ts
type WebSeedQuery = {
  hash: string
  name: string
} & Omit<AnimeQuery, 'resolution' | 'exclusions'> & ({ file: WebSeedFile } | { files: WebSeedFile[] })
```

### `SubtitleQuery`

`AnimeQuery` without `resolution` or `exclusions`.

```ts
type SubtitleQuery = Omit<AnimeQuery, 'resolution' | 'exclusions'>
```

### `TorrentResult`

```ts
interface TorrentResult {
  title: string           // Torrent title
  link: string            // Magnet link, .torrent URL, or infoHash
  id?: number
  seeders: number
  leechers: number
  downloads: number
  accuracy: 'high' | 'medium' | 'low'
  hash: string            // Info hash
  size: number            // Size in bytes
  date: Date              // Upload date
  type?: 'batch' | 'best' | 'alt'
}
```

### `SubtitleResult`

```ts
interface SubtitleResult {
  url: string      // Direct URL to subtitle file (VTT, SRT, ASS, SSA, TXT, etc.)
  language: string // Two-letter language code (e.g. "US", "JP", "ES")
}
```

### `NZBResult`

```ts
type NZBResult = string // Direct URL to an NZB file, may be gzipped
```

### `WebSeedFile`

```ts
interface WebSeedFile {
  name: string
  index?: number
}
```

### `WebSeedResult`

```ts
interface WebSeedResult {
  url: string
  authorization?: string // Bearer token or similar for private sources
  index?: number
  rateLimit?: number     // Per-file rate limit in requests/second
}
```

### `CountryCodes`

Union of supported country/language codes used in the `languages` manifest field and subtitle results.

```ts
type CountryCodes = 'ALL' | 'US' | 'JP' | 'KR' | 'CN' | 'RU' | 'FR' | 'DE' | 'ES'
  | 'GB' | 'BR' | 'IT' | 'PL' | 'NL' | 'SE' | 'NO' | 'DK' | 'FI'
  | 'PT' | 'MX' | 'AR' | 'CL' | 'CO' | 'AU' | 'CA' | 'IN' | 'ZA'
  // ... and all other ISO 3166-1 alpha-2 country codes
```

The `'ALL'` value indicates all languages are supported. For subtitle results, use the two-letter code matching the subtitle language.

### `SearchOptions`

Schema for defining user-configurable options in the manifest JSON. Each key maps to an option that appears in the extension settings UI.

```ts
type SearchOptions = Record<string, {
  type: 'string' | 'number' | 'boolean' | 'select'
  description: string
  values?: any[]
  default: any
}>
```

At runtime, options are passed to extension methods as a flat `Record<string, number | string | boolean>` with values resolved to the user's configured setting or the default.

***

## Best Practices

* **Prefer ID-based lookups** over string searches - they're far more accurate.
* **Only use `"best"` / `"alt"`** for manually verified releases. Never guess.
* **Respect `exclusions`** - filter out results matching those keywords.
* **Handle errors and timeouts** - network requests should fail gracefully.
* **Bundle your script** - the worker environment has no module resolution.
* **Test your `test()` method** - make sure it returns `true` only when everything works.
