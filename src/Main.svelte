<script lang="ts">
  import {onMount} from 'svelte'
  import {derived} from 'svelte/store'
  import {EventCard} from '@nostr-dev-kit/ndk-svelte-components'
  import {fade, events, cursor, user, pendingNdk} from './state'

  const oneDay = 86400
  const event = derived([events, cursor], ([$events, $cursor]) => $cursor === null ? null : $events[$cursor])

  const loadMore = async () => {
    const ndk = await pendingNdk
    const until = Math.round($events.map(e => e.created_at).reduce((a, b) => Math.min(a, b), Date.now() / 1000) - 1)
    const notes = Array.from(await ndk.fetchEvents({kinds: [1], limit: 100, authors, until, since: until - oneDay}))
    const filtered = notes.filter(note => !note.tags.find(t => t[0] === "e") && note.content.length > 300)

    events.update($events => $events.concat(filtered))
    loadMoreIfNeeded()
  }

  const loadMoreIfNeeded = () => {
    if ($events.slice($cursor).length < 10) {
      loadMore()
    }
  }

  const prev = () => {
    const cur = $cursor

    cursor.set(null)

    setTimeout(() => cursor.set(cur - 1), 1000)
  }

  const next = () => {
    const cur = $cursor

    cursor.set(null)
    loadMoreIfNeeded()
    setTimeout(() => cursor.set(cur + 1), 1000)
  }

  let authors

  onMount(async () => {
    const ndk = await pendingNdk
    const people = Array.from(await $user.follows())

    authors = people.map(u => u.hexpubkey)

    for (const person of people) {
      person.fetchProfile()
    }

    loadMore()
  })
</script>

{#await pendingNdk}
{:then ndk}
  {#if $event}
    <div transition:fade class="cursor-pointer flex max-h-full">
      <div class="p-12 text-gray-100 hover:text-gray-300 transition-all duration-1000 flex-grow flex items-center" on:click={prev}>
        <i class="fa fa-2xl fa-caret-left" />
      </div>
      <div class="min-w-2xl max-w-2xl h-2/3">
        <EventCard {ndk} event={$event} />
      </div>
      <div class="p-12 text-gray-100 hover:text-gray-300 transition-all duration-1000 flex-grow flex items-center" on:click={next}>
        <i class="fa fa-2xl fa-caret-right" />
      </div>
    </div>
  {/if}
{/await}
