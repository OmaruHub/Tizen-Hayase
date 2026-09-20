# Extension Issues

Problems with extensions and how to solve them.

## Extension Offline

**Symptoms:**

```
Extension shows: 🔴 Offline
Search returns: "Extension unavailable"
```

**Causes:**

**1. Source website is down:**

```
The website the extension searches is offline
Nothing you can do
Wait for site to return
```

**Check:**

```
Visit website manually in browser
If down for you: Probably down for everyone
```

**2. DNS/ISP blocking:**

```
ISP blocks the source website
```

**Solution:**

```
Settings → Network → DNS over HTTPS: Enable
Or use VPN
See: Bypassing Blocks
```

**3. Extension needs update:**

```
Website changed structure
Extension code outdated
```

**Solution:**

```
Settings → Extensions → Check for Updates
Update the extension
```

**4. Rate limiting:**

```
Too many requests to source
Temporary block
```

**Solution:**

```
Wait 10-30 minutes
Don't spam searches
```

## API Rate Limiting

**Symptoms (NZB extensions):**

```
"API limit reached"
"Rate limit exceeded"
"Too many requests"
```

**Causes:**

**1. Indexer daily limit:**

```
Free accounts: 5-10 API calls/day
Paid accounts: Usually unlimited
```

**Check:**

```
Log into indexer website
Check API usage stats
See remaining quota
```

**Solution:**

```
Wait until quota resets (usually daily)
Or upgrade to paid account
```

**2. Too many extensions:**

```
10 NZB extensions × search = 10 API calls
Quickly hits limits
```

**Solution:**

```
Reduce number of NZB extensions
Keep 2-3 max
Disable others
```

**3. Search too broad:**

```
Generic search terms
Returns many results
Uses more API calls
```

**Solution:**

```
Be specific in searches
Use exact titles
Add year if applicable
```

## Metadata Not Loading

**Symptoms:**

```
No thumbnails
No episode titles
No descriptions
Shows "Loading..." indefinitely
```

**Causes:**

**1. Metadata API blocked:**

```
Can't reach AniList, TMDB, etc.
```

**Solution:**

```
Enable DNS over HTTPS
Or use VPN
```

**2. Metadata cache full:**

```
Cache corrupted or full
```

**Solution:**

```
Settings → Storage → Clear Metadata Cache
Will re-download on next view
```

**3. Network timeout:**

```
Slow connection
API servers slow to respond
```

**Solution:**

```
Wait longer
Or check internet speed
```

**Workaround:**

```
Content still plays
Just looks ugly without metadata
Metadata loads when available
```

## Extension Update Problems

**Symptoms:**

```
Update fails
"Download error"
Update incomplete
```

**Solutions:**

**1. Retry update:**

```
Sometimes network hiccup
Try again
```

**2. Uninstall and reinstall:**

```
Settings → Extensions → [Extension] → Uninstall
Then reinstall from Browse Extensions
```

**3. Manual update:**

```
Download .hext file from source
Settings → Extensions → Install from File
```

**4. Check storage:**

```
Ensure enough free space
Updates need space to download
```

***

**Related:**

* [Extensions Overview](../extensions/overview.md)
* [Bypassing Blocks](../network/bypassing-blocks.md)
* [Connection Issues](connection-issues.md)
