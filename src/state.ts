import {nip19} from 'nostr-tools'
import {sortBy, identity, uniq, uniqBy, prop} from 'ramda'
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

        executor.target.cleanup()
      }
    })
  })
}

export const loadPeople = (urls, pubkeys) => {
  const authors = pubkeys.filter(pk => !people.has(pk))

  if (authors.length > 0) {
    const executor = getExecutor(urls)

    executor.load([{kinds: [0], authors}], {
      onEvent: (url, e) => {
        try {
          people.set(e.pubkey, JSON.parse(e.content))
        } catch (err) {
          console.error(err)
        }
      },
      onClose: () => {
        executor.target.cleanup()
      }
    })
  }
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

  const onEvent = batch(3000, chunk => {
    const filtered = chunk.filter(e => !e.tags.find(t => t[0] === "e") && e.content.length > 200)
    const personMatches = uniq(chunk.flatMap(e => e.content.match(/nostr:n(pub|profile)\w+/) || []))
    const pubkeys = personMatches.map(entity => {
      try {
        const {data} = nip19.decode(entity.slice(6))

        return data.pubkey || data
      } catch (e) {
        return null
      }
    })

    loadPeople(relays, pubkeys.filter(identity))

    events.update($events => {
      const $cursor = get(cursor)
      const newEvents = uniqBy(prop('id'), [...$events, ...filtered])

      return [
        ...newEvents.slice(0, $cursor + 1),
        ...sortBy(e => -e.created_at, newEvents.slice($cursor + 1)),
      ]
    })
  })

  const executor = getExecutor(relays)

  executor.load(filters, {
    timeout: 5000,
    onEvent: (url, e) => onEvent(e),
    onClose: () => {
      loadPageIfNeeded()

      executor.target.cleanup()
    },
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
  lock = lock.then(() => f(getExtension()))

  return lock
}

export const login = () => {
  return withExtension(async ext => {
    const pubkey = await ext.getPublicKey()
    const {relays, follows} = await loadPubkeyInfo(pubkey, defaultUrls)

    user.set({pubkey, relays, follows})

    loadPeople(relays, follows)
  })
}
