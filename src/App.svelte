<script lang="ts">
  import "@fortawesome/fontawesome-free/css/fontawesome.css"
  import "@fortawesome/fontawesome-free/css/solid.css"

  import {Route, Router, links, navigate} from "svelte-routing"
  import {events, cursor, user, login} from './state'
  import Login from './Login.svelte'
  import Main from './Main.svelte'

  let pathname = ""
</script>

<Router url={pathname}>
  <div use:links class="p-4 absolute inset-0 flex justify-center items-center max-w-screen-md mx-auto">
    {#if $user}
      <Route path="/" component={Main} />
    {:else}
      <Route path="/" component={Login} />
    {/if}
  </div>
</Router>
