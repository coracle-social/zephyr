<script lang="ts">
  import {nip19} from 'nostr-tools'
  import {people} from './state'

  export let event

  const link = path => `https://njump.me/${path.replace('nostr:', '')}`

  const formatter = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  })

  const displayEntity = entity => {
    entity = entity.replace('nostr:', '')

    try {
      const {type, data} = nip19.decode(entity)
      const pubkey = data.pubkey || data
      const person = people.get(pubkey)

      if (person) {
        return '@' + (person.name || person.display_name)
      }
    } catch(e) {}

    return entity.slice(0, 24) + '...'
  }

  $: person = people.get(event.pubkey)
  $: picture = `https://imgproxy.coracle.social/x/s:200:200/${btoa(person?.picture)}`
  $: npub = nip19.npubEncode(event.pubkey)
  $: note = nip19.noteEncode(event.id)
  $: content = event.content.split(/(#\w+|nostr:\w+|\n+|https?:\/\/[^\s]+)/g)
</script>

{#key event.id}
  <div
    class="flex flex-col flex-grow gap-4 bg-white/80 p-4 rounded-2xl border-gray-500 border border-solid overflow-x-hidden"
    style="box-shadow: 0px 0px 30px rgba(200, 200, 200, 0.5) inset;">
    {#if person}
      <a href={link(npub)} target="_blank" class="flex gap-4">
        <img class="rounded-full h-12 w-12 bg-gray-300" src={picture} alt="" />
        <div class="flex flex-col">
          <span class="text-xl">{person.name || person.display_name}</span>
          <span class="text-sm">{npub.slice(0, 32)}...</span>
        </div>
      </a>
    {/if}
    <p class="note-content overflow-x-hidden text-ellipsis leading-6">
      {#each content as part}
        {#if part.startsWith('nostr:')}
          <a class="text-teal-500" href={link(part)} target="_blank">{displayEntity(part)}</a>
        {:else if part.match(/https?:\/\/[^\s]+/)}
          <a class="text-teal-500" href={part} target="_blank">{part.replace(/^https?:\/\//, '')}</a>
        {:else if part.match(/\n+/)}
          <div style={`height: ${part.length - 1}em`} />
        {:else}
          {part}
        {/if}
      {/each}
    </p>
    <div class="flex justify-between items-center text-xs text-gray-600 mt-2">
      {formatter.format(new Date(event.created_at * 1000))}
      <a href={link(note)} target="_blank">
        <i class="fa fa-arrow-up-right-from-square" />
      </a>
    </div>
  </div>
{/key}
