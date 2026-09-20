# macOS Troubleshooting

## Common macOS Problems

**App won't open:**

* Right-click → Open (bypasses Gatekeeper)
* Or: System Preferences → Security → Open Anyway

**Performance issues:**

* Check Activity Monitor
* Update macOS
* Restart

## Permission Issues (Security & Privacy)

**First launch warning:**

1. System Preferences → Security & Privacy
2. General tab
3. Click lock to make changes
4. "Open Anyway" button
5. Confirm

**Full Disk Access (if needed):**

System Preferences → Security & Privacy
→ Privacy → Full Disk Access
→ Add Hayase

## Network Configuration

**Firewall:**

System Preferences → Security & Privacy
→ Firewall → Firewall Options
→ Add Hayase
→ Allow incoming connections

**VPN:**
Most VPNs work normally with Hayase on macOS

## Video Codec/Hardware Acceleration

**macOS usually handles codecs well**

**If video won't play:**

* Update macOS

**HEVC/H.265:**
Requires macOS 10.13+ with compatible hardware

***

**Related:** [Installation](../../getting-started/installation.md#macos)
