import type {
  HttpOptions,
  PermissionState,
  PluginListenerHandle
} from '@capacitor/core'

interface PermissionStatus {
  publicStorage: PermissionState
}

export enum Directory {
  /**
   * The Documents directory.
   * On iOS it's the app's documents directory.
   * Use this directory to store user-generated content.
   * On Android it's the Public Documents folder, so it's accessible from other apps.
   * It's not accesible on Android 10 unless the app enables legacy External Storage
   * by adding `android:requestLegacyExternalStorage="true"` in the `application` tag
   * in the `AndroidManifest.xml`.
   * On Android 11 or newer the app can only access the files/folders the app created.
   *
   * @since 1.0.0
   */
  Documents = 'DOCUMENTS',

  /**
   * The Data directory.
   * On iOS it will use the Documents directory.
   * On Android it's the directory holding application files.
   * Files will be deleted when the application is uninstalled.
   *
   * @since 1.0.0
   */
  Data = 'DATA',

  /**
   * The Library directory.
   * On iOS it will use the Library directory.
   * On Android it's the directory holding application files.
   * Files will be deleted when the application is uninstalled.
   *
   * @since 1.1.0
   */
  Library = 'LIBRARY',

  /**
   * The Cache directory.
   * Can be deleted in cases of low memory, so use this directory to write app-specific files.
   * that your app can re-create easily.
   *
   * @since 1.0.0
   */
  Cache = 'CACHE',

  /**
   * The external directory.
   * On iOS it will use the Documents directory.
   * On Android it's the directory on the primary shared/external
   * storage device where the application can place persistent files it owns.
   * These files are internal to the applications, and not typically visible
   * to the user as media.
   * Files will be deleted when the application is uninstalled.
   *
   * @since 1.0.0
   */
  External = 'EXTERNAL',

  /**
   * The external storage directory.
   * On iOS it will use the Documents directory.
   * On Android it's the primary shared/external storage directory.
   * It's not accesible on Android 10 unless the app enables legacy External Storage
   * by adding `android:requestLegacyExternalStorage="true"` in the `application` tag
   * in the `AndroidManifest.xml`.
   * It's not accesible on Android 11 or newer.
   *
   * @since 1.0.0
   */
  ExternalStorage = 'EXTERNAL_STORAGE',

  /**
   * SDCARD when configured as Portable Storage
   * Points to application private storage on the SD Card when configured as
   * Portable Storage.
   * On iOS it will use the Documents directory
   *
   * @since 5.0.5
   */
  PortableStorage = 'PORTABLE_STORAGE',
}

interface ReaddirOptions {
  /**
   * The path of the directory to read
   *
   * @since 1.0.0
   */
  path: string

  /**
   * The `Directory` to list files from
   *
   * @since 1.0.0
   */
  directory?: Directory
}

interface StatOptions {
  /**
   * The path of the file to get data about
   *
   * @since 1.0.0
   */
  path: string

  /**
   * The `Directory` to get the file under
   *
   * @since 1.0.0
   */
  directory?: Directory
}

interface ReaddirResult {
  /**
   * List of files and directories inside the directory
   *
   * @since 1.0.0
   */
  files: FileInfo[]
}

interface FileInfo {
  /**
   * Name of the file or directory.
   */
  name: string
  /**
   * Type of the file.
   *
   * @since 4.0.0
   */
  type: 'directory' | 'file'

  /**
   * Size of the file in bytes.
   *
   * @since 4.0.0
   */
  size: number

  /**
   * Time of creation in milliseconds.
   *
   * It's not available on Android 7 and older devices.
   *
   * @since 4.0.0
   */
  ctime?: number

  /**
   * Time of last modification in milliseconds.
   *
   * @since 4.0.0
   */
  mtime: number

  /**
   * The uri of the file.
   *
   * @since 4.0.0
   */
  uri: string
}

interface StatResult {
  /**
   * Type of the file.
   *
   * @since 1.0.0
   */
  type: 'directory' | 'file'

  /**
   * Size of the file in bytes.
   *
   * @since 1.0.0
   */
  size: number

  /**
   * Time of creation in milliseconds.
   *
   * It's not available on Android 7 and older devices.
   *
   * @since 1.0.0
   */
  ctime?: number

  /**
   * Time of last modification in milliseconds.
   *
   * @since 1.0.0
   */
  mtime: number

  /**
   * The uri of the file
   *
   * @since 1.0.0
   */
  uri: string
}

interface isPortableStorageAvailableResult {
  /**
   * Is portable storage available (SD Card)
   * Only available on Android
   *
   * @since 5.0.5
   */
  available: boolean
}

interface DownloadFileOptions extends HttpOptions {
  /**
   * The path the downloaded file should be moved to.
   *
   * @since 5.1.0
   */
  path: string
  /**
   * The directory to write the file to.
   * If this option is used, filePath can be a relative path rather than absolute.
   * The default is the `DATA` directory.
   *
   * @since 5.1.0
   */
  directory?: Directory
  /**
   * An optional listener function to receive downloaded progress events.
   * If this option is used, progress event should be dispatched on every chunk received.
   * Chunks are throttled to every 100ms on Android/iOS to avoid slowdowns.
   *
   * @since 5.1.0
   */
  progress?: boolean
  /**
   * Whether to create any missing parent directories.
   *
   * @default false
   * @since 5.1.2
   */
  recursive?: boolean
}

interface DownloadFileResult {
  /**
   * The path the file was downloaded to.
   *
   * @since 5.1.0
   */
  path?: string
  /**
   * The blob data of the downloaded file.
   * This is only available on web.
   *
   * @since 5.1.0
   */
  blob?: Blob
}

interface ProgressStatus {
  /**
   * The url of the file being downloaded.
   *
   * @since 5.1.0
   */
  url: string
  /**
   * The number of bytes downloaded so far.
   *
   * @since 5.1.0
   */
  bytes: number
  /**
   * The total number of bytes to download for this file.
   *
   * @since 5.1.0
   */
  contentLength: number
}

/**
 * A listener function that receives progress events.
 *
 * @since 5.1.0
 */
type ProgressListener = (progress: ProgressStatus) => void

export interface FilesystemPlugin {
  /**
   * Return a list of files from the directory (not recursive)
   *
   * @since 1.0.0
   */
  readdir: (options: ReaddirOptions) => Promise<ReaddirResult>

  /**
   * Return data about a file
   *
   * @since 1.0.0
   */
  stat: (options: StatOptions) => Promise<StatResult>

  /**
   * Check if portable storage is available (SD Card for Android)
   * Only available on Android
   *
   * @since 5.0.5
   */
  isPortableStorageAvailable: () => Promise<isPortableStorageAvailableResult>

  /**
   * Check read/write permissions.
   * Required on Android, only when using `Directory.Documents` or
   * `Directory.ExternalStorage`.
   *
   * @since 1.0.0
   */
  checkPermissions: () => Promise<PermissionStatus>

  /**
   * Request read/write permissions.
   * Required on Android, only when using `Directory.Documents` or
   * `Directory.ExternalStorage`.
   *
   * @since 1.0.0
   */
  requestPermissions: () => Promise<PermissionStatus>

  /**
   * Perform a http request to a server and download the file to the specified destination.
   *
   * @since 5.1.0
   */
  downloadFile: (options: DownloadFileOptions) => Promise<DownloadFileResult>

  /**
   * Add a listener to file download progress events.
   *
   * @since 5.1.0
   */
  addListener: (
    eventName: 'progress',
    listenerFunc: ProgressListener,
  ) => Promise<PluginListenerHandle> & PluginListenerHandle
}
