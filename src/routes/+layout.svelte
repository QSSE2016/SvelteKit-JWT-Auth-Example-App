<script lang="ts">
  import favicon from "$lib/assets/favicon.svg";
  import "../app.css"; // DONT FORGET THIS!!! if you dont import here, tailwind wont be applied

  let { children } = $props();
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
