import * as t from 'svelte/transition'
import {writable} from 'svelte/store'
import NDK, {NDKNip07Signer, NDKEvent} from "@nostr-dev-kit/ndk"

export const fade = (node, params) => t.fade(node, {duration: 1000, ...params})

export const events = writable([])

export const cursor = writable(0)

export const user = writable(null)

export const login = async () => {
  const ndk = await pendingNdk

  ndk.signer = new NDKNip07Signer()

  await ndk.signer.blockUntilReady()

  const $user = await ndk.signer.user()

  $user.ndk = ndk

  user.set($user)
}

export const pendingNdk = (async () => {
  const ndk = new NDK({
    explicitRelayUrls: [
      "wss://relay.damus.io",
      "wss://relay.nostr.band",
      "wss://relayable.org",
      "wss://relay.snort.social",
    ],
  })

  await ndk.connect()

  return ndk
})()
