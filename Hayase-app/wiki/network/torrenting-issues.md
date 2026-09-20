# Common Torrenting Issues

This guide covers the most common connectivity issues when torrenting with Hayase.

## CGNAT and Peer Limits

CGNAT detection, impact, and workarounds are now documented in the connection troubleshooting guide.

See [Connection Issues - CGNAT and Peer Limits](../troubleshooting/connection-issues.md#cgnat-and-peer-limits).

## Port Forwarding (Why it matters)

### What is Port Forwarding?

Port forwarding tells your router where to send incoming connections.

**Without port forwarding:**

```
Peer → Tries to connect → Your router
                              ↓
                          "Which device?"
                              ↓
                          Drops connection
```

**With port forwarding:**

```
Peer → Tries to connect → Your router
                              ↓
                    "Port 6881 → Your PC"
                              ↓
                          Connection succeeds
```

### Why BitTorrent Needs It

BitTorrent is peer-to-peer. Connections go both ways:

**Outgoing connections (always work):**

```
You → Initiate connection → Peer
```

**Incoming connections (need port forwarding):**

```
Peer → Initiate connection → You
```

**Impact:**

**With port forwarding:**

* You can connect to all peers
* All peers can connect to you
* Maximum peer pool: Everyone in swarm

**Without port forwarding:**

* You can connect to peers with port forwarding
* Peers can't connect to you
* Limited peer pool: Only ~30% of swarm

**Real numbers:**

```
Swarm size: 100 peers
With forwarding: You can potentially connect to all 100
Without forwarding: You can connect to ~30 (those with forwarding)

Result: 3x fewer connections = slower speeds, less reliability
```

### How to Set Up Port Forwarding

**Step 1: Find your local IP**

**Windows:**

```cmd
ipconfig
Look for: IPv4 Address under your connection
Example: 192.168.1.100
```

**Linux:**

```bash
ip addr show
Look for: inet under your connection
Example: 192.168.1.100
```

**macOS:**

```bash
ifconfig
Look for: inet under en0 or en1
Example: 192.168.1.100
```

**Step 2: Access router admin panel**

Common router IPs:

* 192.168.1.1
* 192.168.0.1
* 10.0.0.1
* 192.168.1.254

```
1. Open browser
2. Go to http://192.168.1.1 (or your router's IP)
3. Log in (check router label for default password)
```

**Step 3: Find port forwarding settings**

Look for sections named:

* Port Forwarding
* Virtual Server
* NAT Forwarding
* Applications and Gaming
* Advanced → Port Forwarding

**Step 4: Create forwarding rule**

**Example rule:**

```
Service Name: Hayase
Protocol: TCP+UDP (or Both)
External Port: 36881 [or any other port you forwarded]
Internal Port: 36881 [or any other port you forwarded]
Internal IP: 192.168.1.100 (your PC's IP)
Enabled: Yes
```

**Save and apply.**

Or use NAT like UPnP/NAT-PMP if supported.

**Step 5: Configure Hayase (if NAT isn't supported)**

In Hayase settings:

```
Client → Forwarded Torrent Port → 36881 [or any other port you forwarded]
Restart Hayase
```

**Step 6: Test**

Visit: https://www.yougetsignal.com/tools/open-ports/

```
Remote Address: (your public IP)
Port Number: 36881 [or any other port you forwarded]
Check Port

Should say: "Port 36881 is open"
```

### Common Port Forwarding Issues

**Issue: Port test fails**

**Possible causes:**

1. **Firewall blocking port**
   ```
   Windows: Allow Hayase through firewall
   Linux: sudo ufw allow 36881/tcp; sudo ufw allow 36881/udp
   ```

2. **Wrong internal IP**
   ```
   Verify your PC's current IP hasn't changed
   Consider setting static IP
   ```

3. **ISP blocks port**
   ```
   Try different port (e.g., 51413, 52525)
   Some ISPs block standard BitTorrent ports
   ```

4. **CGNAT** (see above section)
   ```
   Port forwarding won't work
   Need VPN or public IP
   ```

**Issue: Port opens but no peers connect**

**Possible causes:**

1. Hayase not running
2. Hayase using different port than forwarded
3. Takes time for DHT to propagate

**Wait 5-10 minutes, restart Hayase**

**Issue: IP address keeps changing**

**Solution: Set static IP**

**In router:**

```
DHCP → Address Reservation
Add: MAC address → Fixed IP (e.g., 192.168.1.100)
```

**Or on PC:**

**Windows:**

```
Network Settings → Change adapter → Properties
IPv4 Properties → Use the following IP
IP: 192.168.1.100
Subnet: 255.255.255.0
Gateway: 192.168.1.1
DNS: 8.8.8.8
```

## Improving Peer Discovery

Beyond port forwarding, there are several ways to improve peer discovery.

### DHT (Distributed Hash Table)

**What it is:**
A decentralized peer discovery system. Doesn't rely on trackers.

**How it works:**

```
You → Ask DHT network: "Who has torrent X?"
DHT → Returns: List of peers
You → Connect directly to peers
```

**Advantages:**

* Works when trackers are down
* Works for trackerless torrents
* More resilient

**Enable in Hayase:**

```
Settings → Client → Enable DHT: ✓
```

**Should always be enabled!**

### PEX (Peer Exchange)

**What it is:**
Peers share lists of other peers they're connected to.

**How it works:**

```
You → Connected to Peer A
Peer A → "I'm also connected to Peers B, C, D"
You → Connect to B, C, D as well
```

**Advantages:**

* Fast peer discovery
* No tracker needed
* Helps find rare peers

**Enable in Hayase:**

```
Settings → Client → Enable PEX: ✓
```

**Should always be enabled!**

### LSD (Local Service Discovery)

**What it is:**
Finds peers on your local network.

**How it works:**

```
You → Broadcast on LAN: "Who has torrent X?"
Family member's PC → "I do!"
You → Connect via LAN (super fast!)
```

**Advantages:**

* LAN speeds (often 100+ MB/s)
* No internet needed
* Helps with large batches

**Should always be enabled!**

**Useful if:**

* Multiple people in household use Hayase
* You run Hayase on multiple devices
* You're on a large LAN (college dorm, etc.)

### Connection Limits

**Increase max connections:**

```
Settings → Client → Max Number of Connections
Default: 15-50
Recommend: 50-100 (for better peer discovery)
```

## NAT Traversal Problems

### UPnP (Universal Plug and Play)

**What it is:**
Automatic port forwarding via router.

**How it works:**

```
Hayase → Asks router: "Please forward port 6881 to me"
Router → "OK, done"
```

**Advantages:**

* No manual configuration
* Works automatically
* Adapts to IP changes

**Disadvantages:**

* Not all routers support it
* Some routers have buggy UPnP
* Security concerns (some disable it)

**Test if working:**

```
Hayase → Should show "NAT-PMP/UPnP automatic forwarding" in protocol status
If not → Manually configure port forwarding
```

### NAT-PMP (NAT Port Mapping Protocol)

**What it is:**
Similar to UPnP, alternative protocol.

**Usually automatic, no configuration needed.**

## Summary

### Quick Fixes for Poor Connectivity

**Immediate:**

1. Make sure DHT, PEX, LSD is enabled
2. Enable UPnP/NAT-PMP in router
3. Try different torrents (current one might be dead)

**If still poor:**

1. Set up manual port forwarding
2. Test with port checker
3. Verify firewall not blocking

**If behind CGNAT:**

1. Get VPN with port forwarding (recommended)
2. Request public IP from ISP
3. Try IPv6
4. Or use NZB extensions instead

### Connectivity Checklist

* \[ ] NAT forwarding enabled
* \[ ] Port forwarding configured
* \[ ] Port test passes
* \[ ] Firewall allows Hayase
* \[ ] Not behind CGNAT (or using VPN)
* \[ ] Using popular torrents (more seeders)

**If all checked and still issues:**
The torrent is likely dead. Try different content.

***

**Related:**

* [Bypassing Blocks](bypassing-blocks.md)
* [Connection Issues](../troubleshooting/connection-issues.md)
* [Basic Usage](../getting-started/basic-usage.md)
