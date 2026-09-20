# Managing Content

## Importing Existing Torrent Libraries

Hayase does **not** scan folders like Plex or Jellyfin. To reuse an existing library, you need to align Hayase’s storage with your current media location.

### Use an Existing Media Folder

1. Set **Torrent Download Location** to the folder where your existing media already lives.
2. Enable **Persist Files** (otherwise Hayase deletes downloaded files once you finish watching).

With this setup, when you search for torrents for a given episode and play one you already have, Hayase will recognize the files and avoid re-downloading them. This doesn’t work if you move or rename files, so keep your existing torrent structure intact.

### Optional: Make Hayase List Your Existing Torrents

If you want Hayase to show your downloaded torrents in the Library UI **before** you select them from episode search, you must import the torrent files manually:

1. Locate your **Torrent Download Location**.
2. Open its **hayase-cache** folder.
3. Copy your `.torrent` files into **hayase-cache**.
4. Rename each `.torrent` file to its **infoHash** (a 40‑character hexadecimal string), with **no** file extension.

After this, Hayase can recognize those torrents and list them in the UI. At that point, the search results will show a downloaded icon for the cached torrent. However, the specific episode/anime metadata and download status will only appear **after** you play the torrent from episode search.

### Important Warning

**Copy, don’t move** your `.torrent` files into **hayase-cache**.

Hayase modifies `.torrent` files by adding metadata and stripping other fields, which can make them incompatible with other clients and potentially cause data loss if you reuse the same file elsewhere.

## Manually Playing Your Own Torrents

You can play your own torrents without installing a search extension:

1. Open the **Episode Search** modal/UI by clicking an episode on any anime.
2. Paste or drag-and-drop any of the following:
   * Magnet link
   * Torrent file URL
   * Infohash
   * `.torrent` file

Hayase will load the torrent and let you select/play episodes normally.

## Organizing Your Library

Open the **Library** tab in the torrent client to manage everything Hayase has stored. This view is your "source of truth" for what’s on disk and what Hayase considers part of your library.

For each torrent you’ll see at a glance:

* The anime it belongs to and the specific episode
* File count and total size
* Download status (completed or in progress)
* Last played date (useful for finding what you watched recently)
* Full torrent name (to identify different releases or batches)

Use this page to organize your content:

* **Delete** removes selected torrents and their stored files from disk.
* **Rescan** re-verifies the stored data so Hayase can confirm integrity after crashes, disk issues, or manual file changes.
