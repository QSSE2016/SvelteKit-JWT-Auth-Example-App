<script lang="ts">
  import { enhance } from "$app/forms";
  const { form } = $props();
</script>

<div
  class="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center px-4"
>
  <!-- Glass Card -->
  <div
    class="w-full max-w-md rounded-2xl p-8 space-y-6 bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl"
  >
    <!-- Header -->
    <div class="text-center space-y-2">
      <h1 class="text-3xl font-bold text-white">Sign In</h1>
      <p class="text-sm text-gray-400">
        Hello, please enter your credentials (literally any will do)
      </p>
    </div>
    <!-- Form -->
    <form use:enhance method="POST" class="space-y-4">
      <!-- Email -->
      <div class="space-y-1">
        <label for="email" class="text-sm text-gray-300"> Email </label>
        <input
          id="email"
          type="email"
          name="email"
          required
          placeholder="email@example.com"
          defaultValue="lowtieremail@something.com"
          class="w-full px-4 py-2 rounded-lg bg-white/5 text-white placeholder-gray-500 border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20 transition"
        />
      </div>
      <!-- Password -->
      <div class="space-y-1">
        <label for="pass" class="text-sm text-gray-300"> Password </label>
        <input
          id="pass"
          type="password"
          name="pass"
          required
          placeholder="••••••"
          defaultValue="123"
          class="w-full px-4 py-2 rounded-lg bg-white/5 text-white placeholder-gray-500 border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20 transition"
        />
      </div>
      <!-- Submit -->
      <button
        type="submit"
        class="w-full mt-2 py-2.5 rounded-lg font-medium bg-white text-black hover:bg-gray-200 transition cursor-pointer"
      >
        Sign In
      </button>
    </form>
    <!-- Error -->
    {#if form?.message}
      <p class="text-red-400 text-sm text-center pt-2">{form.message}</p>
    {/if}
  </div>
</div>
