<script>
import { Card, CardContent } from "$lib/components/ui/card";
import { Slider } from "$lib/components/ui/slider";
import { Label } from "$lib/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "$lib/components/ui/tooltip";
import LogoCard from "./LogoCard.svelte";

let {
  logos = new Map(),
  loading = false,
  class: className = "",
  ...restProps
} = $props();

// State for global controls
let globalColor = $state("#ffffff"); // Start with white
let logoSize = $state([80]); // Default size for grid items
let colorPickerRef = $state();

// Convert logos Map to array
let logoArray = $derived(Array.from(logos.entries()));

// Canvas refs for each logo
let canvasRefs = $state({});

// Individual colors for each logo (starts with global color)
let individualColors = $state({});

// Initialize individual colors when logos change
$effect(() => {
  logoArray.forEach(([logoName]) => {
    if (!individualColors[logoName]) {
      individualColors[logoName] = globalColor;
    }
  });
});

// Open native color picker
function openColorPicker() {
  if (colorPickerRef) {
    colorPickerRef.click();
  }
}

// Handle color change with real-time preview
function handleColorPickerInput(event) {
  globalColor = event.target.value;
  // Update all logos with the new global color
  logoArray.forEach(([logoName]) => {
    individualColors[logoName] = globalColor;
  });
}
</script>

<div class={className} {...restProps}>
  <Card class="border-border bg-card">
    <CardContent class="p-0">
      <!-- Global Controls -->
      <div class="mb-6 flex gap-6">
        <!-- Color Control -->
        <div class="flex w-48 flex-col gap-2">
          <div class="flex h-5 items-center justify-between">
            <Label class="text-sm font-medium text-foreground">HEX</Label>
            <span class="font-mono text-sm text-muted-foreground"
              >{globalColor}</span
            >
          </div>
          <div class="flex h-10 items-center">
            <!-- Hidden native color picker -->
            <input
              bind:this={colorPickerRef}
              type="color"
              bind:value={globalColor}
              oninput={handleColorPickerInput}
              class="pointer-events-none absolute opacity-0"
              aria-label="Seletor de cor global"
            />

            <TooltipProvider delayDuration={400}>
              <Tooltip>
                <TooltipTrigger asChild>
                  {#snippet child({ props })}
                    <button
                      {...props}
                      onclick={openColorPicker}
                      class="flex h-10 w-full items-center justify-center rounded-lg border-2 border-border transition-all hover:border-border/80"
                      style="background-color: {globalColor};"
                      aria-label="Abrir seletor de cor"
                    >
                      <span class="sr-only">Cor atual: {globalColor}</span>
                    </button>
                  {/snippet}
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>Alterar cor de todos os logos</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <!-- Size Control -->
        <div class="flex w-48 flex-col gap-2">
          <div class="flex h-5 items-center justify-between">
            <Label class="text-sm font-medium text-foreground">Tamanho</Label>
            <span class="font-mono text-sm text-muted-foreground"
              >{logoSize[0]}px</span
            >
          </div>
          <div class="flex h-10 items-center">
            <Slider
              bind:value={logoSize}
              min={40}
              max={150}
              step={5}
              class="w-full"
            />
          </div>
        </div>
      </div>

      <!-- Grid of Logos -->
      {#if loading}
        <div class="flex min-h-[400px] items-center justify-center">
          <p class="text-muted-foreground">Carregando logos...</p>
        </div>
      {:else if logoArray.length === 0}
        <div class="flex min-h-[400px] items-center justify-center">
          <p class="text-muted-foreground">Nenhum logo disponível</p>
        </div>
      {:else}
        <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {#each logoArray as [logoName, svgContent]}
            <LogoCard
              logoName={logoName}
              svgContent={svgContent}
              bind:color={individualColors[logoName]}
              size={logoSize[0]}
              bind:canvasRef={canvasRefs[logoName]}
            />
          {/each}
        </div>
      {/if}
    </CardContent>
  </Card>
</div>
