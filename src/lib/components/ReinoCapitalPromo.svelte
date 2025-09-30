<script>
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "$lib/components/ui/card";
import { Button } from "$lib/components/ui/button";
import { X } from "lucide-svelte";
import { onMount } from "svelte";

let visible = $state(false);
let dismissed = $state(false);

onMount(() => {
  // Check if user has dismissed this before
  const wasDismissed = localStorage.getItem("reino-capital-promo-dismissed");
  if (wasDismissed) {
    dismissed = true;
    return;
  }

  // Show after a short delay
  setTimeout(() => {
    visible = true;
  }, 2000);
});

function handleDismiss() {
  visible = false;
  dismissed = true;
  localStorage.setItem("reino-capital-promo-dismissed", "true");
}

function handleVisit() {
  window.open(
    "https://www.reinocapital.com.br/",
    "_blank",
    "noopener,noreferrer",
  );
}
</script>

{#if !dismissed}
  <div
    class="fixed right-6 bottom-6 z-50 transition-all duration-500 ease-out"
    style="transform: translateY({visible ? '0' : '150%'}); opacity: {visible ? '1' : '0'};"
  >
    <Card
      class="w-80 bg-card shadow-2xl"
      style="border: 1px solid rgba(255, 255, 255, 0.2) !important;"
    >
      <CardHeader class="relative px-6 pt-4 pb-0">
        <button
          onclick={handleDismiss}
          class="absolute top-4 right-6 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none"
          aria-label="Fechar"
        >
          <X class="h-4 w-4" />
        </button>
        <CardTitle class="pr-8 text-lg">Conheça a Reino Capital</CardTitle>
      </CardHeader>
      <CardContent class="pt-1 pb-4">
        <p class="mb-6 text-sm text-muted-foreground">
          Gestão de patrimônio transparente, sem taxas escondidas.
        </p>
        <Button
          onclick={handleVisit}
          class="w-full text-black hover:opacity-90"
          style="background-color: #daa520;"
        >
          Visitar Site
        </Button>
      </CardContent>
    </Card>
  </div>
{/if}
