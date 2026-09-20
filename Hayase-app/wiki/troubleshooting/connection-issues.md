# Connection Issues

Troubleshooting network and connectivity problems with Hayase.

### CGNAT and Peer Limits

#### What is CGNAT?

**CGNAT** stands for **Carrier-Grade Network Address Translation**. CGNAT is effectively a way for ISPs to cut costs by sharing IP addresses instead of providing each customer with their own public IP. This allows them to sell "high-speed gigabit" or "fibre internet" packages while saving money on IPv4 addresses.

**Here's the problem:** You're paying for faster download speeds, but with CGNAT, you often can't actually use that bandwidth for peer-to-peer applications. Your 1 Gbps connection becomes meaningless when you can only connect to 20-30% of available peers.

**CGNAT is never a good thing for customers.** It comes with severe limitations:

* Connection limits that cause dropouts when running multiple devices or apps
* Complete inability to port forward (breaks gaming, servers, remote access)
* Degraded P2P performance (torrents, VoIP, video calls)
* Speed means nothing if you're locked out of most connections

An ISP advertising "blazing fast fibre" without mentioning CGNAT is selling you hobbled internet. Your network can start cutting out long before you reach those speeds, simply because you're running too many devices or applications simultaneously on your network, CGNAT equipment has hard limits on concurrent connections per customer.

**How it works:**

```
ISP Public IP: 203.0.113.5
    ↓
Your connection: 10.x.x.x (private)
Neighbor's connection: 10.y.y.y (private)
Another neighbor: 10.z.z.z (private)
```

From the internet's perspective, you all have the same IP address.

#### How to Detect CGNAT

**Method 1: Check your router's WAN IP**

1. Log into your router admin panel
2. Look at the WAN/Internet IP address
3. Check if it's a private IP range:
   * 10.0.0.0 to 10.255.255.255
   * 100.64.0.0 to 100.127.255.255 (CGNAT range)
   * 172.16.0.0 to 172.31.255.255
   * 192.168.0.0 to 192.168.255.255

If your WAN IP is in these ranges: You're behind CGNAT

**Method 2: Compare router IP to "what is my IP"**

1. Check router's WAN IP
2. Visit https://whatismyipaddress.com/
3. If they're different AND router shows private IP: CGNAT

**Method 3: Try port forwarding**

1. Set up port forwarding in router
2. Use a port checker (like canyouseeme.org)
3. If it fails despite correct forwarding: Likely CGNAT

#### Impact on Torrenting

CGNAT severely limits your BitTorrent connectivity and **prevents port forwarding** (your ISP controls the public IP).

**Without CGNAT:**

You ←→ Tracker ←→ All peers
You can connect to: Anyone
Anyone can connect to: You

Typical connections: 100-300 peers possible

**With CGNAT:**

You ←→ Tracker ←→ Only peers WITHOUT CGNAT
You can connect to: Only peers with port forwarding
Peers can connect to you: NEVER

Typical connections: 10-50 peers only

**Real-world impact:**

* Can only connect to ~20-30% of swarm
* Other peers can't connect to you
* Significantly slower speeds
* Dead torrents completely unavailable

#### Common CGNAT Situations

**Mobile Networks (4G/5G):**

* Almost always CGNAT
* Carriers have limited IPv4 addresses

**Satellite Internet:**

* Always CGNAT
* Additional latency makes it worse

**Some ISPs:**

* Growing number of residential ISPs use CGNAT
* Especially common in densely populated areas
* IPv4 exhaustion drives this

**College/University Networks:**

* Usually CGNAT
* Often block torrenting entirely

**Public WiFi:**

* Always CGNAT
* Often has additional restrictions

#### Solutions

**1. Get a VPN (Recommended)**

A VPN gives you a public IP and allows port forwarding:

```
You → VPN → Internet
     ↓
  Public IP (forwarded port)
```

**How it helps:**

* VPN provider gives you a routable public IP
* You can forward ports through VPN
* Peers can connect directly to you via VPN

**Requirements:**

* VPN must support port forwarding
* Not all VPNs do (check before subscribing)

**Setup:**

