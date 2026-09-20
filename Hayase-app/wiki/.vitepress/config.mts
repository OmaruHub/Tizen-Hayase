import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Hayase Wiki",
  description: "A Wiki For The Hayase App",
  head: [
    ["link", { rel: "icon", href: "https://hayase.watch/logo.png", type: "image/png", sizes: "512x512" }],
    ["link", { rel: "apple-touch-icon", href: "https://hayase.watch/logo.png" }],
    ["link", { rel: "canonical", href: "https://wiki.hayase.watch" }],
    ["link", { rel: "fluid-icon", href: "https://hayase.watch/logo.png", type: "image/png", sizes: "512x512", title: "Hayase Wiki" }],
    ["meta", { name: "theme-color", content: "#ffffff" }],
    ["meta", { name: "description", content: "Bring your own content torrent streaming client, real-time with no waiting for downloads. Advanced video player, offline viewing, and more." }],
    ["meta", { name: "keywords", content: "Hayase, Anime, Torrent, Streaming, BitTorrent, Bring Your Own Content, Anime Player, Anime Tracker, AniList, Kitsu, Offline Viewing, Video Player, Subtitles, Discord, Watch Together, Peer to Peer, P2P, Real-time Streaming, Wiki, Extensions" }],
    ["meta", { name: "author", content: "ThaUnknown" }],
    ["meta", { name: "hostname", content: "wiki.hayase.watch" }],
    ["meta", { name: "expected-hostname", content: "wiki.hayase.watch" }],
    ["meta", { name: "twitter:image:src", content: "https://hayase.watch/opengraph.webp" }],
    ["meta", { name: "twitter:site", content: "@ThaUnknown_" }],
    ["meta", { name: "twitter:card", content: "summary_large_image" }],
    ["meta", { name: "twitter:creator", content: "@ThaUnknown_" }],
    ["meta", { name: "twitter:title", content: "Hayase Wiki - Hayase - Torrenting Made Simple" }],
    ["meta", { name: "twitter:description", content: "Bring your own content torrent streaming client, real-time with no waiting for downloads. Advanced video player, offline viewing, and more." }],
    ["meta", { property: "og:image", content: "https://hayase.watch/opengraph.webp" }],
    ["meta", { property: "og:image:alt", content: "Bring your own content torrent streaming client, real-time with no waiting for downloads. Advanced video player, offline viewing, and more." }],
    ["meta", { property: "og:site_name", content: "Hayase Wiki" }],
    ["meta", { property: "og:type", content: "object" }],
    ["meta", { property: "og:title", content: "Hayase Wiki - Hayase - Torrenting Made Simple" }],
    ["meta", { property: "og:url", content: "https://wiki.hayase.watch" }],
    ["meta", { property: "og:description", content: "Bring your own content torrent streaming client, real-time with no waiting for downloads. Advanced video player, offline viewing, and more." }],
    ["meta", { name: "robots", content: "index, follow" }]
  ],
  cleanUrls: true,
  themeConfig: {
    outline: 'deep',
    search: {
      provider: 'local'
    },
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'About', link: '/about' },
      { text: 'Getting Started', link: '/getting-started/installation' },
      { text: 'FAQ', link: '/faq' }
    ],

    sidebar: [
      {
        text: 'Introduction',
        collapsed: false,
        items: [
          { text: 'About Hayase', link: '/about' },
          { text: 'Legal & Disclaimers', link: '/legal-and-disclaimers' },
          { text: 'FAQ', link: '/faq' }
        ]
      },
      {
        text: 'Getting Started',
        collapsed: false,
        items: [
          { text: 'Installation', link: '/getting-started/installation' },
          { text: 'First Time Setup', link: '/getting-started/first-time-setup' },
          { text: 'Basic Usage', link: '/getting-started/basic-usage' },
          { text: 'Video Player Guide', link: '/player/player-guide' }
        ]
      },
      {
        text: 'Core Concepts',
        collapsed: true,
        items: [
          { text: 'Torrent Streaming', link: '/core-concepts/torrent-streaming' },
          { text: 'Torrents and Batches', link: '/core-concepts/torrents-and-batches' },
          { text: 'Storage Management', link: '/core-concepts/storage-management' },
          { text: 'Client-Client Architecture', link: '/core-concepts/client-client-architecture' }
        ]
      },
      {
        text: 'Network',
        collapsed: true,
        items: [
          { text: 'Bypassing Blocks', link: '/network/bypassing-blocks' },
          { text: 'Torrenting Issues', link: '/network/torrenting-issues' },
          { text: 'Offline Mode', link: '/network/offline-mode' },
          { text: 'WatchTogether Integration', link: '/network/w2g-integration' }
        ]
      },
      {
        text: 'Extensions',
        collapsed: true,
        items: [
          { text: 'Overview', link: '/extensions/overview' },
          { text: 'Torrent Extensions', link: '/extensions/torrent-extensions' },
          { text: 'NZB Extensions', link: '/extensions/nzb-extensions' },
          { text: 'Subtitle Extensions', link: '/extensions/subtitle-extensions' },
          {
            text: 'Development',
            items: [
              { text: 'Creating Extensions', link: '/extensions/development/creating-extensions' }
            ]
          }
        ]
      },
      {
        text: 'Library',
        collapsed: true,
        items: [
          { text: 'Managing Content', link: '/library/managing-content' }
        ]
      },
      {
        text: 'Settings',
        collapsed: true,
        items: [
          { text: 'Settings Reference', link: '/settings/settings-reference' }
        ]
      },
      {
        text: 'Platform Issues',
        collapsed: true,
        items: [
          {
            text: 'Windows',
            items: [
              { text: 'Windows Troubleshooting', link: '/platform-issues/windows/windows-troubleshooting' }
            ]
          },
          {
            text: 'Linux',
            items: [
              { text: 'Display Server Issues', link: '/platform-issues/linux/display-server-issues' },
              { text: 'GPU Acceleration', link: '/platform-issues/linux/gpu-acceleration' },
              { text: 'General Linux Issues', link: '/platform-issues/linux/general-linux-issues' }
            ]
          },
          {
            text: 'macOS',
            items: [
              { text: 'macOS Troubleshooting', link: '/platform-issues/macos/macos-troubleshooting' }
            ]
          },
          {
            text: 'Android',
            items: [
              { text: 'Android Troubleshooting', link: '/platform-issues/android/android-troubleshooting' }
            ]
          }
        ]
      },
      {
        text: 'Comparisons',
        collapsed: true,
        items: [
          { text: 'Debrid Services', link: '/comparisons/debrid-services' }
        ]
      },
      {
        text: 'Troubleshooting',
        collapsed: true,
        items: [
          { text: 'Playback Issues', link: '/troubleshooting/playback-issues' },
          { text: 'Connection Issues', link: '/troubleshooting/connection-issues' },
          { text: 'Extension Issues', link: '/troubleshooting/extension-issues' },
          { text: 'Detection Issues', link: '/troubleshooting/detection-issues' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/hayase-app/' },
      { icon: 'discord', link: 'https://discord.gg/TRQEr9evRA' }
    ]
  }
})
