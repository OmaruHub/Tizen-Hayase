<div class='h-full con w-screen z-[90] font-bold overflow-hidden fixed animate'>
  <div class='h-full text flex items-center justify-center text-nowrap text-transparent capitalize w-screen' data-nosnippet>
    Loading...
  </div>
</div>

<style>
  @keyframes transition {
    0% {
      background-position: top left;
      width: 100vw ;
    }
    65% {
      background-position: top left;
      width: 100vw;
    }
    95% {
      background-position: top right
    }
    100% {
      background-position: top right;
      width: 0;
    }
  }
  .con {
    background-position: top left;
  }
  .animate {
    animation: 2s transition ease forwards;
  }
  .text {
    font-size: clamp(0px, 6rem, 15vw);
    font-family: Verdana, sans-serif;
    background: linear-gradient(90deg, #fff 50%, #000 0), linear-gradient(90deg, #000 50%, #fff 0);
    background-repeat: no-repeat;
    background-size: 200% 100%;
    background-position: inherit;
    -webkit-background-clip: text, padding-box;
    background-clip: text, padding-box;
  }
</style>
