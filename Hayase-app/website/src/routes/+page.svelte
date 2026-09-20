<script lang='ts'>
  import Hammer from 'lucide-svelte/icons/hammer'
  import Link from 'lucide-svelte/icons/link'
  import Rocket from 'lucide-svelte/icons/rocket'

  import { Button } from '$lib/components/ui/button'
  import { ShowcaseCard } from '$lib/components/ui/cards'
  import { EpisodeList } from '$lib/components/ui/episodelist'
  import { Hero } from '$lib/components/ui/hero'
  import AndroidSvg from '$lib/components/ui/icons/AndroidSVG.svelte'
  import AndroidTvsvg from '$lib/components/ui/icons/AndroidTVSVG.svelte'
  import LinuxSvg from '$lib/components/ui/icons/LinuxSVG.svelte'
  import MacOssvg from '$lib/components/ui/icons/MacOSSVG.svelte'
  import SteamOssvg from '$lib/components/ui/icons/SteamOSSVG.svelte'
  import WindowsSvg from '$lib/components/ui/icons/WindowsSVG.svelte'
  import { Stargazers } from '$lib/components/ui/stargazers'
  import { Testimonials } from '$lib/components/ui/testimonials'
  import { Video } from '$lib/components/ui/video'
</script>

<Hero />

<div class='w-full max-w-screen-xl mx-auto relative'>
  <Video />
</div>

<div class='relative'>
  <div class='glow size-[800px] top-0 right-0 absolute pointer-events-none' />
</div>

<div class='w-full max-w-screen-xl mx-auto border-b border-gradient'>
  <div class='my-5 pb-14' id='about'>
    <h1 class='font-bold text-center text-5xl m-6 leading-tight'>Bring your own torrent streaming made simple.</h1>
    <p class='text-muted-foreground font-size-18 text-center pb-5 m-6'>Hayase helps you organise, stream, and keep up with the anime you already have access to.<br />No bundled content, no unofficial libraries—just a polished tool for the media you supply.</p>
    <div class='max-w-3xl mx-auto px-6'>
      <p class='text-xs uppercase tracking-[0.25em] text-center text-muted-foreground/80'>Bring your own content only</p>
      <p class='text-muted-foreground text-sm text-center mt-2'>Hayase never hosts, indexes, or distributes anime. You choose the sources you are legally allowed to use, and Hayase simply plays them.</p>
    </div>
    <div class='grid grid-cols-12 pt-5'>
      <div class='md:col-span-4 col-span-12'>
        <div class='m-6'>
          <div class='flex flex-row items-center mb-6'>
            <Rocket size='2rem' />
            <h4 class='font-bold text-xl ml-5'>Quality meets speed</h4>
          </div>
          <p class='text-muted-foreground text-sm'>Stream your own torrents directly for playback, with no time wasted on manual downloads or waiting for downloads to finish.</p>
        </div>
      </div>
      <div class='md:col-span-4 col-span-12'>
        <div class='m-6'>
          <div class='flex flex-row items-center mb-6'>
            <Link size='2rem' />
            <h4 class='font-bold text-xl ml-5'>No expertise required</h4>
          </div>
          <p class='text-muted-foreground text-sm'>You don’t need to be a master of torrenting or have a deep understanding of technology, it simply works.</p>
        </div>
      </div>
      <div class='md:col-span-4 col-span-12'>
        <div class='m-6'>
          <div class='flex flex-row items-center mb-6'>
            <Hammer size='2rem' />
            <h4 class='font-bold text-xl ml-5'>Configuration free</h4>
          </div>
          <p class='text-muted-foreground text-sm'>No need to look for setup guides, no need to worry about the ideal configuration, it’s perfect out of the box.</p>
        </div>
      </div>
    </div>
  </div>
</div>

<div class='relative z-30'>
  <div class='glow size-[800px] top-0 left-0 absolute z-30 pointer-events-none' />
</div>

