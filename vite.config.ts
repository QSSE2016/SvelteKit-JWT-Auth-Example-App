import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

// to setup just follow the steps here: https://tailwindcss.com/docs/installation/using-vite

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
});
