<script lang="ts">
  import {onMount} from 'svelte'
  import {derived} from 'svelte/store'
  import {sleep} from 'hurdak'
  import {fade, events, cursor, user, loadPage, loadPageIfNeeded} from './state'
  import EventCard from './EventCard.svelte'

  const event = derived([events, cursor], ([$events, $cursor]) => $cursor === null ? null : $events[$cursor])

  const prev = () => {
    const cur = $cursor

    cursor.set(null)

    arrowsVisible = false

    setTimeout(() => cursor.set(cur - 1), 2000)
    setTimeout(showArrows, 5000)
  }

  const next = () => {
    const cur = $cursor

    cursor.set(null)

    arrowsVisible = false

    loadPageIfNeeded()

    setTimeout(() => cursor.set(cur + 1), 2000)
    setTimeout(showArrows, 5000)
  }

  const showArrows = () => {
    arrowsVisible = true
  }

  let authors
  let arrowsVisible = true

  onMount(async () => {
    loadPage()

    window.addEventListener('keydown', e => {
      if (arrowsVisible && e.key === 'ArrowRight') next()
      if (arrowsVisible && e.key === 'ArrowLeft') prev()
    })
  })
</script>

{#if $event}
  <div transition:fade class="flex max-h-full w-full">
    <div
      class="p-12 text-gray-700 hover:text-gray-100 transition-all duration-[2000ms] flex-grow flex items-center"
      class:cursor-pointer={arrowsVisible}
      class:opacity-0={!arrowsVisible}
      on:click={arrowsVisible ? prev : null}>
      <i class="fa fa-chevron-left" />
    </div>
    <div class="py-8 flex overflow-hidden">
      <EventCard event={$event} />
    </div>
    <div
      class="p-12 text-gray-700 hover:text-gray-100 transition-all duration-[2000ms] flex-grow flex items-center"
      class:cursor-pointer={arrowsVisible}
      class:opacity-0={!arrowsVisible}
      on:click={arrowsVisible ? next : null}>
      <i class="fa fa-chevron-right" />
    </div>
  </div>
{/if}
