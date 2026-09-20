# Windows Troubleshooting

## Common Windows Problems

**App won't start:**

* Run as administrator (once)
* Check Windows Defender
* Update Windows
* Reinstall

**Slow performance:**

* Disable antivirus temporarily to test
* Check Task Manager for resource usage
* Update GPU drivers

## Antivirus/Windows Defender Interference

**Windows Defender flags Hayase:**

This is normal - BitTorrent functionality triggers warnings.

**Solution:**

1. Windows Security → Virus & threat protection
2. Manage settings → Exclusions
3. Add exclusion → Folder
4. Select Hayase installation folder
5. Restart Hayase

**Safe?**
Yes - Hayase is open source, false positive from torrenting

## Network/Firewall Configuration

**Windows Firewall blocking:**

**Allow Hayase:**

1. Windows Firewall → Allow app
2. Click "Change settings"
3. "Allow another app"
4. Browse to Hayase.exe
5. Check both Private and Public
6. OK

**Port forwarding:**
See [Torrenting Issues](../../network/torrenting-issues.md#port-forwarding-setup)

## GPU Acceleration Problems

### NVIDIA Driver Issues

**Common driver bugs:**

NVIDIA drivers can sometimes cause severe glitches such as no video output or the entire UI looking "deep fried."

**Recommended fix:**

Use DDU [(Display Driver Uninstaller)](https://www.guru3d.com/download/display-driver-uninstaller-download/) to fully remove the NVIDIA drivers, then reinstall the latest driver from scratch.

**Update drivers:**

1. GeForce Experience → Drivers → Check for updates
2. Or: nvidia.com → Download latest

**If issues persist:**

* Try different ANGLE backend
* Settings → Video → ANGLE Backend → OpenGL (not recommended)

### AMD Driver Issues

**Update:**
AMD Adrenalin software → Update drivers

**If issues:**

* Try OpenGL backend

### Intel GPU Issues

**Update:**
Intel Driver & Support Assistant

### Multi-GPU Configurations

1. NVIDIA Control Panel → Manage 3D settings
2. Program Settings → Add Hayase
3. Select: "High-performance NVIDIA processor"
4. Apply

or via Windows Graphics Settings:

1. Settings → System → Display → Graphics settings
2. Browse Hayase.exe
3. Options → High performance → Save

***

**Related:** [Settings Reference](../../settings/settings-reference.md)
