import {sortBy} from 'ramda'
import {batch} from 'hurdak'
import * as t from 'svelte/transition'
import {writable, get} from 'svelte/store'
import {isShareableRelay, Executor, Pool, Relays} from "paravel"

export const fade = (node, params) => t.fade(node, {duration: 1000, ...params})

// State

export const people = new Map()

export const events = writable([])

export const cursor = writable(0)

export const user = writable(null)

// Fetch helpers

export const day = 86400

export const pool = new Pool()

export const defaultUrls = [
  "wss://purplepag.es",
  "wss://relay.damus.io",
  "wss://relay.nostr.band",
  "wss://relay.snort.social",
  "wss://relayable.org",
  "wss://nostr.wine",
]

export const getExecutor = urls => new Executor(new Relays(urls.map(url => pool.get(url))))

export const loadPubkeyInfo = (pubkey, urls) => {
  let relays, follows

  return new Promise(resolve => {
    const executor = getExecutor(urls)

    const sub = executor.load([{kinds: [10002, 3], authors: [pubkey]}], {
      onEvent: (url, e) => {
        if (e.kind === 10002) {
          relays = e.tags.filter(t => t[0] === 'r' && isShareableRelay(t[1])).map(t => t[1])
        }

        if (e.kind === 3) {
          follows = e.tags.filter(t => t[0] === 'p').map(t => t[1])
        }

        if (relays && follows) {
          sub.unsubscribe()

          resolve({relays, follows})
        }
      },
      onClose: () => {
        if (!relays || !follows) {
          console.error("Failed to load user info")
        }
      }
    })
  })
}

export const loadPeople = (urls, authors) => {
  getExecutor(urls).load([{kinds: [0], authors}], {
    onEvent: (url, e) => {
      try {
        people.set(e.pubkey, JSON.parse(e.content))
      } catch (err) {
        console.error(err)
      }
    },
  })
}

export const getWindow = () => {
  const until = Math.round(get(events).map(e => e.created_at).reduce((a, b) => Math.min(a, b), Date.now() / 1000) - 1)
  const since = until - day

  return {until, since}
}

export const loadPage = async () => {
  const {until, since} = getWindow()
  const {follows, relays} = get(user)
  const filters = [{kinds: [1], limit: 500, authors: follows, until, since}]

  const onEvent = batch(1000, chunk => {
    const filtered = chunk.filter(e => !e.tags.find(t => t[0] === "e") && e.content.length > 200)

    events.update($events => {
      const $cursor = get(cursor)
      const newEvents = [...$events, ...filtered]

      return [
        ...newEvents.slice(0, $cursor + 1),
        ...sortBy(e => -e.created_at, newEvents.slice($cursor + 1)),
      ]
    })
  })

  getExecutor(relays).load(filters, {
    timeout: 5000,
    onClose: loadPageIfNeeded,
    onEvent: (url, e) => onEvent(e),
  })
}

export const loadPageIfNeeded = () => {
  if (get(events).slice(get(cursor)).length < 50) {
    loadPage()
  }
}

// Nip07

let lock = Promise.resolve()

export const getExtension = () => (window as {nostr?: any}).nostr

export const withExtension = (f: (ext: any) => void) => {
  lock = lock.catch(e => console.error(e)).then(() => f(getExtension()))

  return lock
}

export const login = () => {
  withExtension(async ext => {
    const pubkey = await ext.getPublicKey()
    const {relays, follows} = await loadPubkeyInfo(pubkey, defaultUrls)

    user.set({pubkey, relays, follows})

    loadPeople(relays, follows)
  })
}
