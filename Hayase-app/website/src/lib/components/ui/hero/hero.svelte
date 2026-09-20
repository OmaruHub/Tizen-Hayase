<script lang='ts'>
  import { Button } from '../button'
</script>

<div class='flex relative justify-center items-center hero h-[60vh] flex-col'>
  <div class='absolute ghost text-nowrap font-molot text-[18rem] text-black' data-nosnippet>
    HAYASE HAYASE HAYASE HAYASE HAYASE HAYASE HAYASE HAYASE HAYASE
  </div>
  <div class='h-50' />
  <div class='relative text-center text-white font-bold text-5xl leading-snug'>
    Stream your torrents real-time,<br />without waiting for downloads
  </div>
  <p class='relative mt-4 max-w-2xl text-center text-sm font-medium text-muted-foreground'>
    Hayase is a bring-your-own-content application. It does not ship or link to unofficial libraries, it simply lets you organise and watch the media you already have permission to access.
  </p>
  <div class='relative pt-5 h-10 flex gap-10'>
    <Button href='/download' class='font-bold text-lg' size='lg'>Download</Button>
    <Button href='#about' variant='secondary' class='font-bold text-lg' size='lg'>
      Learn More
    </Button>
  </div>
</div>

<style>
  .ghost {
    text-shadow:
    0.4px 0.4px 0 #3a3a3a,
    -0.4px 0.4px 0 #3a3a3a,
    -0.4px -0.4px 0 #3a3a3a,
    0.4px -0.4px 0 #3a3a3a;
  }
</style>
