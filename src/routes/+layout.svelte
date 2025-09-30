<script>
import "../app.css";
import { Toaster } from "svelte-sonner";
import Navigation from "$lib/components/Navigation.svelte";
import ReinoCapitalPromo from "$lib/components/ReinoCapitalPromo.svelte";

let { children } = $props();
</script>

<div class="dark flex h-svh flex-col">
  <Navigation />
  {@render children()}
  <Toaster
    theme="dark"
    position="bottom-right"
    richColors
    closeButton={false}
  />
  <ReinoCapitalPromo />
</div>
