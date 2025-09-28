<script>
import { Button } from "$lib/components/ui/button";
import { Slider } from "$lib/components/ui/slider";
import { RotateCcw } from "lucide-svelte";

let {
  sizeValue = [24],
  color = "#000000",
  onSizeChange = () => {},
  onColorChange = () => {},
  onReset = () => {},
} = $props();

let customColor = $state(color);
let colorPickerRef = $state();

// Watch for size changes and notify parent
$effect(() => {
  onSizeChange(sizeValue);
});

// Update custom color when color prop changes
$effect(() => {
  customColor = color;
});

// Handle real-time color changes (during dragging/moving)
function handleColorInput(event) {
  customColor = event.target.value;
  onColorChange(customColor);
}

// Handle final color selection
function handleColorChange(event) {
  customColor = event.target.value;
  onColorChange(customColor);
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

              <!-- Hidden native color picker -->
              <input
                bind:this={colorPickerRef}
                type="color"
                bind:value={customColor}
                oninput={handleColorInput}
                onchange={handleColorChange}
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
