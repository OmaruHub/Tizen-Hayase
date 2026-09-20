<script lang='ts'>
  import Heart from 'lucide-svelte/icons/heart'

  import Discord from '../icons/Discord.svelte'
  import Logo from '../icons/Logo.svelte'
</script>

<header class='sticky top-0 flex h-16 items-center justify-center px-5 sm:px-12 backdrop-blur border-b border-gradient z-30'>
  <nav class='flex-row gap-8 text-xs font-medium flex items-center w-full max-w-screen-xl'>
    <a href='/' class='flex items-center gap-2 text-lg font-semibold md:text-base'>
      <Logo class='h-10 object-contain p-1 text-white' />
      <span class='sr-only'>Hayase</span>
    </a>
    <a href='https://wiki.hayase.watch/' target='_blank' class='text-muted-foreground hover:text-foreground transition-colors ml-auto'>
      Wiki
    </a>
    <a href='/features' class='text-muted-foreground hover:text-foreground transition-colors'>
      Features
    </a>
    <a href='/download' class='text-muted-foreground hover:text-foreground transition-colors'>
      Download
    </a>
    <a href={atob('aHR0cHM6Ly9kaXNjb3JkLmdnL1RSUUVyOWV2UkE=')} target='_blank'><Discord class='size-4 inline text-muted-foreground hover:text-foreground transition-colors' /></a>
    <a href='https://github.com/sponsors/ThaUnknown/' target='_blank' class='text-[#fa68b6] select:text-[#fa68b6]'>
      <Heart size={18} fill='currentColor' class='drop-shadow-[0_0_1rem_#fa68b6] animate-[hearbeat_1s_ease-in-out_infinite_alternate]' />
    </a>
  </nav>
</header>
