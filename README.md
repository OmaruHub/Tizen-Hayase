# Hayase for Samsung Tizen Smart TVs 📺

An open-source community port of **Hayase** optimized specifically for **Samsung Smart TVs** running **Tizen OS** (Tizen 6.0+, Chromium 76+).

---

## ⚖️ Legal Disclaimer

> [!IMPORTANT]
> **Hayase** is purely a standalone frontend media player framework and user interface.
> - This software **does not bundle, preload, host, provide, or recommend** any content, torrents, streams, or third-party extensions.
> - No copyrighted media or preconfigured sources are included in this repository or build.
> - Users are solely responsible for how they use the software and must comply with all applicable local laws and regulations.

---

## 🌟 Features on Samsung TV

- **Full Samsung TV Remote Control Support:** Seamless navigation using the physical TV remote (D-pad, Enter, Back, Play, Pause, Fast-Forward, Rewind, and color keys).
- **In-Player Options & Track Selection:** Easily switch audio languages, subtitle tracks, and playback rates directly using the TV remote.
- **Save State & Natural Back Navigation:** Pressing the remote Back button stops the video cleanly and returns directly to the anime episode list without reloading or infinite loading spinners.
- **TV Focus Engine:** Custom lightweight, high-visibility focus highlight system with zero UI lag on low-power TV processors.
- **Client/Host Companion Architecture:** Connects over the local network via WebSocket to a lightweight PC host server (`npm run host`), offloading heavy torrent parsing, storage management, and network tasks from the TV.
- **QR Code Extension Pairing:** Scan a QR code on your TV screen using your smartphone or PC browser to install your own extension repositories without typing on an on-screen TV keyboard.

---

## 🎮 Remote Control Key Mappings

| Remote Key | Action |
| :--- | :--- |
| **D-Pad (Up / Down / Left / Right)** | Move focus across cards, buttons, lists, and menus |
| **Enter / Select** | Activate focused item, play episode, or expand submenu |
| **Back / Return** | Close active dialog / collapse submenu / cleanly exit video to episode list / exit app on home |
| **Play / Pause / PlayPause** | Toggle video playback |
| **Fast Forward / Rewind** | Seek forward / backward by 10 seconds |
| **Left / Right (during playback)** | Step seek forward / backward |
| **Color Keys (Red / Green / Yellow / Blue)** | Quick TV shortcuts |

---

## 🏗️ Architecture

```
┌──────────────────────────────────────┐          WebSocket           ┌──────────────────────────────────────┐
│         Samsung Smart TV             │ ◄──────────────────────────► │           Host Computer              │
│         (Tizen Client App)           │       (Local Network)        │        (Hayase Host Server)          │
├──────────────────────────────────────┤                              ├──────────────────────────────────────┤
│ • Svelte / SvelteKit Interface       │                              │ • Native BitTorrent Client Engine    │
│ • Hardware Video Decoding            │                              │ • Local Metadata & File Cache        │
│ • Custom D-pad Navigation Engine     │                              │ • Companion Web UI (QR Code Pairing) │
│ • In-Player Options & Subtitles      │                              │ • Background Transcoding Support     │
└──────────────────────────────────────┘                              └──────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

1. **Samsung Smart TV** with Developer Mode enabled:
   - Go to `Apps` on your TV -> Enter `1 2 3 4 5` on your remote -> Turn Developer Mode **ON** -> Enter your PC's local IP address -> Restart the TV (hold Power button until Samsung logo appears).
2. **Tizen Studio** (or Tizen CLI tools: `sdb.exe` and `tizen.bat`).
3. **Node.js 20+** and **pnpm**.

---

### Step 1: Start the PC Host Server

On your host PC (connected to the same local network / Wi-Fi as your TV):

```bash
cd Hayase-app
npm run host
```

This launches the local WebSocket server (default port `9876`) and provides the companion web interface for pairing and extensions.

---

### Step 2: Build the Tizen Widget

```bash
# 1. Install dependencies
cd Hayase-app/interface
pnpm install

# 2. Build frontend
pnpm run build

# 3. Build Tizen package
cd ../tizen
npx tsx build/build.ts
```

This produces the installable widget package at `Hayase-app/tizen/dist/Hayase.wgt`.

---

### Step 3: Connect and Install on TV

```bash
# Connect SDB to your TV's IP address (default port 26101)
sdb connect <TV-IP-ADDRESS>:26101

# Verify the connected device
sdb devices

# Install the widget to your TV
tizen.bat install -n Hayase-app/tizen/dist/Hayase.wgt -t <TV-DEVICE-ID>
```

---

## 📱 Extension Setup

1. Open **Hayase** on your Samsung TV.
2. Navigate to **Settings** -> **Extensions** -> Click **"📱 Scan QR Code to Install from Phone / PC"**.
3. Scan the QR code displayed on the TV screen with your phone camera or open the URL in your PC browser.
4. Paste your extension repository URL in the web companion interface. The TV client will automatically receive and register it over your local network!

---

## 🛠️ Credits & License

- Original Hayase Project by the **Hayase Team**.
- Samsung Tizen Smart TV Port and TV Optimizations by **OmaruHub**.
- Licensed under the **GPL-3.0 License**.
