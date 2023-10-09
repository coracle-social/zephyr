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

  let touch
  let touchX
  let touchT

  const onTouchStart = e => {
    touch = e.touches[0]
    touchX = touch.clientX
    touchT = Date.now()

    card.classList.remove('transition-all')
  }

  const onTouchMove = e => {
    touch = e.touches[0]

    card.style = `left: ${touch.clientX - touchX}px`
  }

  const onTouchEnd = e => {
    const offset = touch.clientX - touchX
    const timing = Date.now() - touchT
    const velocity = Math.abs(offset / timing)
    const showPrev = velocity > 1 && offset > 0 && $cursor > 0
    const showNext = velocity > 1 && offset < 0

    if (showPrev) {
      card.style = `left: 500px`
      prev()
    } else if (showNext) {
      card.style = `left: -500px`
      next()
    } else {
      card.classList.add('transition-all')
      card.style = `left: 0px`
    }
  }

  let card
  let authors
  let arrowsVisible = true

  onMount(async () => {
    loadPage()

    document.addEventListener('touchstart', onTouchStart)
    document.addEventListener('touchmove', onTouchMove)
    document.addEventListener('touchend', onTouchEnd)

    window.addEventListener('keydown', e => {
      if (arrowsVisible && e.key === 'ArrowRight') next()
      if (arrowsVisible && e.key === 'ArrowLeft') prev()
    })
  })
</script>

{#if $event}
  <div transition:fade bind:this={card} class="flex max-h-full w-full absolute" style="left: 0px">
    <div
      class="p-12 text-gray-700 hover:text-gray-100 transition-all duration-[2000ms] flex-grow flex items-center hidden sm:block"
      class:cursor-pointer={arrowsVisible}
      class:opacity-0={!arrowsVisible}
      on:click={arrowsVisible ? prev : null}>
      <i class="fa fa-chevron-left" />
    </div>
    <div class="py-8 flex overflow-hidden mx-4 sm:m-0">
      <EventCard event={$event} />
    </div>
    <div
      class="p-12 text-gray-700 hover:text-gray-100 transition-all duration-[2000ms] flex-grow flex items-center hidden sm:block"
      class:cursor-pointer={arrowsVisible}
      class:opacity-0={!arrowsVisible}
      on:click={arrowsVisible ? next : null}>
      <i class="fa fa-chevron-right" />
    </div>
  </div>
{/if}
