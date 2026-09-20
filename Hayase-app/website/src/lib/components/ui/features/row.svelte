<script lang='ts'>
  import { cn } from '$lib/utils'

  let className = ''
  export { className as class }
</script>

<div class={cn('grid grid-cols-1 gap-4 lg:grid-cols-2', className)}>
  <slot />
</div>
