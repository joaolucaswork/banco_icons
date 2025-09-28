<script>
import { Button } from "$lib/components/ui/button";
import { Slider } from "$lib/components/ui/slider";
import { Input } from "$lib/components/ui/input";
import { RotateCcw, Copy, Bug } from "lucide-svelte";
import { isValidHexColor, normalizeHexColor } from "$lib/utils/color-utils.js";
import { copyToClipboard, diagnoseClipboard } from "$lib/utils/svg-utils.js";
import { toast } from "svelte-sonner";

let {
  sizeValue = [24],
  color = "#000000",
  onSizeChange = () => {},
  onColorChange = () => {},
  onReset = () => {},
  formattedSvg = "",
  onCopySvg = () => {},
} = $props();

let customColor = $state(color);
let colorPickerRef = $state();
let isValidColor = $state(true);

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
  isValidColor = true;
  onColorChange(newColor);
}

// Handle final color selection from native color picker
function handleColorPickerChange(event) {
  const newColor = event.target.value;
  customColor = newColor;
  isValidColor = true;
  onColorChange(newColor);
}

// Handle text input changes with validation
function handleTextInput(event) {
  const inputValue = event.target.value;
  customColor = inputValue;

  // Validate the input - allow empty input temporarily
  if (inputValue === "" || isValidHexColor(inputValue)) {
    if (inputValue !== "" && isValidHexColor(inputValue)) {
      const normalizedColor = normalizeHexColor(inputValue);
      isValidColor = true;
      onColorChange(normalizedColor);

      // Update the native color picker to match
      if (colorPickerRef) {
        colorPickerRef.value = normalizedColor;
      }
    } else {
      isValidColor = inputValue === ""; // Empty is valid temporarily
    }
  } else {
    isValidColor = false;
  }
}

// Handle text input blur - normalize valid colors
function handleTextBlur(event) {
  const inputValue = event.target.value.trim();

  if (inputValue === "") {
    // If empty, revert to the current color
    customColor = color;
    isValidColor = true;
  } else if (isValidHexColor(inputValue)) {
    const normalizedColor = normalizeHexColor(inputValue);
    customColor = normalizedColor;
    isValidColor = true;
    onColorChange(normalizedColor);

    // Update the native color picker to match
    if (colorPickerRef) {
      colorPickerRef.value = normalizedColor;
    }
  } else {
    // Revert to the last valid color for invalid input
    customColor = color;
    isValidColor = true;
  }
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

async function handleCopySvg() {
  if (formattedSvg) {
    const success = await copyToClipboard(formattedSvg);
    if (success) {
      toast.success("Código SVG copiado para a área de transferência!");
    } else {
      toast.error("Falha ao copiar código. Tente novamente.");
    }
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

          <!-- Copy Button -->
          <div
            class="flex h-14 w-14 cursor-pointer items-center justify-center rounded-lg border border-border bg-primary/90 text-primary-foreground hover:bg-primary"
            onclick={handleCopySvg}
            role="button"
            tabindex="0"
            onkeydown={(e) => e.key === 'Enter' && handleCopySvg()}
            class:opacity-50={!formattedSvg}
            class:cursor-not-allowed={!formattedSvg}
            class:pointer-events-none={!formattedSvg}
            title="Copiar código SVG"
          >
            <Copy class="h-6 w-6" />
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
