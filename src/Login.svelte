<script lang="ts">
  import {onMount} from 'svelte'
  import {login, fade} from './state'

  let visible = false
  let error = false

  const onClick = () => {
    if (error) {
      window.open('https://nostrcheck.me/register/browser-extension.php')

      error = null
    } else {

      visible = false

      setTimeout(() => login().catch(() => {
        error = true
        visible = true
      }), 800)
    }
  }

  onMount(() => {
    visible = true
  })
</script>

{#if visible}
  <div out:fade>
    <button
      class="p-12 button-accent rounded-full border border-solid hover:p-14 transition-[padding] duration-1000 rounded-full text-white"
      class:bg-teal-400={!error}
      class:border-teal-500={!error}
      class:bg-red-500={error}
      class:border-red-700={error}
      on:click={onClick}>
      {#if error}
        <i class="fa fa-2x fa-warning" />
      {:else}
        <i class="fa fa-2x fa-wind" />
      {/if}
    </button>
  </div>
{/if}
