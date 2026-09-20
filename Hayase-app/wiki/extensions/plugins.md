# Plugins

Hayase supports Chrome extensions as plugins, allowing you to extend the app's functionality using the vast ecosystem of existing Chrome extensions.

Unlike content source extensions (torrent, NZB, subtitle, HTTP), plugins are standard Chrome extensions that can modify or enhance Hayase's behavior in various ways.

## Installing Plugins

### From a .crx File

1. Download the `.crx` file from a trusted source
2. Settings → Plugins → Install Plugin → Select .crx file
3. Confirm installation

### From a .zip File

1. Download or package the extension as `.zip`
2. Settings → Plugins → Install Plugin → Select .zip file
3. Confirm installation

### From an Unpacked Directory

1. Have the extension's folder containing `manifest.json` ready
2. Settings → Plugins → Install Plugin → Select manifest.json
3. Confirm installation

## Downloading .crx Files from the Chrome Web Store

To install a Chrome extension as a plugin, you first need to obtain its `.crx` file:

1. Go to the [Chrome Web Store](https://chromewebstore.google.com)
2. Find the extension you want
3. Copy the extension's ID from the URL (e.g., `coolextensionid123` in `https://chromewebstore.google.com/detail/name/coolextensionid123`)
4. Download the `.crx` directly using the following URL pattern:

   ```
   https://clients2.google.com/service/update2/crx?response=redirect&prodversion=150&acceptformat=crx2,crx3&x=id%3D{extension_id}%26uc
   ```

   For example: `https://clients2.google.com/service/update2/crx?response=redirect&prodversion=150&acceptformat=crx2,crx3&x=id%3Dcoolextensionid123%26uc`

   You may need to update `prodversion` to the latest Chrome version if the download fails - check [Wikipedia](https://en.wikipedia.org/wiki/Google_Chrome) for the current release number.

   The extension will show up in your Downloads directory, without a download popup.
5. Install the downloaded `.crx` file in Hayase

## Managing Plugins

### Enabling/Disabling

Settings → Extensions → Plugins → Toggle ON/OFF

### Uninstalling

Settings → Extensions → Plugins → Uninstall

## Notes

* Not all Chrome extensions are compatible - plugins must work within Hayase's sandboxed environment.
* Extensions that require full browser APIs (e.g., `tabs`, `windows`, `bookmarks`) may not function as expected.
* Content scripts and page-modifying extensions may require additional compatibility.
