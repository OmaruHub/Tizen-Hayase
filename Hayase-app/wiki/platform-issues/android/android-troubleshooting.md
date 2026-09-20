# Android Troubleshooting

## WebView Issues

### What is Android System WebView?

Component that displays web content in apps.
Hayase uses WebView for UI.

### Outdated WebView Symptoms

* App crashes on launch
* Videos don't display
* UI looks broken
* Features missing
* JavaScript errors

### Updating System WebView

**Google Play Store:**

1. Open Google Play
2. Search "Android System WebView"
3. Update
4. Restart phone
5. Launch Hayase

### App Not Displaying Video

**Cause:** WebView doesn't support video codec

**Solution:**

1. Update WebView
2. Restart device

### WebView DevTools Flags (Android TV)

If you have performance issues on Android or AndroidTV:

1. Open Settings → App → Open WebView DevTools
2. Enable the following flags:

* ignore-gpu-blocklist \[sometimes WebViews disable GPU acceleration entirely, this prevents that]
* GpuPersistenCache \[might cause subtitles to dissappear]
* WebViewSurfaceControlForTV \[hardware accelerated overlays]
* RelaxLimitAImageReaderMaxSizeToOne \[Hayase uses a lot of images, this helps them load faster, but might negatively impact performance]
* AllowUndamagedNonrootRenderPassToSkip \[prevents unnecessary GPU re-rendering]
* WebviewAccelerateSmallCanvases \[sometimes subtitles aren't GPU accelerated, this fixes that]
* RunTasksByBatches \[accumulates tasks before executing them,]
* UseDMSAAForTiles \[cheaper text and opacity rendering]
* V8BaselineBatchCompliation \[longer initial load but much better performance]
* V8ConcurrentSparkplug \[loads JS with multiple CPU threads]
* V8HighEndAndroid \[this can greatly help performance, but take longer to load, and cause stutters in rare cases, recommended for TVs]
* V8ScavengerHigherCapacity \[uses more memory, but can eliminate a lot of stutters]
* PMProcessPriortyPolicy \[better performance scheduling]
* UseHighPriorityThreadGroup \[allows the app to use high performance threads that are usually reserved for other system tasks]

These flags GREATLY improve performance, and easily **quadruple** framerates on AndroidTV.

### App Crashes on Launch

**Solutions:**

1. Update WebView
2. Clear app data:
   Settings → Apps → Hayase → Storage → Clear Data
3. Reinstall Hayase
4. Restart phone

### Missing JavaScript Features

**Old WebView = missing features**

**Solution:**
Update to latest WebView

## Storage Permissions

**Grant permissions:**

```
Settings → Apps → Hayase → Permissions
→ Storage → Allow
```

**Android 11+:**
Hayase may request "All files access"

## Battery Optimization Problems

**Hayase killed in background:**

**Solution:**

```
Settings → Battery → Battery Optimization
→ All apps → Hayase
→ Don't optimize
```

**Manufacturer-specific:**

* Samsung: Settings → Device Care → Battery → Background usage limits
* Xiaomi: Security → Permissions → Autostart → Enable for Hayase
* Huawei: Settings → Battery → App launch → Hayase → Manual

## Casting Issues

**Can't cast:**

1. Same WiFi network?
2. Chromecast reachable?
3. Hayase has network permission?

**Choppy casting:**

* WiFi quality issue
* Too far from router
* Use 5GHz WiFi

## Performance on Low-End Devices

**Slow/laggy:**

* Lower video quality
* Close other apps
* Try the [WebView DevTools flags](#webview-devtools-flags-android-tv) above

**Crashes:**

* Low RAM
* Consider upgrading device

## NVIDIA Shield Controller Issues

### Buttons Do Not Work (Select, Guide, Others)

NVIDIA makes a system modification. It remaps some controller buttons on the Shield TV.

To fix the issue, disable the `com.nvidia.shieldtech.hooks` package.

**Method 1 - ADB command:**

```
adb shell pm disable-user com.nvidia.shieldtech.hooks
```

**Method 2 - ADB TV App Manager:**

1. Open the ADB TV App Manager app
2. Find the package `com.nvidia.shieldtech.hooks`
3. Select "Disable"

After you disable the package, restart the NVIDIA Shield TV.

***

**Related:** [Installation](../../getting-started/installation.md#mobile-android)