<div class='overflow-clip my-5 relative'>
  <div class='w-full max-w-screen-xl mx-auto'>
    <div class='grid grid-cols-12'>
      <div class='md:col-span-7 col-span-12 items-center flex'>
        <div class='m-6 pr-1'>
          <h1 class='w-full font-bold text-white mb-4 mt-2 text-5xl leading-snug'>
            All in one spot.
          </h1>
          <p class='text-muted-foreground text-sm'>Find and download torrents, watch trailers, manage your list, search, browse and discover anime, watch together with friends and more, all in the same interface. No need to open multiple apps, tabs, everything shipped in one package.</p>
        </div>
      </div>
      <div class='md:col-span-5 col-span-12 overflow-clip md:[overflow:unset] h-600 relative justify-center md:justify-end flex'>
        <ShowcaseCard />
        <div class='overlay-gradient-top-bottom absolute top-0 left-0 w-full h-full z-[50] md:hidden pointer-events-none' />
      </div>
    </div>
  </div>
  <div class='overlay-gradient-top-bottom absolute top-0 right-0 w-1/2 h-full z-[100] hidden md:block pointer-events-none' />
</div>

<div class='w-full max-w-screen-xl mx-auto border-t border-gradient'>
  <div class='my-5 py-20'>
    <div class='lg:grid grid-cols-12 flex flex-col-reverse'>
      <div class='md:col-span-6 col-span-12'>
        <div class='m-6'>
          <EpisodeList />
        </div>
      </div>
      <div class='md:col-span-6 col-span-12 items-center flex'>
        <div class='m-6'>
          <h1 class='w-full font-bold text-white mb-4 mt-2 text-5xl leading-snug'>
            It already does that.
          </h1>
          <p class='text-muted-foreground text-sm'>Feature rich, with a perfect balance of simplicity, with no restrictions, paywalls or tracking. You want it, Hayase does it. No need for multi-layer-deep configuration, complex setup, or high entry levels, You’re always in control of the libraries you connect, and Hayase stays perfectly functional out of the box.</p>
        </div>
      </div>
    </div>
  </div>

  <div class='border-y border-gradient'>
    <div class='my-5 py-20'>
      <div class='m-6'>
        <h1 class='w-full font-bold text-white mb-4 mt-2 text-5xl leading-snug text-center'>
          Available everywhere.
        </h1>
        <p class='text-muted-foreground text-sm text-center'>No need to install different apps for different devices and platforms, effortlessly install on any<br />platform, ensuring a seamless anime experience on any device. . Hayase runs anywhere so you can safely stream the media you own across Windows, Linux, Mac, Android and more.</p>
      </div>
      <div class='platform-grid grid gap-8 p-5 text-white justify-center'>
        <WindowsSvg class='size-10' />
        <MacOssvg class='size-10' />
        <LinuxSvg class='size-10' />
        <AndroidSvg class='size-10' />
        <AndroidTvsvg class='size-10' />
        <SteamOssvg class='size-10' />
      </div>
    </div>
  </div>

  <div class='mt-16 py-5'>
    <h1 class='w-full font-bold text-white mb-4 mt-2 text-5xl leading-snug m-6'>
      Loved by thousands.
    </h1>
  </div>
</div>

<Stargazers />
<div class='w-full max-w-screen-xl mx-auto border-t border-gradient'>

  <div class='my-5 py-16'>
    <div class='m-6'>
      <h1 class='text-center font-bold text-white text-5xl py-3'>
        What they say...
      </h1>
    </div>
    <Testimonials />
  </div>
</div>

<div class='bg-neutral-950 border-t border-gradient'>
  <div class='w-full max-w-screen-xl mx-auto pt-5'>
    <div class='pt-5'>
      <div class='m-6 my-0 items-center flex flex-col'>
        <h1 class='w-full font-bold text-white mb-4 mt-2 text-5xl leading-snug text-center'>
          HAYASE
        </h1>
        <p class='text-muted-foreground text-sm text-center mb-5'>Start streaming your own library right here. Right now. Get started by<br />clicking download button below.</p>
        <Button href='/download' class='font-bold text-lg' size='lg'>Download</Button>
        <div class='h-[180px] w-full overflow-clip mt-5 pt-5'>
          <img src='app.webp' alt='app' class='max-w-full object-contain aspect-[2/1] px-5 w-full' />
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .glow {
    background-image: radial-gradient(circle farthest-side,rgba(255,0,182,.15),hsla(0,0%,100%,0));
  }
  .glow.left-0 {
    transform: translate(-70%, -20%);
  }
  .glow.right-0 {
    transform: translate(70%, -60%);
  }
  .overlay-gradient-top-bottom {
    background: linear-gradient(0deg, #000 0%, #0000 25%, #0000 75%, #000);
  }

  .platform-grid {
    grid-template-columns: 4rem 4rem 4rem;
    grid-template-rows: 4rem 4rem;
  }
</style>
