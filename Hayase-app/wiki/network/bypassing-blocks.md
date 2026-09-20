# Bypassing ISP/DNS Blocking

Many ISPs and countries block access to torrent sites, metadata services, and other resources that Hayase needs. This guide explains why blocking happens and how to bypass it.

## What Gets Blocked?

ISPs and governments block access at different levels:

### 1. The App Loading

In some regions, even Hayase's initial connection might be blocked:

* App loading
* App update checks

**Impact:** App may fail to start or show errors

### 2. Metadata APIs

Hayase fetches metadata from services like:

* **AniList** - Anime information, thumbnails
* **TVDB** - Anime episode information, thumbnails
* Other similar services

**Impact:**

* No thumbnails or episode descriptions
* Episodes show as "Episode 01" instead of actual title
* Torrent search might not work

### 3. Extension Sources

Extensions connect to external websites to search for content:

* Torrent indexer sites
* Usenet indexers
* RSS feeds

**Impact:**

* Extensions show "offline" or "error"
* Search returns no results
* Can't browse or find content

### 4. Watch Together (W2G)

The P2P signaling for synchronized watching:

* Connection establishment servers
* STUN/TURN servers for NAT traversal

**Impact:**

* Can't connect to friends
* W2G features don't work
* See [WatchTogether Integration](w2g-integration.md)

### 5. Torrent Trackers

The trackers that help you find peers:

* Public tracker domains
* Private tracker domains

**Impact:**

* Can't find peers for some torrents
* Slower peer discovery
* May still work via DHT (Distributed Hash Table)
* Outdated peer counts in torrent search UI

## Why Blocking Occurs

### DNS Blocking (Most Common)

**How it works:**

1. Your device asks DNS: "What's the IP address of example.com?"
2. Your ISP's DNS responds: "It doesn't exist" (lie)
3. Your device can't connect

**Why ISPs do this:**

* Easiest to implement
* Court orders often require DNS blocking
* Doesn't require deep packet inspection

**Easy to bypass!**

### IP Blocking

**How it works:**

1. Your ISP blocks traffic to specific IP addresses
2. Any connection attempt is dropped

**Why ISPs do this:**

* More thorough than DNS blocking
* Harder to bypass
* Required in some jurisdictions

**Can be bypassed with VPN**

### Deep Packet Inspection (DPI)

**How it works:**

1. Your ISP analyzes the content of your traffic
2. Identifies BitTorrent protocol patterns
3. Throttles or blocks the connection

**Why ISPs do this:**

* To reduce bandwidth usage
* To comply with anti-piracy measures
* To manage network congestion

**Requires VPN**

## Bypassing Methods

### Method 1: DNS over HTTPS (DoH)

**What it is:**

* Encrypts DNS queries
* Sends them via HTTPS (looks like normal web traffic)
* Uses trusted DNS servers (Cloudflare, Google, etc.)

**Advantages:**

* Bypasses DNS blocking
* Easy to configure
* No additional software needed
* Works for most cases

**Limitations:**

* Doesn't bypass IP blocking
* Doesn't encrypt your actual traffic
* Doesn't hide what you're doing from ISP

**How to enable in Hayase:**

