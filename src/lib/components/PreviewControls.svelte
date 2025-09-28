<script>
import { Button } from "$lib/components/ui/button";
import { Slider } from "$lib/components/ui/slider";
import { Input } from "$lib/components/ui/input";
import { RotateCcw, Palette } from "lucide-svelte";
import { isValidHexColor, normalizeHexColor } from "$lib/utils/color-utils.js";
import ColorCustomizationDialog from "./ColorCustomizationDialog.svelte";

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
} = $props();

let customColor = $state(color);
let colorPickerRef = $state();
let isValidColor = $state(true);

// State for color customization dialog
let dialogOpen = $state(false);
let originalColorMap = /** @type {Record<string, string>} */ ({});

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

// Multi-color dialog functions
function openColorDialog() {
  originalColorMap = { ...colorMap };
  dialogOpen = true;
}

function handleDialogApply(newColorMap) {
  dialogOpen = false;
}

function handleDialogCancel() {
  // Restore original colors
  for (const [elementId, originalColor] of Object.entries(originalColorMap)) {
    onElementColorChange(elementId, originalColor);
  }
  dialogOpen = false;
}

function handleDialogReset() {
  onElementReset();
  dialogOpen = false;
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
            class="w-full"
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

            <!-- Customize colors button -->
            <Button
              variant="outline"
              class="h-8 px-3 text-xs"
              onclick={openColorDialog}
              disabled={false}
            >
              <Palette class="mr-1 h-3 w-3" />
              Personalizar
            </Button>
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

    <!-- Reset Button -->
    <Button
      variant="outline"
      class="group h-[42px] px-3 transition-all duration-200 hover:scale-105 hover:border-muted-foreground/20 hover:bg-muted/60 active:scale-95"
      onclick={handleReset}
      title="Resetar configurações"
      disabled={false}
    >
      <RotateCcw
        class="h-4 w-4 transition-transform duration-200 group-hover:rotate-180"
      />
    </Button>
  </div>
</div>

<!-- Color Customization Dialog -->
{#if isMultiColor && colorableElements.length > 0}
  <ColorCustomizationDialog
    bind:open={dialogOpen}
    elements={colorableElements}
    colorMap={colorMap}
    onApply={handleDialogApply}
    onCancel={handleDialogCancel}
    onReset={handleDialogReset}
    onElementColorChange={onElementColorChange}
    onElementReset={onElementReset}
  />
{/if}