1. Subscribe to VPN with port forwarding
2. Connect to VPN
3. Enable port forwarding in VPN app
4. Note the assigned port number
5. Configure Hayase to use that port
6. Test connectivity

**2. Request Public IP from ISP**

Some ISPs will give you a public IP if you ask:

1. Contact ISP support
2. Ask for "non-CGNAT connection" or "public IP address"
3. May cost extra ($5-10/month typically)
4. May only be available on business plans

**Worth trying if:**

* You don't want to pay for VPN
* ISP offers it affordably

**3. Use IPv6**

If both you and peers have IPv6:

Your ISP → Gives you real IPv6 address
Peers with IPv6 → Can connect directly

Bypasses CGNAT completely!

**How to enable:**

1. Check if ISP provides IPv6
2. Enable IPv6 in router
3. Test connectivity

**Limitations:**

* Both you and peer need IPv6
* Not all torrents have IPv6 peers
* Not a complete solution yet

**4. Rely on Peers with Port Forwarding**

Without solving CGNAT:

You can still connect to peers who have port forwarding
Just can't accept incoming connections

Works okay if many seeders have port forwarding

**Tips to maximize connections:**

* Use popular torrents (more peers = more with port forwarding)
* Use DHT and PEX (helps find peers)
* Be patient (connections build up slowly)

**5. Use NZB Extensions Instead**

Usenet doesn't use peer connections:

```
You → Usenet Server
     ↓
  Downloads directly

No peers needed!
```

**Advantages:**

* CGNAT doesn't matter
* Consistently fast
* More reliable

**Limitations:**

* Usually paid service
* Not all torrents available

See [NZB Extensions](../extensions/nzb-extensions.md) for details.

### Port Forwarding Setup

**Quick setup:**

1. Choose port: for example 36881
2. Find your local IP: ipconfig (Windows) or ip addr (Linux)
3. Router admin → Port Forwarding
4. Forward port 36881 TCP+UDP to your local IP
5. Hayase Settings → Network → Port: 36881
6. Test at canyouseeme.org

**Detailed guide:**
See [Torrenting Issues - Port Forwarding](../network/torrenting-issues.md#port-forwarding-why-it-matters)

### Dead Torrents

**How to identify:**

Torrent info shows:

* Seeders: 0
* Peers: 0-2
* Last seen: Months/years ago

**What to do:**

1. Wait 5-10 minutes (sometimes seeders appear)
2. Try different torrent of same content
3. Use NZB extension instead (can revive dead content)

**Prevention:**

* Check seeder count before downloading
* Prefer torrents with 10+ seeders
* Use recent uploads

## App Won't Load

### DNS/Network Blocking

**Symptoms:**

* Extensions show "offline"
* Can't load app interface
* Metadata won't fetch
* "Connection failed" errors

**Cause:**
ISP blocks domains Hayase needs

**Quick fix:**

1. Settings → Client → Use DNS over HTTPS: Enable
2. Choose provider: Cloudflare
3. Restart Hayase

**Complete guide:**
See [Bypassing Blocks](../network/bypassing-blocks.md)

### Extension Loading Failures

**Symptoms:**

"Extension failed to load"
"Extension error"

**Causes:**

**1. Network blocking:**

Can't download extension files
Solution: Enable DoH or VPN

**2. Extension incompatible:**

Old extension, new Hayase
Or vice versa
Solution: Update both

**3. Invalid extension URL**

Extension source URL is wrong
Solution: Check URL, make sure it points to a .json file

## Nothing connects

**Nuclear option: Reset:**

1. Close Hayase completely
2. Delete cache folder:
   Windows: %APPDATA%/Hayase/
   Linux: ~/.config/hayase/
   macOS: ~/Library/Application Support/Hayase/
3. Reinstall Hayase
4. Reconfigure settings

**Preserve app but clear cache:**

Settings → App → Reset EVERYTHING To Defaults
Keeps app but clears all data and settings

***

**Related:**

* [Torrenting Issues](../network/torrenting-issues.md)
* [Bypassing Blocks](../network/bypassing-blocks.md)
* [Extension Issues](extension-issues.md)
