# Known General Linux Issues

* No audio
* Permission denied errors
* No GPU acceleration

You're alone here. DYOR.

## AppImage Issues

**Won't run:**

```bash
# Make executable
chmod +x Hayase.AppImage

# Try with --appimage-extract-and-run
./Hayase.AppImage --appimage-extract-and-run

# If FUSE error
sudo apt install fuse libfuse2
```

***

**Related:** [Display Server Issues](display-server-issues.md) | [GPU Acceleration](gpu-acceleration.md)
