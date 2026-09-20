<script lang='ts'>
  import '../app.css'
  import '@fontsource-variable/nunito'
  import '$lib/modules/navigate'
  // import { ProgressBar } from '@prgm/sveltekit-progress-bar' breaks ssr

  import { Footer } from '$lib/components/ui/footer'
  import { Loader } from '$lib/components/ui/loader'
  import { Navbar } from '$lib/components/ui/navbar'
  import { Toaster } from '$lib/components/ui/sonner'
</script>

<svelte:head>
  <meta name='viewport' content='width=device-width, initial-scale=1, user-scalable=0' />
</svelte:head>

<div class='w-full min-h-screen bg-black relative overflow-y-auto overflow-x-clip' id='root'>
  <Toaster position='top-right' expand={true} />
  <Loader />
  <Navbar />
  <!-- <ProgressBar zIndex={100} /> -->

  <slot />
  <Footer />
</div>
