<script>
import { Button } from "$lib/components/ui/button";
import { Input } from "$lib/components/ui/input";
import { Label } from "$lib/components/ui/label";

let { value = "#000000", onValueChange = () => {} } = $props();

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

let customColor = $state(value);
let showPalette = $state(false);

// Update custom color when value prop changes
$effect(() => {
  customColor = value;
});

function handleColorSelect(color) {
  customColor = color;
  onValueChange(color);
  showPalette = false;
}

function handleCustomColorChange() {
  onValueChange(customColor);
}

function togglePalette() {
  showPalette = !showPalette;
}
</script>

<div class="space-y-4">
  <div class="flex items-center gap-2">
    <Label for="color-picker" class="text-sm font-medium text-foreground"
      >Color:</Label
    >

    <Button
      variant="outline"
      class="h-8 w-12 border-2 border-border p-0 hover:border-border/80"
      style="background-color: {value}"
      aria-label="Select color"
      onclick={togglePalette}
      disabled={false}
    >
      <span class="sr-only">Current color: {value}</span>
    </Button>

    <!-- Current color display -->
    <span class="font-mono text-sm text-muted-foreground">{value}</span>
  </div>

  {#if showPalette}
    <div class="rounded-lg border border-border bg-popover p-4 shadow-lg">
      <div class="space-y-4">
        <!-- Color Palette -->
        <div>
          <Label class="mb-2 block text-sm font-medium text-popover-foreground"
            >Preset Colors</Label
          >
          <div class="grid grid-cols-6 gap-2">
            {#each colorPalette as color}
              <button
                type="button"
                class="h-8 w-8 rounded border-2 border-border transition-colors hover:border-border/80 focus:ring-2 focus:ring-ring focus:ring-offset-1 focus:outline-none"
                style="background-color: {color}"
                onclick={() => handleColorSelect(color)}
                aria-label="Select color {color}"
              >
                {#if color === value}
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
            >Custom Color</Label
          >
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
              aria-label="Color picker"
            />
          </div>
        </div>

        <!-- Apply Button -->
        <Button
          onclick={() => handleColorSelect(customColor)}
          class="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          disabled={false}
        >
          Apply Color
        </Button>
      </div>
    </div>
  {/if}
</div>
