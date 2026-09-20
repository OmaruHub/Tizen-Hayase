<script lang='ts'>
  import Discord from '../icons/Discord.svelte'
  import Github from '../icons/Github.svelte'
  import Logo from '../icons/Logo.svelte'
</script>

<div class='pb-4 px-2 sm:px-12 font-weight-light text-xs text-muted-foreground sticky top-full w-full flex flex-col items-center border-t border-gradient'>
  <div class='grid grid-cols-12 px-4 sm:px-0 my-4 w-full max-w-screen-xl'>
    <div class='col-span-12 md:col-span-4 pt-4 mb-4 md:text-left'>
      <a href='/'>
        <Logo class='h-10 object-contain p-1 text-white' />
      </a>
      <br />
      © 2020 - {new Date().getFullYear()}, ThaUnknown
      <br />
      All rights reserved
    </div>
    <div class='col-span-6 sm:col-span-4 md:col-span-3 pt-5 flex md:justify-end'>
      <div class='flex flex-col'>
        <div class='font-semibold mb-3 text-white'>Product</div>
        <a href='https://github.com/sponsors/ThaUnknown/' target='_blank' class='hover:text-foreground transition-colors'>Donate</a>
        <a href='/features' class='hover:text-foreground transition-colors'>Features</a>
        <a href='/download' class='hover:text-foreground transition-colors'>Download</a>
        <a href='/changelog' class='hover:text-foreground transition-colors'>Changelog</a>
      </div>
    </div>
    <div class='col-span-6 sm:col-span-4 md:col-span-3 pt-5 flex md:justify-end'>
      <div class='flex flex-col'>
        <div class='font-semibold mb-3 text-white'>Resources</div>
        <a href='/faq' class='hover:text-foreground transition-colors'>FAQ</a>
        <a href='/contact' class='hover:text-foreground transition-colors'>Contact</a>
        <a href='/terms' class='hover:text-foreground transition-colors'>Terms of use</a>
        <a href='/privacy' class='hover:text-foreground transition-colors'>Privacy policy</a>
      </div>
    </div>
    <div class='col-span-12 sm:col-span-4 md:col-span-2 pt-5 flex md:justify-end'>
      <div>
        <div class='font-semibold mb-3 text-white'>Social</div>
        <a href={atob('aHR0cHM6Ly9kaXNjb3JkLmdnL1RSUUVyOWV2UkE=')} target='_blank'><Discord class='size-4 inline mr-2 hover:text-foreground transition-colors' /></a>
        <a href='https://github.com/hayase-app' target='_blank'><Github class='size-4 inline hover:text-foreground transition-colors' /></a>
      </div>
    </div>
    <div class='italic col-span-12 pt-5'>
      This site and its servers do not host or distribute any media. Hayase is a bring-your-own-content client.
    </div>
  </div>
</div>