1. Go to **Settings** → **Client**
2. Enable **DNS over HTTPS**
3. Choose a provider:
   * Cloudflare (https://cloudflare-dns.com/dns-query) - Recommended
   * Google (https://dns.google/dns-query)
   * Quad9 (https://dns.quad9.net/dns-query)
4. Restart Hayase

**If the app won't launch:**

You can enable DoH manually in the settings file:

* Windows: %APPDATA%/Hayase/settings.json
* Linux: ~/.config/hayase/settings.json
* macOS: ~/Library/Application Support/Hayase/settings.json

Add this key/value and save:

"doh":"https://cloudflare-dns.com/dns-query"

**Alternative: System-level DoH**

**Windows 11:**

```
Settings → Network → Ethernet/WiFi → Properties
→ DNS settings → Preferred DNS encryption: "Encrypted preferred"
```

**Linux (systemd-resolved):**

```bash
sudo nano /etc/systemd/resolved.conf

[Resolve]
DNS=1.1.1.1
DNSOverTLS=yes
```

**macOS:**
Use a DoH client like [DNSCrypt](https://github.com/DNSCrypt/dnscrypt-proxy)

**Android:**

```
Settings → Network & Internet → Private DNS
→ "Private DNS provider hostname"
→ Enter: 1dot1dot1dot1.cloudflare-dns.com
```

### Method 2: Changing DNS Providers

**What it is:**

* Use DNS servers that don't block content
* Doesn't encrypt queries (unlike DoH)

**Advantages:**

* Bypasses DNS blocking
* Very easy to configure
* Works system-wide

**Limitations:**

* ISP can still see DNS queries
* Doesn't bypass IP blocking
* Less private than DoH

**Recommended DNS Servers:**

**Cloudflare:**

* Primary: 1.1.1.1
* Secondary: 1.0.0.1
* Privacy-focused, fast

**Google:**

* Primary: 8.8.8.8
* Secondary: 8.8.4.4
* Reliable, global coverage

**Quad9:**

* Primary: 9.9.9.9
* Secondary: 149.112.112.112
* Security-focused, blocks malicious domains

**OpenDNS:**

* Primary: 208.67.222.222
* Secondary: 208.67.220.220
* Customizable filtering

**How to change:**

**Windows:**

```
Control Panel → Network and Sharing Center
→ Change adapter settings → Right-click connection
→ Properties → Internet Protocol Version 4
→ Use the following DNS servers
```

**Linux:**

```bash
# Edit /etc/resolv.conf
nameserver 1.1.1.1
nameserver 1.0.0.1
```

**macOS:**

```
System Preferences → Network → Advanced
→ DNS tab → Add DNS servers
```

### Method 3: VPN (Virtual Private Network)

**What it is:**

* Encrypts ALL your traffic
* Routes it through a server in another location
* Makes it appear you're in a different country

**Advantages:**

* Bypasses all blocking (DNS, IP, DPI)
* Hides your activity from ISP
* Changes your apparent location
* Encrypts torrent traffic

**Limitations:**

* Costs money (good VPNs aren't free)
* Slower speeds (adds overhead)
* Requires additional software

**Recommended VPN Features for Hayase:**

* No logging policy
* Good speeds (for streaming)
* Port forwarding support (for better torrenting)
* Kill switch (disconnects if VPN drops)

**How to use with Hayase:**

1. Install VPN software
2. Connect to VPN server
3. Launch Hayase
4. Everything now routed through VPN

**Important:** Some VPNs leak DNS queries. Enable DNS leak protection in your VPN settings.

### Method 4: Proxy Servers

**What it is:**

* Routes traffic through an intermediate server
* Can be HTTP, SOCKS5, or other protocols

**Advantages:**

* Can bypass some blocks
* Often free
* Application-specific (doesn't affect whole system)

**Limitations:**

* Less secure than VPN
* May not encrypt traffic
* Unreliable free proxies
* Doesn't help with torrenting directly

**Not recommended for Hayase** - use DoH or VPN instead.

## Testing Your Bypass

### Check if Blocking is Bypassed

**1. Test Extensions:**

* Open Hayase
* Try to load extensions
* Search for content
* If results appear, extensions are accessible

**2. Test Metadata:**

* Search for any anime/show
* Check if thumbnails load
* Check if episode titles appear
* If yes, metadata APIs are accessible

**3. Test Torrenting:**

* Try to stream something
* Check if peers connect
* If yes, trackers are accessible

### Debugging Tools

**Check DNS resolution:**

```bash
# On Windows (PowerShell)
Resolve-DnsName anilist.co

# On Linux/macOS
nslookup anilist.co
dig anilist.co
```

**Check connectivity:**

```bash
# Test if site is reachable
ping anilist.co

# Test if port is open
telnet anilist.co 443
```

**Check your IP and DNS:**
Visit: https://www.dnsleaktest.com/

* Shows your current IP
* Shows which DNS servers you're using
* Tests for DNS leaks

## Troubleshooting

### "Extensions still won't load"

**Tried DNS change/DoH:**

* ISP may be using IP blocking
* Try VPN instead

**Tried VPN:**

* VPN may be blocked
* Try different VPN server
* Try obfuscated VPN protocols

### "Metadata loads but extensions don't"

**Means:**

* DNS works
* But extension sources are IP-blocked

**Solution:**

* Enable VPN specifically for extension connections
* Or use extensions that aren't blocked in your region

### "Everything loads but no torrent peers"

**Different issue:**

* This isn't blocking, it's connectivity
* See [Torrenting Issues](torrenting-issues.md)
* May need port forwarding or CGNAT solutions

### "VPN slows streaming too much"

**Try:**

* Connect to closer VPN server
* Use VPN with better infrastructure

## Privacy Considerations

### What Blocking Bypass Provides

**DNS over HTTPS:**

* Hides DNS queries from ISP
* But ISP still sees what IPs you connect to
* Provides some privacy, not complete

**VPN:**

* Hides everything from ISP
* ISP only sees "connected to VPN"
* VPN provider sees your traffic instead

### What Doesn't Provide Privacy

**Changing DNS servers (without DoH):**

* ISP can still see DNS queries
* Minimal privacy improvement

**Browser-based proxies:**

* Only affects browser traffic
* Doesn't help Hayase

### Best Practices

1. **For basic bypass:** DoH is sufficient
2. **For privacy:** Use VPN
3. **For metadata:** DoH usually enough

**Remember:** Privacy and bypassing blocks are related but different goals!

***

**Related:**

* [Torrenting Issues](torrenting-issues.md)
* [WatchTogether Integration](w2g-integration.md)
* [Extension Issues](../troubleshooting/extension-issues.md)
