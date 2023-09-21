<script lang="ts">
  import {nip19} from 'nostr-tools'
  import {people} from './state'

  export let event

  const formatter = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  })

  $: person = people.get(event.pubkey)
  $: picture = `https://imgproxy.coracle.social/x/s:200:200/${btoa(person?.picture)}`
  $: npub = nip19.npubEncode(event.pubkey)
  $: note = nip19.noteEncode(event.id)
</script>

{#key event.id}
  <div class="flex flex-col flex-grow gap-4 bg-white/80 p-4 rounded-2xl border-gray-500 border border-solid overflow-hidden">
    {#if person}
      <a href={`https://coracle.social/${npub}`} target="_blank" class="flex gap-4">
        <img class="rounded-full h-12 w-12 bg-gray-300" src={picture} alt="" />
        <div class="flex flex-col">
          <span class="text-xl">{person.name || person.display_name}</span>
          <span class="text-sm">{npub.slice(0, 32)}...</span>
        </div>
      </a>
    {/if}
    <div class="flex flex-col gap-1">
      {#each event.content.split('\n') as line}
        <div class="overflow-hidden text-ellipsis">{line}</div>
      {/each}
    </div>
    <div class="flex justify-between items-center text-xs text-gray-600 mt-2">
      {formatter.format(new Date(event.created_at * 1000))}
      <a href={`https://coracle.social/${note}`} target="_blank">
        <i class="fa fa-arrow-up-right-from-square" />
      </a>
    </div>
  </div>
{/key}
