<!-- This page is mostly just visual stuff, you know to look nice. The actual "app" is in the server folder, hooks.server.ts and all the server related files. -->
<script lang="ts">
  const {
    data,
  }: { data: { accessTokenActive: boolean; refreshTokenActive: boolean } } =
    $props();
</script>

<div
  class="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center px-4"
>
  <!-- Main Card -->
  <div
    class="w-full max-w-xl rounded-2xl p-8 space-y-6
              bg-white/5 backdrop-blur-xl
              border border-white/10
              shadow-2xl"
  >
    <!-- Header -->
    <div class="space-y-2 text-center">
      <h1 class="text-3xl font-bold text-white tracking-tight">Welcome!!</h1>
      <p class="text-gray-400 text-sm">
        A simple JWT authentication demo using SvelteKit
      </p>
    </div>

    <!-- Auth Status (demo only) -->
    <div
      class="rounded-xl p-4 text-sm space-y-2
         bg-white/5 border border-white/10 text-gray-300"
    >
      <p class="font-semibold text-white">Auth Status</p>

      <p>
        Access Token:
        {#if data.accessTokenActive}
          <span class="text-green-400 font-medium">Active</span>
        {:else}
          <span class="text-red-400 font-medium">Inactive</span>
        {/if}
      </p>

      <p>
        Refresh Token:
        {#if data.refreshTokenActive}
          <span class="text-green-400 font-medium">Active</span>
        {:else}
          <span class="text-red-400 font-medium">Inactive</span>
        {/if}
      </p>
    </div>

    <!-- Info -->
    <div
      class="rounded-xl p-4 text-sm text-gray-300
                bg-white/5 border border-white/10"
    >
      <p>
        This app demonstrates how authentication works with JWTs. No roles or
        advanced authorization, just the core idea (to avoid being overly
        complex).
      </p>
    </div>

    <div
      class="rounded-xl p-4 text-sm text-gray-300
                bg-white/5 border border-white/10"
    >
      <p>
        Try messing around with the cookies on the application tab. You will
        have to refresh the page to see any difference though. Notice how if you
        delete the access token, the refresh token will automatically renew it.
        And if you delete the refresh token, you will still be able to access
        this page, as long as you still have a valid access token.
      </p>
    </div>

    <!-- Logout -->
    <form method="POST" class="pt-4">
      <button
        type="submit"
        class="w-full py-2.5 rounded-lg font-medium text-white
               bg-red-500/80 hover:bg-red-500
               transition duration-200
               backdrop-blur-md cursor-pointer"
      >
        Logout
      </button>

      <p class="text-xs text-gray-400 text-center mt-2">
        Logging out means that your related cookies will be cleared (token which
        is the JWT and userData which is just general info)
      </p>
    </form>
  </div>
</div>
