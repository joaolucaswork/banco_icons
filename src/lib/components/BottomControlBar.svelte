<script>
import { Button } from "$lib/components/ui/button";
import { Slider } from "$lib/components/ui/slider";
import { Label } from "$lib/components/ui/label";
import { Separator } from "$lib/components/ui/separator";
import SimpleColorPicker from "$lib/components/SimpleColorPicker.svelte";
import { Palette, Maximize2, RotateCcw } from "lucide-svelte";

let {
  sizeValue = [120],
  color = "#000000",
  onSizeChange = () => {},
  onColorChange = () => {},
  onReset = () => {},
} = $props();

// Watch for size changes and notify parent
$effect(() => {
  onSizeChange(sizeValue);
});

function handleColorChange(newColor) {
  onColorChange(newColor);
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
    <div class="container mx-auto px-4 py-3">
      <div
        class="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-4 sm:flex-nowrap sm:gap-6 lg:gap-8"
      >
        <!-- Size Control -->
        <div class="flex max-w-md min-w-0 flex-1 items-center gap-4">
          <div
            class="flex items-center gap-2 text-sm font-medium whitespace-nowrap text-foreground"
          >
            <Maximize2 class="h-4 w-4" />
            <span>Size</span>
          </div>
          <div class="min-w-0 flex-1">
            <Slider
              bind:value={sizeValue}
              min={16}
              max={400}
              step={1}
              class="w-full"
            />
          </div>
          <div
            class="min-w-[3rem] text-right text-xs whitespace-nowrap text-muted-foreground"
          >
            {sizeValue[0]}px
          </div>
        </div>

        <!-- Separator -->
        <Separator orientation="vertical" class="h-8" />

        <!-- Color Control -->
        <div class="flex items-center gap-4">
          <div
            class="flex items-center gap-2 text-sm font-medium whitespace-nowrap text-foreground"
          >
            <Palette class="h-4 w-4" />
            <span>Color</span>
          </div>
          <div class="flex items-center gap-2">
            <SimpleColorPicker
              value={color}
              onValueChange={handleColorChange}
            />
          </div>
        </div>

        <!-- Separator -->
        <Separator orientation="vertical" class="h-8" />

        <!-- Reset Button -->
        <div class="flex items-center">
          <Button
            variant="outline"
            size="sm"
            class="flex items-center gap-2"
            onclick={handleReset}
            disabled={false}
          >
            <RotateCcw class="h-4 w-4" />
            <span class="hidden sm:inline">Reset</span>
          </Button>
        </div>
      </div>
    </div>
  </div>
</div>
