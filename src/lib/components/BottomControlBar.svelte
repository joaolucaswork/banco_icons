<script>
import { Button } from "$lib/components/ui/button";
import { Slider } from "$lib/components/ui/slider";
import { Label } from "$lib/components/ui/label";

import { Input } from "$lib/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "$lib/components/ui/popover";
import { RotateCcw } from "lucide-svelte";

let {
  sizeValue = [24],
  color = "#000000",
  onSizeChange = () => {},
  onColorChange = () => {},
  onReset = () => {},
} = $props();

// Predefined color palette
const colorPalette = [
  "#000000",
  "#374151",
  "#6B7280",
  "#9CA3AF",
  "#D1D5DB",
  "#F3F4F6",
  "#FFFFFF",
  "#EF4444",
  "#F97316",
  "#F59E0B",
  "#EAB308",
  "#84CC16",
  "#22C55E",
  "#10B981",
  "#06B6D4",
  "#0EA5E9",
  "#3B82F6",
  "#6366F1",
  "#8B5CF6",
  "#A855F7",
  "#D946EF",
  "#EC4899",
  "#F43F5E",
];

let customColor = $state(color);
let isPopoverOpen = $state(false);

// Watch for size changes and notify parent
$effect(() => {
  onSizeChange(sizeValue);
});

// Update custom color when color prop changes
$effect(() => {
  customColor = color;
});

function handleColorSelect(selectedColor) {
  customColor = selectedColor;
  onColorChange(selectedColor);
  isPopoverOpen = false;
}

function handleCustomColorChange() {
  onColorChange(customColor);
}

function handleReset() {
  onReset();
}
</script>

<!-- Bottom Control Bar -->
<div
  class="fixed right-0 bottom-0 left-0 z-50 bg-background/95 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/60"
>
  <div class="border-t border-border">
    <div class="container mx-auto px-4 py-4 pb-6">
      <div
        class="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-4 sm:flex-nowrap sm:gap-6"
      >
        <!-- Left Group: Size, Color, Reset -->
        <div class="flex items-center gap-8">
          <!-- Size Control -->
          <div class="flex items-center">
            <div
              class="flex h-[42px] items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2"
            >
              <span
                class="text-sm font-medium whitespace-nowrap text-foreground"
                >Tamanho</span
              >
              <div class="w-24">
                <Slider
                  bind:value={sizeValue}
                  min={24}
                  max={256}
                  step={1}
                  class="w-full [&_[data-slider-range]]:bg-foreground [&_[data-slider-thumb]]:h-5 [&_[data-slider-thumb]]:w-5 [&_[data-slider-thumb]]:border-2 [&_[data-slider-thumb]]:border-gray-400 [&_[data-slider-thumb]]:bg-white [&_[data-slider-thumb]]:shadow-md [&_[data-slider-thumb]]:ring-0 [&_[data-slider-thumb]]:transition-transform [&_[data-slider-thumb]]:hover:scale-110 [&_[data-slider-track]]:bg-muted/60"
                />
              </div>
              <div class="text-xs text-muted-foreground">
                {sizeValue[0]}px
              </div>
            </div>
          </div>

          <!-- Color Control -->
          <div class="flex items-center gap-4">
            <div
              class="flex h-[42px] items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2"
            >
              <span
                class="text-sm font-medium whitespace-nowrap text-foreground"
                >Cor</span
              >
              <Popover bind:open={isPopoverOpen}>
                <PopoverTrigger class="">
                  <Button
                    variant="outline"
                    class="h-8 w-8 rounded-full border-2 border-border p-0 hover:border-border/80"
                    style="background-color: {color}"
                    aria-label="Selecionar cor"
                    disabled={false}
                  >
                    <span class="sr-only">Cor atual: {color}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent class="w-64 p-4" side="top" portalProps={{}}>
                  <div class="space-y-4">
                    <!-- Color Palette -->
                    <div>
                      <Label
                        class="mb-2 block text-sm font-medium text-popover-foreground"
                      >
                        Cores Predefinidas
                      </Label>
                      <div class="grid grid-cols-6 gap-2">
                        {#each colorPalette as paletteColor}
                          <button
                            type="button"
                            class="h-8 w-8 rounded border-2 border-border transition-colors hover:border-border/80 focus:ring-2 focus:ring-ring focus:ring-offset-1 focus:outline-none"
                            style="background-color: {paletteColor}"
                            onclick={() => handleColorSelect(paletteColor)}
                            aria-label="Selecionar cor {paletteColor}"
                          >
                            {#if paletteColor === color}
                              <div
                                class="flex h-full w-full items-center justify-center rounded"
                              >
                                <div
                                  class="h-2 w-2 rounded-full bg-background shadow-sm"
                                ></div>
                              </div>
                            {/if}
                          </button>
                        {/each}
                      </div>
                    </div>

                    <!-- Custom Color Input -->
                    <div>
                      <Label
                        for="custom-color"
                        class="mb-2 block text-sm font-medium text-popover-foreground"
                      >
                        Cor Personalizada
                      </Label>
                      <div class="flex gap-2">
                        <Input
                          id="custom-color"
                          type="text"
                          bind:value={customColor}
                          placeholder="#000000"
                          class="flex-1 text-sm"
                          onchange={handleCustomColorChange}
                        />
                        <input
                          type="color"
                          bind:value={customColor}
                          onchange={handleCustomColorChange}
                          class="h-10 w-10 cursor-pointer rounded border border-border"
                          aria-label="Seletor de cor"
                        />
                      </div>
                    </div>

                    <!-- Apply Button -->
                    <Button
                      onclick={() => handleColorSelect(customColor)}
                      class="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                      disabled={false}
                    >
                      Aplicar Cor
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>

              <!-- Current color display -->
              <span class="font-mono text-xs text-muted-foreground"
                >{color}</span
              >
            </div>
          </div>

          <!-- Reset Button -->
          <div
            class="flex h-[42px] cursor-pointer items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 hover:bg-muted/40"
            onclick={handleReset}
            role="button"
            tabindex="0"
            onkeydown={(e) => e.key === 'Enter' && handleReset()}
          >
            <RotateCcw class="h-4 w-4" />
            <span class="text-sm font-medium text-foreground">Redefinir</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
