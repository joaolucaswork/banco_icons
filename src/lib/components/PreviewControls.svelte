<script>
import { Button } from "$lib/components/ui/button";
import { Slider } from "$lib/components/ui/slider";
import { Input } from "$lib/components/ui/input";
import { RotateCcw, Sun, Moon } from "lucide-svelte";
import { isValidHexColor, normalizeHexColor } from "$lib/utils/color-utils.js";
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
  onElementReset = () => {},
  selectedLogo = null,
  // Comparison support
  showComparison = $bindable(false),
  // Background toggle support
  onBackgroundToggle = () => {},
  isManualBackgroundActive = false,
  currentBackgroundColor = null,
} = $props();

let customColor = $state(color);
let colorPickerRef = $state();
let isValidColor = $state(true);

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

// Validate color input
$effect(() => {
  isValidColor = isValidHexColor(customColor);
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

function handleTextInput(event) {
  customColor = event.target.value;
}

function handleTextBlur() {
  if (isValidColor && customColor !== color) {
    const normalizedColor = normalizeHexColor(customColor);
    customColor = normalizedColor;
    onColorChange(normalizedColor);
  } else if (!isValidColor) {
    // Reset to last valid color
    customColor = color;
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

<!-- Preview Controls -->
<div class="border-t border-border bg-muted/20 px-6 py-4">
  <div class="flex flex-wrap items-center justify-start gap-4 sm:gap-6">
    <!-- Size Control -->
    <div class="flex items-center">
      <div
        class="flex h-[42px] items-center gap-3 rounded-lg border border-border bg-background px-3 py-2"
      >
        <span class="text-sm font-medium whitespace-nowrap text-foreground"
          >Tamanho</span
        >
        <div class="w-24">
          <Slider
            bind:value={sizeValue}
            min={24}
            max={256}
            step={1}
            class="w-full [&_[data-slider-range]]:bg-foreground [&_[data-slider-thumb]]:h-6 [&_[data-slider-thumb]]:w-6 [&_[data-slider-thumb]]:border-2 [&_[data-slider-thumb]]:border-white [&_[data-slider-thumb]]:bg-white [&_[data-slider-thumb]]:shadow-lg [&_[data-slider-thumb]]:ring-0 [&_[data-slider-thumb]]:transition-transform [&_[data-slider-thumb]]:hover:scale-110 [&_[data-slider-track]]:bg-muted/60"
          />
        </div>
        <span class="w-8 text-right text-xs text-muted-foreground"
          >{sizeValue[0]}</span
        >
      </div>
    </div>

    <!-- Color Control -->
    <div class="flex flex-col gap-4">
      {#if isMultiColor && colorableElements.length > 0}
        <!-- Multi-color button -->
        <div class="flex items-center gap-4">
          <div
            class="flex h-[42px] items-center gap-3 rounded-lg border border-border bg-background px-3 py-2"
          >
            <span class="text-sm font-medium whitespace-nowrap text-foreground"
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
          <div
            class="flex h-[42px] items-center gap-3 rounded-lg border border-border bg-background px-3 py-2"
          >
            <span class="text-sm font-medium whitespace-nowrap text-foreground"
              >Cor</span
            >

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

            <!-- Color button that triggers native picker -->
            <Button
              variant="outline"
              class="h-8 w-8 rounded-full border-2 border-border p-0 hover:border-border/80"
              style="background-color: {color}"
              aria-label="Selecionar cor"
              onclick={openColorPicker}
              disabled={false}
            >
              <span class="sr-only">Cor atual: {color}</span>
            </Button>

            <!-- Editable color input -->
            <Input
              type="text"
              bind:value={customColor}
              oninput={handleTextInput}
              onblur={handleTextBlur}
              placeholder="#000000"
              class="h-8 w-20 border-border bg-background px-2 py-1 font-mono text-xs text-foreground transition-colors {isValidColor ? '' : 'border-destructive bg-destructive/5'}"
              aria-label="Hex color input"
              aria-invalid={!isValidColor}
              title={isValidColor ? "Enter hex color (e.g., #ff0000)" : "Invalid hex color format"}
            />
          </div>
        </div>
      {/if}
    </div>

    <!-- Background Toggle Button -->
    <TooltipProvider delayDuration={300}>
      <Tooltip
        disableHoverableContent={false}
        disableCloseOnTriggerClick={true}
      >
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            class="group h-[42px] px-3 transition-all duration-200 hover:scale-105 hover:border-muted-foreground/20 hover:bg-muted/60 active:scale-95 {isManualBackgroundActive ? 'border-muted-foreground/30 bg-muted/40' : ''}"
            onclick={onBackgroundToggle}
            disabled={false}
          >
            {#if isManualBackgroundActive}
              {#if currentBackgroundColor === "#ffffff"}
                <!-- White background active - Sun icon -->
                <Sun class="h-4 w-4 text-yellow-500" />
              {:else}
                <!-- Transparent background active - Moon icon -->
                <Moon class="h-4 w-4 text-blue-400" />
              {/if}
            {:else}
              <!-- Automatic mode - Dimmed sun icon -->
              <Sun class="h-4 w-4 text-muted-foreground opacity-50" />
            {/if}
          </Button>
        </TooltipTrigger>
        <TooltipContent class="" arrowClasses="">
          <p>
            {#if isManualBackgroundActive}
              {#if currentBackgroundColor === "#ffffff"}
                Fundo branco (clique para transparente)
              {:else}
                Fundo transparente (clique para branco)
              {/if}
            {:else}
              Alternar fundo (automático ativo)
            {/if}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>

    <!-- Reset Button -->
    <TooltipProvider delayDuration={300}>
      <Tooltip
        disableHoverableContent={false}
        disableCloseOnTriggerClick={true}
      >
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            class="group h-[42px] px-3 transition-all duration-200 hover:scale-105 hover:border-muted-foreground/20 hover:bg-muted/60 active:scale-95"
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

    <!-- Comparison Toggle Button -->
    <div class="flex h-[42px] items-center">
      <ComparisonToggle
        bind:showComparison={showComparison}
        selectedLogo={selectedLogo}
        class="h-[42px] w-16 px-4 py-2"
      />
    </div>
  </div>
</div>
