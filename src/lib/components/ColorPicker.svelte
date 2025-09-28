<script>
import { Button } from "$lib/components/ui/button";
import { Input } from "$lib/components/ui/input";
import { Label } from "$lib/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "$lib/components/ui/popover";

let { value = "#000000", onValueChange = () => {} } = $props();

let customColor = $state(value);
let isOpen = $state(false);

// Update custom color when value prop changes
$effect(() => {
  customColor = value;
});

function handleCustomColorChange() {
  onValueChange(customColor);
  isOpen = false;
}
</script>

<div class="flex items-center gap-2">
  <Label for="color-picker" class="text-sm font-medium">Color:</Label>

  <Popover bind:open={isOpen}>
    <PopoverTrigger class="">
      <Button
        variant="outline"
        class="h-8 w-12 border-2 border-gray-300 p-0 hover:border-gray-400"
        style="background-color: {value}"
        aria-label="Select color"
        disabled={false}
      >
        <span class="sr-only">Current color: {value}</span>
      </Button>
    </PopoverTrigger>

    <PopoverContent
      class="w-64 border border-gray-200 bg-white p-4 shadow-lg"
      portalProps={{}}
    >
      <div class="space-y-4">
        <!-- Native Color Picker -->
        <div>
          <Label for="custom-color" class="mb-2 block text-sm font-medium"
            >Color Picker</Label
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
              class="h-10 w-10 cursor-pointer rounded border border-gray-300"
              aria-label="Color picker"
            />
          </div>
        </div>
      </div>
    </PopoverContent>
  </Popover>

  <!-- Current color display -->
  <span class="font-mono text-sm text-gray-600">{value}</span>
</div>
