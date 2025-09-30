<script>
import { Button } from "$lib/components/ui/button";
import { Slider } from "$lib/components/ui/slider";

import { RotateCcw } from "lucide-svelte";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "$lib/components/ui/tooltip";
import { resolveAutoColors } from "$lib/utils/multi-color-utils.js";

let {
  sizeValue = [24],
  color = "#000000",
  onSizeChange = () => {},
  onColorChange = () => {},
  onReset = () => {},
  // Multi-color support
  isMultiColor = false,
  colorableElements = [],
  colorMap = {},
  onElementColorChange = () => {},
  onElementReset = () => {},
  selectedLogo = null,
} = $props();

let customColor = $state(color);
let colorPickerRef = $state();
// Color picker refs for multi-color elements
let colorPickerRefs = /** @type {Record<string, HTMLInputElement>} */ ({});

// Resolved color map (converts "auto" to actual colors)
let resolvedColorMap = $derived(
  isMultiColor && selectedLogo
    ? resolveAutoColors(colorMap, selectedLogo)
    : colorMap,
);

// Watch for size changes and notify parent
$effect(() => {
  onSizeChange(sizeValue);
});

// Update custom color when color prop changes
$effect(() => {
  customColor = color;
});

// Handle real-time color changes from native color picker (during dragging/moving)
function handleColorPickerInput(event) {
  const newColor = event.target.value;
  customColor = newColor;
  onColorChange(newColor);
}

// Handle final color selection from native color picker
function handleColorPickerChange(event) {
  const newColor = event.target.value;
  customColor = newColor;
  onColorChange(newColor);
}

// Open native color picker directly
function openColorPicker() {
  if (colorPickerRef) {
    colorPickerRef.click();
  }
}

function handleReset() {
  onReset();
}

// Multi-color element functions
function openElementColorPicker(elementKey) {
  if (colorPickerRefs[elementKey]) {
    colorPickerRefs[elementKey].click();
  }
}

function handleElementColorInput(elementKey, event) {
  const target = event.target;
  if (target && target.value) {
    onElementColorChange(elementKey, target.value);
  }
}

function handleElementColorChange(elementKey, event) {
  const target = event.target;
  if (target && target.value) {
    onElementColorChange(elementKey, target.value);
  }
}
</script>

<!-- Bottom Control Bar -->
<div
  class="fixed right-0 bottom-0 left-0 z-50 border-t border-border bg-background shadow-lg"
>
  <div>
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
                  class="w-full [&_[data-slider-range]]:bg-white [&_[data-slider-range]]:transition-all [&_[data-slider-range]]:duration-200 [&_[data-slider-thumb]]:!h-6 [&_[data-slider-thumb]]:!w-6 [&_[data-slider-thumb]]:!border-2 [&_[data-slider-thumb]]:!border-white [&_[data-slider-thumb]]:!bg-white [&_[data-slider-thumb]]:!shadow-lg [&_[data-slider-thumb]]:ring-0 [&_[data-slider-thumb]]:transition-transform [&_[data-slider-thumb]]:hover:scale-110 [&_[data-slider-track]]:h-2 [&_[data-slider-track]]:bg-white/30"
                />
              </div>
              <div class="text-xs text-muted-foreground">
                {sizeValue[0]}px
              </div>
            </div>
          </div>

          <!-- Color Control -->
          <div class="flex flex-col gap-4">
            {#if isMultiColor && colorableElements.length > 0}
              <!-- Multi-color button -->
              <div class="flex items-center gap-4">
                <div
                  class="flex h-[42px] items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2"
                >
                  <span
                    class="text-sm font-medium whitespace-nowrap text-foreground"
                    >Cores</span
                  >

                  <!-- Color pickers for multi-color elements -->
                  {#each colorableElements as element}
                    <!-- Hidden native color picker -->
                    <input
                      bind:this={colorPickerRefs[element.key]}
                      type="color"
                      value={resolvedColorMap[element.key] || element.defaultColor || "#000000"}
                      oninput={(e) => handleElementColorInput(element.key, e)}
                      onchange={(e) => handleElementColorChange(element.key, e)}
                      class="pointer-events-none absolute opacity-0"
                      aria-label="Seletor de cor nativo para {element.label}"
                    />

                    <!-- Color button with tooltip -->
                    <TooltipProvider delayDuration={300}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          {#snippet child({ props })}
                            <Button
                              {...props}
                              variant="outline"
                              class="h-8 w-8 rounded border border-border p-0 hover:border-border/80"
                              style="background-color: {resolvedColorMap[element.key] || element.defaultColor || '#000000'}"
                              aria-label="Selecionar cor para {element.label}"
                              onclick={() => openElementColorPicker(element.key)}
                              disabled={false}
                            >
                              <span class="sr-only"
                                >Cor atual: {colorMap[element.key] || element.defaultColor || '#000000'}</span
                              >
                            </Button>
                          {/snippet}
                        </TooltipTrigger>
                        <TooltipContent
                          side="top"
                          align="center"
                          sideOffset={8}
                          class=""
                          arrowClasses=""
                        >
                          <p class="text-sm">{element.label}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  {/each}
                </div>
              </div>
            {:else}
              <!-- Single color picker -->
              <div class="flex items-center gap-4">
                <!-- Hidden native color picker -->
                <input
                  bind:this={colorPickerRef}
                  type="color"
                  bind:value={customColor}
                  oninput={handleColorPickerInput}
                  onchange={handleColorPickerChange}
                  class="pointer-events-none absolute opacity-0"
                  aria-label="Seletor de cor nativo"
                />

                <!-- Color button with tooltip -->
                <TooltipProvider delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      {#snippet child({ props })}
                        <Button
                          {...props}
                          variant="outline"
                          class="h-8 w-8 rounded border border-border p-0 hover:border-border/80"
                          style="background-color: {color}"
                          aria-label="Selecionar cor"
                          onclick={openColorPicker}
                          disabled={false}
                        >
                          <span class="sr-only">Cor atual: {color}</span>
                        </Button>
                      {/snippet}
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      align="center"
                      sideOffset={8}
                      class=""
                      arrowClasses=""
                    >
                      <p class="text-sm">Cor</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            {/if}
          </div>

          <!-- Reset Button -->
          <TooltipProvider delayDuration={300}>
            <Tooltip
              disableHoverableContent={false}
              disableCloseOnTriggerClick={true}
            >
              <TooltipTrigger asChild>
                <div
                  class="group flex h-[42px] w-[42px] cursor-pointer items-center justify-center rounded-lg bg-muted/30 transition-all duration-200 hover:scale-105 hover:bg-muted/60 active:scale-95"
                  style="border: none !important;"
                  onclick={handleReset}
                  role="button"
                  tabindex="0"
                  onkeydown={(e) => e.key === 'Enter' && handleReset()}
                >
                  <RotateCcw
                    class="h-4 w-4 transition-transform duration-200 group-hover:rotate-180"
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent class="" arrowClasses="">
                <p>Resetar configurações</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  </div>
</div>
