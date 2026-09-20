import { registerPlugin } from '@capacitor/core'

import type { FilesystemPlugin } from './definitions.ts'

export default registerPlugin<FilesystemPlugin>('Filesystem', {})

export { Directory } from './definitions.ts'
