<script>
import "../app.css";
import { Toaster } from "svelte-sonner";
import Navigation from "$lib/components/Navigation.svelte";

let { children } = $props();
</script>

<div class="dark flex h-svh flex-col">
  <Navigation />
  {@render children()}
  <Toaster
    theme="dark"
    position="bottom-center"
    richColors
    closeButton={false}
  />
</div>
