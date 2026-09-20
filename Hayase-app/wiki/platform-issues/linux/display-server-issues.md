# Electron and Display Server Issues

## X11 Problems

**Common X11 issues:**

**Tearing during video:**

Solution: Enable compositor
Or: Force vsync in GPU driver

**Crashes:**

Update graphics drivers

## Wayland Compatibility

**Enable Wayland:**

```bash
./Hayase.AppImage --ozone-platform=wayland
```

**Issues:**

* May have flickering
* Screen sharing broken
* Some GPUs unstable

**Fix:**
Use x11 instead:

```bash
--ozone-platform=x11
```

## Electron Flags for X11/Wayland

**Common flags:**

```bash
--ozone-platform=wayland
```

**See full guide:** [GPU Acceleration](gpu-acceleration.md)

***

**Related:** [GPU Acceleration](gpu-acceleration.md) | [General Linux Issues](general-linux-issues.md)
