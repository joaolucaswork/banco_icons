<script>
import { Button } from "$lib/components/ui/button/index.js";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "$lib/components/ui/popover/index.js";
import { isValidHexColor, normalizeHexColor } from "$lib/utils/color-utils.js";
import { slide } from "svelte/transition";
import { quintOut } from "svelte/easing";

let {
  open = $bindable(false),
  elements = [],
  colorMap = {},
  onElementColorChange = () => {},
  children,
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

// Open native color picker
/**
 * @param {string} elementKey
 */
function openColorPicker(elementKey) {
  if (colorPickerRefs[elementKey]) {
    colorPickerRefs[elementKey].click();
  }
}
</script>

<Popover bind:open={open}>
  <PopoverTrigger asChild class="">
    {#snippet child({ props })}
      <div {...props}>
        {@render children?.()}
      </div>
    {/snippet}
  </PopoverTrigger>

  <PopoverContent
    side="bottom"
    align="start"
    sideOffset={4}
    class="w-fit p-2"
    portalProps={{}}
  >
    <div class="flex gap-3">
      {#each elements as element, index}
        <div
          class="flex flex-col items-center gap-1"
          in:slide={{ duration: 200, delay: index * 30, easing: quintOut }}
        >
          <span class="text-center text-xs font-medium text-foreground"
            >{element.label}</span
          >

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
            class="h-8 w-8 rounded border-2 p-0 transition-all"
            style="background-color: {customColors[element.key] || '#000000'}; border-color: rgba(255, 255, 255, 0.4); box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.1), 0 2px 4px rgba(0, 0, 0, 0.2);"
            aria-label="Selecionar cor para {element.label}"
            onclick={() => openColorPicker(element.key)}
            disabled={false}
          >
            <span class="sr-only"
              >Cor atual: {customColors[element.key] || '#000000'}</span
            >
          </Button>
        </div>
      {/each}
    </div>
  </PopoverContent>
</Popover>
