import { redirect } from '@sveltejs/kit'

import { SETUP_VERSION } from '$lib'
import { outdatedComponent } from '$lib/modules/update'

export async function load () {
  if (await outdatedComponent) return redirect(307, '/#/update')

  const currentHash = typeof window !== 'undefined' ? window.location.hash : ''
  if (currentHash && currentHash.length > 2 && currentHash !== '#/') {
    return { goto: currentHash }
  }

  return { goto: Number(localStorage.getItem('setup-finished')) >= SETUP_VERSION ? '/#/app/home' : '/#/setup' }
}

