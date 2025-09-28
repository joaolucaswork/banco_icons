<script>
import { Button } from "$lib/components/ui/button/index.js";
import { Input } from "$lib/components/ui/input/index.js";
import {
  Dialog,
  DialogFooter,
  DialogPortal,
} from "$lib/components/ui/dialog/index.js";
import { Dialog as DialogPrimitive } from "bits-ui";
import { cn } from "$lib/utils.js";
import { isValidHexColor, normalizeHexColor } from "$lib/utils/color-utils.js";
import { slide } from "svelte/transition";
import { quintOut } from "svelte/easing";
import { RotateCcw } from "lucide-svelte";

let {
  open = $bindable(false),
  elements = [],
  colorMap = {},
  onApply = () => {},
  onCancel = () => {},
  onReset = () => {},
  onElementColorChange = () => {},
  onElementReset = () => {},
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
  onElementColorChange(elementKey, color);
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
  onElementColorChange(elementKey, color);
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
    onElementColorChange(elementKey, normalizedColor);

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

// Handle apply
function handleApply() {
  onApply();
  open = false;
}

// Handle cancel
function handleCancel() {
  onCancel();
  open = false;
}

// Handle reset all
function handleResetAll() {
  onReset();
}
</script>

<Dialog bind:open={open}>
  <DialogPortal>
    <!-- Sem Dialog.Overlay para remover o backdrop -->
    <DialogPrimitive.Content
      class={cn(
        "fixed top-auto right-4 bottom-4 left-4 z-50 grid w-full max-w-md translate-x-0 translate-y-0 gap-4 rounded-lg border bg-background p-6 shadow-lg duration-200 sm:right-4 sm:bottom-4 sm:left-auto sm:w-96 sm:max-w-lg",
        "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
      )}
    >
      <div class="space-y-4 py-4">
        {#each elements as element, index}
          <div
            class="flex flex-col gap-2"
            in:slide={{ duration: 300, delay: index * 50, easing: quintOut }}
          >
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-foreground"
                >{element.label}</span
              >
              {#if element.defaultColor === "auto"}
                <span class="text-xs text-muted-foreground">Auto</span>
              {/if}
            </div>

            <div class="flex items-center gap-2">
              <!-- Hidden native color picker -->
              <input
                bind:this={colorPickerRefs[element.key]}
                type="color"
                value={customColors[element.key] || "#000000"}
                oninput={(/** @type {any} */ e) => handleColorPickerInput(element.key, e)}
                onchange={(/** @type {any} */ e) => handleColorPickerChange(element.key, e)}
                class="pointer-events-none absolute opacity-0"
                aria-label="Seletor de cor nativo para {element.label}"
              />

              <!-- Color button that triggers native picker -->
              <Button
                variant="outline"
                class="h-10 w-10 rounded-lg border-2 border-border p-0 hover:border-border/80"
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
                class="flex-1 border-border bg-background px-3 py-2 font-mono text-sm text-foreground transition-colors {validColors[element.key] ? '' : 'border-destructive bg-destructive/5'}"
                aria-label="Hex color input para {element.label}"
                aria-invalid={!validColors[element.key]}
                title={validColors[element.key] ? "Enter hex color (e.g., #ff0000)" : "Invalid hex color format"}
              />

              <!-- Reset button -->
              <Button
                variant="ghost"
                size="sm"
                class="h-10 w-10 p-0 text-muted-foreground hover:text-foreground"
                onclick={() => handleElementReset(element.key)}
                aria-label="Resetar cor do {element.label}"
                title="Resetar para cor padrão"
                disabled={false}
              >
                <RotateCcw class="h-4 w-4" />
              </Button>
            </div>
          </div>
        {/each}
      </div>

      <DialogFooter class="flex gap-2">
        <Button
          variant="outline"
          onclick={handleResetAll}
          class=""
          disabled={false}
        >
          Resetar Tudo
        </Button>
        <Button
          variant="outline"
          onclick={handleCancel}
          class=""
          disabled={false}
        >
          Cancelar
        </Button>
        <Button onclick={handleApply} class="" disabled={false}>Aplicar</Button>
      </DialogFooter>
    </DialogPrimitive.Content>
  </DialogPortal>
</Dialog>
