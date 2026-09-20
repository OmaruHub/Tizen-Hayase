<script lang='ts'>
  import { SmallCard } from '.'

  import { cards } from '$lib/data'
</script>

<div class='pb-2 relative inline-flex flex-row skew-3d h-[480px]'>
  <div class='inline-block -mt-[260px]'>
    {#each cards.slice(0, 4) as media, i (media.id)}
      <SmallCard {media} hidden={i !== 1} />
    {/each}
  </div>
  <div class='inline-block -mt-[140px]'>
    {#each cards.slice(4) as media (media.id)}
      <SmallCard {media} />
    {/each}
  </div>
</div>

<style>

  .skew-3d {
    transform: matrix(1, 0, -0.05, 1, 0, 0);
  }
</style>
