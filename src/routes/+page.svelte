<script>
import { Button } from "$lib/components/ui/button";
</script>

<div class="min-h-screen">
  <div class="container mx-auto px-4 py-16">
    <!-- Header -->
    <div class="mb-16 text-center">
      <h1 class="mb-4 text-4xl text-primary">Banco Icons</h1>
      <p class="mx-auto max-w-2xl text-xl text-secondary">
        Projeto configurado com as melhores tecnologias
      </p>
    </div>

    <!-- Tech Stack Pills -->
    <div class="text-center">
      <h2 class="mb-8 text-2xl text-primary">Stack Tecnológico</h2>
      <div class="flex flex-wrap justify-center gap-4">
        {#each ['Svelte 5', 'SvelteKit', 'Tailwind CSS v4', 'ShadCN-Svelte', 'Lucide Icons', 'Vite', 'TypeScript', 'Vitest', 'Playwright'] as tech}
          <span class="rounded-full border px-3 py-1 text-sm text-primary">
            {tech}
          </span>
        {/each}
      </div>
    </div>

    <!-- Style Guide Link -->
    <div class="mt-16 text-center">
      <Button
        variant="outline"
        on:click={() => window.location.href = '/style-guide'}
      >
        Ver Style Guide Completo
      </Button>
    </div>
  </div>
</div>
