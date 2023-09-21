<script lang="ts">
  import {onMount} from 'svelte'
  import {login, fade} from './state'

  let visible = false

  const onClick = () => {
    visible = false

    setTimeout(login, 1000)
  }

  onMount(() => {
    visible = true
  })
</script>

{#if visible}
  <div out:fade>
    <button class="p-12 button-accent rounded-full opacity-50 hover:opacity-100 transition-all duration-1000" on:click={onClick}>
      <i class="fa fa-2x fa-door-open" />
    </button>
  </div>
{/if}
