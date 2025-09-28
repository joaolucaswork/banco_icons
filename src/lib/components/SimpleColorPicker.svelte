<script>
import { Button } from "$lib/components/ui/button";
import { Input } from "$lib/components/ui/input";
import { Label } from "$lib/components/ui/label";

let { value = "#000000", onValueChange = () => {} } = $props();

// Removed predefined color palette - using only native color picker

let customColor = $state(value);
let showPalette = $state(false);

// Update custom color when value prop changes
$effect(() => {
  customColor = value;
});

function handleCustomColorChange() {
  onValueChange(customColor);
  showPalette = false;
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
      </div>
    </div>
  {/if}
</div>
