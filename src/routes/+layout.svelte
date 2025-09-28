<script>
import "../app.css";
import { Toaster } from "svelte-sonner";

let { children } = $props();
</script>

<div class="dark min-h-screen">
  {@render children()}
  <Toaster
    theme="dark"
    position="bottom-center"
    richColors
    closeButton={false}
  />
</div>
