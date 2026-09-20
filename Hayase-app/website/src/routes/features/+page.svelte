<script lang='ts'>
  import { FeatureCard, FeatureHero, FeatureRow } from '$lib/components/ui/features'
</script>

<div class='w-full max-w-screen-2xl mx-auto pb-5 px-8'>
  <FeatureHero title='Explore, Find, and Dive into the World of Animation.' desc='Embark on a journey through our Anime discovery, where seamless integration and advanced filtering redefine your anime experience. Discover, watch, and dive into animation like never before.' />
  <div class='flex flex-col gap-4 pb-6'>
    <FeatureRow class='lg:grid-cols-5'>
      <FeatureCard class='lg:col-span-3' title='Anything you want' description={'Filter anime by name, genre, season, year, format, status.\nBrowse lists, track sequels and more.'} image='/search.webp' />
      <FeatureCard class='lg:col-span-2' title='Track your progress' description='With a click of a button you can track your watch progress in no time.' image='/episodes.webp' />
    </FeatureRow>
    <FeatureRow class='lg:grid-cols-3'>
      <FeatureCard title='Discover anything' description='Find new anime, watch trailers, bookmark and share with friends.' image='/hovercard.webp' imageMode='cover' />
      <FeatureCard title='See whats next' description='View airing schedules, upcoming releases and the expected release times.' image='/schedule.webp' imageMode='cover' />
      <FeatureCard title="Don't miss out on anything" description={'Browse sequels, prequels and side stories. Track friends\nand view recommendations.'} image='/viewanime.webp' />
    </FeatureRow>
  </div>
  <FeatureHero title='Control Every Frame of Your Viewing Experience.' desc='From full subtitle support to intuitive keybinds, our platform offers unparalleled control. Immerse yourself in the cinematic experience with Picture-in-Picture, Discord integration, and a suite of features designed to make every frame a masterpiece.' />
  <div class='flex flex-col gap-4 pb-10'>
    <FeatureRow class='lg:grid-cols-5'>
      <FeatureCard class='lg:col-span-3' title='Play any video' description={'Support for every video format and codec, without worrying\nabout support transcoding or hardware.'} image='/videoplayer.webp' />
      <FeatureCard class='lg:col-span-2' title='Full subtitle integration' description='Change subtitles or disable them, even in Picture-in-Picture, with support for any subtitle format, external or embedded.' image='/subtitles.webp' />
    </FeatureRow>
    <FeatureRow class='lg:grid-cols-5'>
      <FeatureCard class='lg:col-span-2' title='Watch with friends' description='Watch anime together with your friends, regardless of where they are or what device they are using.' image='/w2g.webp' />
      <FeatureCard class='lg:col-span-3' title='Painlessly simple' description={'Simple easy to navigate UI, no complex configuration,\nperfect video playback out of the box.'} image='/simple.webp' />
    </FeatureRow>
  </div>
  <FeatureHero title='Redefining Your Torrent Experience.' desc='Hayase provides customization, real-time streaming, and meticulous torrent management for the content you supply. Select your downloads folder, track progress, and immerse yourself in a symphony of features that make torrenting a seamless and personalized journey.' />
  <div class='flex flex-col gap-4 pb-10'>
    <FeatureRow class='lg:grid-cols-4'>
      <FeatureCard class='lg:col-span-3' title='Fully automated' description={'Once you connect trusted extensions, Hayase finds and selects the best releases without\nany extra configuration required.'} image='/modal.webp' imageMode='cover' />
      <FeatureCard title='Hands free' description='Streams torrents from your chosen sources with no setup, and without waiting for downloads to finish.' image='/episodes.webp' />
    </FeatureRow>
    <FeatureRow class='lg:grid-cols-4'>
      <FeatureCard title='Download locally' description='Save data locally to watch later, or load existing data and downloads from other apps.' image='/downloads.webp' imageMode='cover' />
      <FeatureCard class='lg:col-span-3' title='From any source' description={'Add extensions for the trackers you are permitted to use, with support\nfor community integrations that you bring yourself.'} image='/extensions.webp' />
    </FeatureRow>
  </div>

  <div class='text-muted-foreground'>
    Hayase is purely a torrent client and media player. It does not provide, index, host, or link to any content sources, torrent files, or unofficial repositories. Users are fully responsible for sourcing their own content legally and in compliance with their local laws.
  </div>

  <!-- this is just the readme -->
  <h2 class='text-3xl font-bold mb-6 pt-16'>🏆 Full Features List</h2>

  <div class='mb-8'>
    <h3 class='text-2xl font-semibold mb-4'>🎞️ Anime Management</h3>
    <ul class='list-disc pl-5 space-y-2 text-muted-foreground'>
      <li>Effortlessly manage your anime list with support for **AniList**, **Kitsu**, MAL, and local storage.</li>
      <li>Automatically track watched episodes.</li>
      <li>See what you’re behind on, and discover sequels you’ve missed.</li>
      <li>Keep up to date and browse upcoming episodes with airing calendars.</li>
      <li>Edit entries (score, progress, status, favorite, etc.) even while offline.</li>
      <li>Search by image, name, genre, year, season, and more.</li>
      <li>View trailers, OP/ED themes, and detailed episode lists with thumbnails, descriptions and filler indicators.</li>
    </ul>
  </div>

  <div class='mb-8'>
    <h3 class='text-2xl font-semibold mb-4'>🤝 Social & Community</h3>
    <ul class='list-disc pl-5 space-y-2 text-muted-foreground'>
      <li>Instantly see which friends are following an anime or episode.</li>
      <li>See friends profiles and watch progress in the episodes list.</li>
      <li>Track your friends’ watch progress in real time.</li>
      <li>Join episode discussions and forums, even offline.</li>
      <li>Global app chat.</li>
      <li>Discord rich presence.</li>
      <li>Host or join Watch Together lobbies with synced playback and chat.</li>
    </ul>
  </div>

  <div class='mb-8'>
    <h3 class='text-2xl font-semibold mb-4'>🎥 Video Experience</h3>
    <ul class='list-disc pl-5 space-y-2 text-muted-foreground'>
      <li>Full subtitle support.
        <ul class='list-disc pl-6 space-y-1 mt-1'>
          <li>Softcoded, external and manually added subtitles.</li>
          <li>VTT, SSA, ASS, SUB, TXT formats.</li>
          <li>Subtitle display in PiP.</li>
          <li>Override default dialog styles.</li>
          <li>Override default fonts for Asian languages [fix for bad torrents].</li>
        </ul>
      </li>
      <li>Picture In Picture.
        <ul class='list-disc pl-6 space-y-1 mt-1'>
          <li>PiP on lost visibility.</li>
        </ul>
      </li>
      <li>Pause on lost visibility.</li>
      <li>Specify preferred language for video and subtitle tracks.</li>
      <li>Remove video compression artifacts.</li>
      <li>Miniplayer.</li>
      <li>Media Session display.</li>
      <li>Media Keys support.</li>
      <li>Discord rich presence.</li>
      <li>Seek and preview thumbnails.</li>
      <li>Autoplay next episode.</li>
      <li>Skip intro/outro, manually or automatically.</li>
      <li>Skip filler episodes automatically.</li>
      <li>Change playback rate.</li>
      <li>Browse playlist.</li>
      <li>Multi-track support for video, audio and subtitles.</li>
      <li>Editable keybinds for all player functions.</li>
      <li>Exponential volume [better control at lower volumes].</li>
      <li>External player support.</li>
    </ul>
  </div>

  <div class='mb-8'>
    <h3 class='text-2xl font-semibold mb-4'>🧲 Torrents</h3>
    <ul class='list-disc pl-5 space-y-2 text-muted-foreground'>
      <li>Stream your own torrents instantly, no waiting for full downloads.</li>
      <li>Download only what you need for playback.</li>
      <li>Choose your downloads folder and set speed/connection limits.</li>
      <li>Support for custom extensions and trackers (you provide the sources).</li>
      <li>Specify download/upload speeds, ports and connections.</li>
      <li>Support for most popular BEP's.</li>
      <li>Persist torrents, cache progress, and rescan instantly.</li>
      <li>View detailed torrent and peer info.</li>
      <li>Batch downloads.</li>
    </ul>
  </div>

  <code>Note: Hayase does not provide any torrent sources, indexes, or repositories. All content must be supplied by the user.</code>

  <div class='mt-8'>
    <h3 class='text-2xl font-semibold mb-4'>⚙️ Performance & Security</h3>
    <ul class='list-disc pl-5 space-y-2 text-muted-foreground'>
      <li>Highly secure.
        <ul class='list-disc pl-6 space-y-1 mt-1'>
          <li>Operates on a **Zero Trust model**.</li>
          <li>Protects data integrity and settings from external attacks.</li>
          <li>Protects from attacks via malicious torrent extensions.</li>
          <li>Uses up to date best security practices for native apps.</li>
        </ul>
      </li>
      <li>Insanely performant.
        <ul class='list-disc pl-6 space-y-1 mt-1'>
          <li>Fully **hardware/GPU accelerated**.</li>
          <li>GPU based shaders, animations and paints.</li>
        </ul>
      </li>
      <li>Very low resource utilisation.
        <ul class='list-disc pl-6 space-y-1 mt-1'>
          <li>Only loads code as required by user navigation.</li>
          <li>Unloads code not in use.</li>
          <li>Doesn't render unnecessary UI updates.</li>
          <li>Disables rendering when not visible.</li>
          <li>Doesn't render any UI when immersed in fullscreen video.</li>
        </ul>
      </li>
      <li>Minimise to tray.</li>
      <li>In-app changelog.</li>
      <li>Custom themes.</li>
    </ul>
  </div>
</div>
