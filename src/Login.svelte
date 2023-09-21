<script lang="ts">
  import {onMount} from 'svelte'
  import {login, fade} from './state'

  let visible = false

  const onClick = () => {
    visible = false

    setTimeout(login, 800)
  }

  onMount(() => {
    visible = true
  })
</script>

{#if visible}
  <div out:fade>
    <button class="p-12 button-accent rounded-full border border-solid border-teal-500 hover:p-14 transition-all duration-1000" on:click={onClick}>
      <i class="fa fa-2x fa-wind" />
    </button>
  </div>
{/if}
