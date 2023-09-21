<script lang="ts">
  import {onMount} from 'svelte'
  import {derived} from 'svelte/store'
  import {fade, events, cursor, user, loadPage, loadPageIfNeeded} from './state'
  import EventCard from './EventCard.svelte'

  const event = derived([events, cursor], ([$events, $cursor]) => $cursor === null ? null : $events[$cursor])

  const prev = () => {
    const cur = $cursor

    cursor.set(null)

    setTimeout(() => cursor.set(cur - 1), 2000)
  }

  const next = () => {
    const cur = $cursor

    cursor.set(null)
    loadPageIfNeeded()
    setTimeout(() => cursor.set(cur + 1), 2000)
  }

  let authors

  onMount(async () => {
    loadPage()
  })
</script>

{#if $event}
  <div transition:fade class="flex max-h-full w-full">
    <div class="cursor-pointer p-12 text-gray-700 hover:text-gray-100 transition-all duration-[2000ms] flex-grow flex items-center" on:click={prev}>
      <i class="fa fa-chevron-left" />
    </div>
    <div class="py-8 flex overflow-hidden">
      <EventCard event={$event} />
    </div>
    <div class="cursor-pointer p-12 text-gray-700 hover:text-gray-100 transition-all duration-[2000ms] flex-grow flex items-center" on:click={next}>
      <i class="fa fa-chevron-right" />
    </div>
  </div>
{/if}
