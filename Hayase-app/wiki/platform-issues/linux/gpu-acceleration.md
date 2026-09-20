# Linux GPU Acceleration

## GPU acceleration is crucial for smooth app usage, especially for high-resolution content. Linux GPU support can be complex due to multiple graphics stacks, drivers, and display servers.

## Force GPU Rendering

### Electron/Chromium Flags

Hayase uses Electron, which is based on Chromium. You can pass flags to force GPU acceleration.

**Create launcher script:**

```bash
#!/bin/bash
exec /path/to/Hayase.AppImage \
  --flag \
  "$@"
```

**Common flags:**

```bash
# Force specific GPU (multi-GPU)
--use-gl=desktop
--use-angle=gl

--ozone-platform=x11  # For X11
--ozone-platform=wayland  # For Wayland
-enable-features=UseOzonePlatform 
```

## ANGLE Backend Selection

Hayase allows choosing the ANGLE backend, which is the translation layer between Electron and your GPU.

### Available Backends

**Auto (Recommended):**

* Hayase chooses best option
* Usually works well

**OpenGL:**

* Most compatible
* Works on all GPUs
* Lower performance

**D3D11 (Windows only):**

* Not available on Linux

### Changing Backend

**In Hayase Settings:**

1. Settings → Interface → ANGLE Backend
2. Select backend

If you can't open the app, you can edit the native settings file directly inside the `~/.config/Hayase/settings.json` directory:

```json
{
  "angle": "gl"  // or "default"
}
```

**Settings File:**

## Wayland-Specific Issues

### Hardware Acceleration on Wayland

Wayland + GPU acceleration can be problematic:

**Enable Wayland support:**

```bash
./Hayase.AppImage --enable-features=UseOzonePlatform --ozone-platform=wayland
```

**Common issues:**

* Flickering
* Poor performance
* Crashes

**Solution:**

```bash
# Often better to use X11/XWayland
./Hayase.AppImage --enable-features=UseOzonePlatform --ozone-platform=x11
```

## Troubleshooting Checklist

### Video Won't Play / Black Screen

1. **Check driver installation**
2. **Check VAAPI**

### Poor Performance / Stuttering

1. **Verify using correct GPU**
2. **Check power profile (AMD)**
3. **Try different ANGLE backend**
4. **Enable all acceleration flags**

### Crashes During Playback

1. **Check dmesg for errors**
2. **Update drivers**
3. **Try software decoding**
4. **Check Vulkan (if using)**

***

**Related:**

* [Linux Display Server Issues](display-server-issues.md)
* [General Linux Issues](general-linux-issues.md)
* [Settings Reference](../../settings/settings-reference.md)
