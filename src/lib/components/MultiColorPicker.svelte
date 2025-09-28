<script>
import { Button } from "$lib/components/ui/button";
import { Input } from "$lib/components/ui/input";
import { Label } from "$lib/components/ui/label";
import { RotateCcw } from "lucide-svelte";
import { isValidHexColor, normalizeHexColor } from "$lib/utils/color-utils.js";
import { slide } from "svelte/transition";
import { quintOut } from "svelte/easing";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "$lib/components/ui/tooltip";

let {
  elements = [],
  colorMap = {},
  onColorChange = () => {},
  onElementReset = () => {},
  class: className = "",
  ...restProps
} = $props();

// State for each color picker
let colorPickerRefs = /** @type {Record<string, HTMLInputElement>} */ ({});
let customColors = /** @type {Record<string, string>} */ ($state({}));
let validColors = /** @type {Record<string, boolean>} */ ($state({}));

// Initialize custom colors and validation state
$effect(() => {
  elements.forEach((element) => {
    const currentColor = colorMap[element.key] || element.defaultColor;
    if (currentColor !== "auto") {
      customColors[element.key] = currentColor;
      validColors[element.key] = isValidHexColor(currentColor);
    } else {
      customColors[element.key] = "#000000";
      validColors[element.key] = true;
    }
  });
});

// Handle color picker input (real-time preview)
/**
 * @param {string} elementKey
 * @param {Event & { currentTarget: HTMLInputElement }} event
 */
function handleColorPickerInput(elementKey, event) {
  const color = event.currentTarget.value;
  customColors[elementKey] = color;
  validColors[elementKey] = true;

  // Real-time preview
  onColorChange(elementKey, color);
}

// Handle color picker change (final value)
/**
 * @param {string} elementKey
 * @param {Event & { currentTarget: HTMLInputElement }} event
 */
function handleColorPickerChange(elementKey, event) {
  const color = normalizeHexColor(event.currentTarget.value);
  customColors[elementKey] = color;
  validColors[elementKey] = true;
  onColorChange(elementKey, color);
}

// Handle text input
/**
 * @param {string} elementKey
 * @param {Event & { currentTarget: HTMLInputElement }} event
 */
function handleTextInput(elementKey, event) {
  const inputValue = event.currentTarget.value;
  customColors[elementKey] = inputValue;

  // Validate color format
  validColors[elementKey] = isValidHexColor(inputValue);
}

// Handle text input blur
/**
 * @param {string} elementKey
 * @param {Event & { currentTarget: HTMLInputElement }} event
 */
function handleTextBlur(elementKey, event) {
  const inputValue = event.currentTarget.value.trim();

  if (inputValue === "") {
    // Revert to current color
    const currentColor = colorMap[elementKey] || "#000000";
    customColors[elementKey] = currentColor;
    validColors[elementKey] = true;
  } else if (isValidHexColor(inputValue)) {
    const normalizedColor = normalizeHexColor(inputValue);
    customColors[elementKey] = normalizedColor;
    validColors[elementKey] = true;
    onColorChange(elementKey, normalizedColor);

    // Update native color picker
    if (colorPickerRefs[elementKey]) {
      colorPickerRefs[elementKey].value = normalizedColor;
    }
  } else {
    // Revert to last valid color
    const currentColor = colorMap[elementKey] || "#000000";
    customColors[elementKey] = currentColor;
    validColors[elementKey] = true;
  }
}

// Open native color picker
/**
 * @param {string} elementKey
 */
function openColorPicker(elementKey) {
  if (colorPickerRefs[elementKey]) {
    colorPickerRefs[elementKey].click();
  }
}

// Handle element reset
/**
 * @param {string} elementKey
 */
function handleElementReset(elementKey) {
  onElementReset(elementKey);
}
</script>

<div class="space-y-4 {className}" {...restProps}>
  {#each elements as element, index (element.key)}
    <div
      class="flex items-center gap-4"
      in:slide={{ duration: 1000, delay: index * 100, easing: quintOut }}
    >
      <!-- Element Label -->
      <div class="min-w-[60px]">
        <Label class="text-sm font-medium text-foreground">
          {element.label}
        </Label>
      </div>

      <!-- Color Control -->
      <div
        class="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2"
      >
        <!-- Hidden native color picker -->
        <input
          bind:this={colorPickerRefs[element.key]}
          type="color"
          value={customColors[element.key] || "#000000"}
          oninput={(e) => handleColorPickerInput(element.key, e)}
          onchange={(e) => handleColorPickerChange(element.key, e)}
          class="pointer-events-none absolute opacity-0"
          aria-label="Seletor de cor nativo para {element.label}"
        />

        <!-- Color button that triggers native picker -->
        <Button
          variant="outline"
          class="h-8 w-8 rounded-full border-2 border-border p-0 hover:border-border/80"
          style="background-color: {customColors[element.key] || '#000000'}"
          aria-label="Selecionar cor para {element.label}"
          onclick={() => openColorPicker(element.key)}
          disabled={false}
        >
          <span class="sr-only"
            >Cor atual: {customColors[element.key] || '#000000'}</span
          >
        </Button>

        <!-- Editable color input -->
        <Input
          type="text"
          value={customColors[element.key] || "#000000"}
          oninput={(/** @type {any} */ e) => handleTextInput(element.key, e)}
          onblur={(/** @type {any} */ e) => handleTextBlur(element.key, e)}
          placeholder="#000000"
          class="h-8 w-20 border-border bg-background px-2 py-1 font-mono text-xs text-foreground transition-colors {validColors[element.key] ? '' : 'border-destructive bg-destructive/5'}"
          aria-label="Hex color input para {element.label}"
          aria-invalid={!validColors[element.key]}
          title={validColors[element.key] ? "Enter hex color (e.g., #ff0000)" : "Invalid hex color format"}
        />

        <!-- Reset button -->
        <TooltipProvider delayDuration={300}>
          <Tooltip
            disableHoverableContent={false}
            disableCloseOnTriggerClick={true}
          >
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                class="group h-8 w-8 p-0 text-muted-foreground transition-all duration-200 hover:scale-105 hover:bg-muted/60 hover:text-foreground active:scale-95"
                onclick={() => handleElementReset(element.key)}
                aria-label="Resetar cor do {element.label}"
                disabled={false}
              >
                <RotateCcw
                  class="h-4 w-4 transition-transform duration-200 group-hover:rotate-180"
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent class="" arrowClasses="">
              <p>Resetar para cor padrão</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <!-- Auto contrast indicator -->
      {#if element.autoContrastVar && colorMap[element.key] === "auto"}
        <div class="text-xs text-muted-foreground">Auto</div>
      {/if}
    </div>
  {/each}
</div>

<style>
/* Smooth transitions for color changes */
:global(.multi-color-picker input[type="color"]) {
  transition: all 0.2s ease;
}

:global(.multi-color-picker .color-button) {
  transition: all 0.2s ease;
}
</style>
