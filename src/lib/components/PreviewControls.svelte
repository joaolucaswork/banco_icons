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
import ComparisonToggle from "./ComparisonToggle.svelte";

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

  selectedLogo = null,
  // Comparison support
  showComparison = $bindable(false),
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

function openColorPicker() {
  if (colorPickerRef) {
    colorPickerRef.click();
  }
}

function handleColorPickerInput(event) {
  const newColor = event.target.value;
  customColor = newColor;
  onColorChange(newColor);
}

function handleColorPickerChange(event) {
  const newColor = event.target.value;
  customColor = newColor;
  onColorChange(newColor);
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

<!-- Preview Controls -->
<div class="border-t border-border bg-muted/20 px-3 py-3 sm:px-6 sm:py-4">
  <!-- Mobile Layout: Stack vertically -->
  <div class="flex flex-col gap-3 lg:hidden">
    <!-- Size Control -->
    <div class="flex w-full flex-col gap-2">
      <span class="text-xs font-medium text-foreground">Tamanho</span>
      <div
        class="flex h-[38px] w-full items-center gap-2 rounded-lg border border-border bg-background px-2 py-2"
      >
        <div class="flex-1">
          <Slider
            bind:value={sizeValue}
            min={24}
            max={256}
            step={1}
            class="w-full [&_[data-slider-range]]:bg-white [&_[data-slider-range]]:transition-all [&_[data-slider-range]]:duration-200 [&_[data-slider-thumb]]:h-5 [&_[data-slider-thumb]]:w-5 [&_[data-slider-thumb]]:border-2 [&_[data-slider-thumb]]:border-white [&_[data-slider-thumb]]:bg-white [&_[data-slider-thumb]]:shadow-lg [&_[data-slider-thumb]]:ring-0 [&_[data-slider-thumb]]:transition-transform [&_[data-slider-thumb]]:hover:scale-110 [&_[data-slider-track]]:h-3"
          />
        </div>
        <span
          class="flex h-7 w-10 items-center justify-center rounded border border-border bg-background text-sm font-medium text-foreground"
          >{sizeValue[0]}</span
        >
      </div>
    </div>

    <!-- Color and Action Buttons Row -->
    <div class="flex flex-1 flex-wrap items-end justify-between gap-2">
      <!-- Color Control -->
      <div class="flex flex-col gap-2">
        {#if isMultiColor && colorableElements.length > 0}
          <span class="text-xs font-medium text-foreground">Cores</span>
          <div class="flex items-center gap-2">
            <div
              class="flex h-[38px] items-center gap-2 rounded-lg border border-border bg-background px-2 py-2"
            >
              {#each colorableElements as element}
                <input
                  bind:this={colorPickerRefs[element.key]}
                  type="color"
                  value={resolvedColorMap[element.key] || element.defaultColor || "#000000"}
                  oninput={(e) => handleElementColorInput(element.key, e)}
                  onchange={(e) => handleElementColorChange(element.key, e)}
                  class="pointer-events-none absolute opacity-0"
                  aria-label="Seletor de cor nativo para {element.label}"
                />
                <TooltipProvider delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      {#snippet child({ props })}
                        <Button
                          {...props}
                          variant="outline"
                          class="h-7 w-7 rounded border border-border p-0 hover:border-border/80"
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
          <div class="flex items-center gap-4">
            <input
              bind:this={colorPickerRef}
              type="color"
              bind:value={customColor}
              oninput={handleColorPickerInput}
              onchange={handleColorPickerChange}
              class="pointer-events-none absolute opacity-0"
              aria-label="Seletor de cor nativo"
            />
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

      <!-- Action Buttons -->
      <div class="flex items-center gap-2">
        <TooltipProvider delayDuration={300}>
          <Tooltip
            disableHoverableContent={false}
            disableCloseOnTriggerClick={true}
          >
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                class="group h-[38px] px-3 transition-all duration-200"
                onclick={handleReset}
                disabled={false}
              >
                <RotateCcw
                  class="h-4 w-4 transition-transform duration-200 group-hover:rotate-180"
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent class="" arrowClasses="">
              <p>Resetar configurações</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <ComparisonToggle
          bind:showComparison={showComparison}
          selectedLogo={selectedLogo}
          class="h-[38px] px-4 py-2"
        />
      </div>
    </div>
  </div>

  <!-- Desktop Layout (lg and up): Tamanho + Cores | Reset + Comparação -->
  <div class="hidden lg:flex lg:items-end lg:justify-between lg:gap-6">
    <!-- Left: Size and Color Controls -->
    <div class="flex items-end gap-6">
      <!-- Size Control with label and value above -->
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-foreground">Tamanho</span>
          <span
            class="flex h-6 w-10 items-center justify-center rounded border border-border bg-background text-sm font-medium text-foreground"
            >{sizeValue[0]}</span
          >
        </div>
        <div
          class="flex h-[42px] items-center rounded-lg border border-border bg-background py-2"
        >
          <div class="w-32">
            <Slider
              bind:value={sizeValue}
              min={24}
              max={256}
              step={1}
              class="w-full [&_[data-slider-range]]:bg-white [&_[data-slider-range]]:transition-all [&_[data-slider-range]]:duration-200 [&_[data-slider-thumb]]:h-6 [&_[data-slider-thumb]]:w-6 [&_[data-slider-thumb]]:border-2 [&_[data-slider-thumb]]:border-white [&_[data-slider-thumb]]:bg-white [&_[data-slider-thumb]]:shadow-lg [&_[data-slider-thumb]]:ring-0 [&_[data-slider-thumb]]:transition-transform [&_[data-slider-thumb]]:hover:scale-110 [&_[data-slider-track]]:h-3"
            />
          </div>
        </div>
      </div>

      <!-- Color Control -->
      <div class="flex flex-col gap-2">
        {#if isMultiColor && colorableElements.length > 0}
          <span class="text-sm font-medium text-foreground">Cores</span>
          <div
            class="flex h-[42px] items-center gap-2 rounded-lg border border-border bg-background py-2"
          >
            {#each colorableElements as element}
              <input
                bind:this={colorPickerRefs[element.key]}
                type="color"
                value={resolvedColorMap[element.key] || element.defaultColor || "#000000"}
                oninput={(e) => handleElementColorInput(element.key, e)}
                onchange={(e) => handleElementColorChange(element.key, e)}
                class="pointer-events-none absolute opacity-0"
                aria-label="Seletor de cor nativo para {element.label}"
              />
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
        {:else}
          <span class="text-sm font-medium text-foreground">Cor</span>
          <div
            class="flex h-[42px] items-center rounded-lg border border-border bg-background py-2"
          >
            <input
              bind:this={colorPickerRef}
              type="color"
              bind:value={customColor}
              oninput={handleColorPickerInput}
              onchange={handleColorPickerChange}
              class="pointer-events-none absolute opacity-0"
              aria-label="Seletor de cor nativo"
            />
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
    </div>

    <!-- Right: Action Buttons (Reset + Comparison) -->
    <div class="flex items-end gap-2">
      <TooltipProvider delayDuration={300}>
        <Tooltip
          disableHoverableContent={false}
          disableCloseOnTriggerClick={true}
        >
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              class="group h-[42px] px-3 transition-all duration-200"
              onclick={handleReset}
              disabled={false}
            >
              <RotateCcw
                class="h-4 w-4 transition-transform duration-200 group-hover:rotate-180"
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent class="" arrowClasses="">
            <p>Resetar configurações</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <ComparisonToggle
        bind:showComparison={showComparison}
        selectedLogo={selectedLogo}
        class="h-[42px] w-16 px-4 py-2"
      />
    </div>
  </div>
</div>
