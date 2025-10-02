<script lang="ts">
import { Card, CardContent } from "$lib/components/ui/card";
import { Slider } from "$lib/components/ui/slider";
import { Label } from "$lib/components/ui/label";
import { Input } from "$lib/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "$lib/components/ui/tooltip";
import LogoCard from "./LogoCard.svelte";
import FloatingDownloadButton from "./FloatingDownloadButton.svelte";
import { downloadSelectedLogos } from "$lib/utils/batch-download-utils.js";
import { toast } from "svelte-sonner";

let {
  logosArray = [],
  loading = false,
  class: className = "",
  ...restProps
} = $props();

// State for global controls
let globalColor = $state("#ffffff"); // Start with white
let logoSize = $state([80]); // Default size for grid items
let colorPickerRef = $state();

// Input field values (for manual editing)
let colorInputValue = $state("#ffffff");
let sizeInputValue = $state("80");

// Canvas refs for each logo
let canvasRefs = $state({});

// Individual colors for each logo (starts with global color)
let individualColors = $state({});

// Selection state - Map of logoName to svgContent
let selectedLogos = $state(new Map());

// Initialize individual colors when logos change
$effect(() => {
  logosArray.forEach(([logoName]) => {
    if (!individualColors[logoName]) {
      individualColors[logoName] = globalColor;
    }
  });
});

// Sync input values with state
$effect(() => {
  colorInputValue = globalColor;
});

$effect(() => {
  sizeInputValue = logoSize[0].toString();
});

// Calculate dynamic canvas size based on logo size
// Formula: canvas size scales proportionally with logo size
// Minimum canvas: 120px (for 16px logos), Maximum canvas: 400px (for 150px logos)
const dynamicCanvasSize = $derived(() => {
  const minLogoSize = 16;
  const maxLogoSize = 150;
  const minCanvasSize = 120;
  const maxCanvasSize = 400;

  const currentSize = logoSize[0];
  const sizeRange = maxLogoSize - minLogoSize;
  const canvasRange = maxCanvasSize - minCanvasSize;
  const ratio = (currentSize - minLogoSize) / sizeRange;

  return Math.round(minCanvasSize + ratio * canvasRange);
});

// Calculate optimal grid columns based on logo size
// Smaller logos = more columns, larger logos = fewer columns
const gridColumns = $derived(() => {
  const currentSize = logoSize[0];

  if (currentSize <= 30) {
    return "grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7";
  } else if (currentSize <= 50) {
    return "grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6";
  } else if (currentSize <= 80) {
    return "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";
  } else if (currentSize <= 110) {
    return "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4";
  } else {
    return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
  }
});

// Open native color picker
function openColorPicker() {
  if (colorPickerRef) {
    colorPickerRef.click();
  }
}

// Handle color change with real-time preview
function handleColorPickerInput(event) {
  globalColor = event.target.value;
  // Update all logos with the new global color
  logosArray.forEach(([logoName]) => {
    individualColors[logoName] = globalColor;
  });
}

// Handle manual color input change (real-time)
function handleColorInputInput(event) {
  const value = event.target.value.trim();

  // Validate hex color format
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

  if (hexRegex.test(value)) {
    globalColor = value;
    // Update all logos with the new global color
    logosArray.forEach(([logoName]) => {
      individualColors[logoName] = globalColor;
    });
  }
}

// Handle color input blur to validate and reset if needed
function handleColorInputBlur() {
  const value = colorInputValue.trim();
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

  if (!hexRegex.test(value)) {
    // Reset to current valid color if invalid
    colorInputValue = globalColor;
  }
}

// Handle manual size input change (real-time)
function handleSizeInputInput(event) {
  const value = parseInt(event.target.value, 10);

  // Validate size range (16-150)
  if (!isNaN(value) && value >= 16 && value <= 150) {
    logoSize = [value];
  }
}

// Handle size input blur to ensure valid value
function handleSizeInputBlur() {
  const value = parseInt(sizeInputValue, 10);

  if (isNaN(value) || value < 16) {
    logoSize = [16];
    sizeInputValue = "16";
  } else if (value > 150) {
    logoSize = [150];
    sizeInputValue = "150";
  } else {
    // Ensure the input shows the actual value
    sizeInputValue = logoSize[0].toString();
  }
}

// Selection functions
function toggleLogoSelection(logoName, svgContent) {
  if (selectedLogos.has(logoName)) {
    selectedLogos.delete(logoName);
  } else {
    selectedLogos.set(logoName, svgContent);
  }
  // Trigger reactivity
  selectedLogos = selectedLogos;
}

function clearSelection() {
  selectedLogos.clear();
  selectedLogos = selectedLogos;
}

// Handle batch download
async function handleBatchDownload(format) {
  if (selectedLogos.size === 0) {
    toast.error("Nenhum logo selecionado");
    return;
  }

  const size = logoSize[0];
  const result = await downloadSelectedLogos(selectedLogos, size, format);

  if (result.success) {
    if (result.count === 1) {
      toast.success(`Logo baixado como ${format.toUpperCase()}!`);
    } else {
      toast.success(
        `${result.count} logos baixados como ${format.toUpperCase()}!`,
      );
    }
    // Clear selection after successful download
    clearSelection();
  } else {
    toast.error("Falha ao baixar logos. Tente novamente.");
  }
}
</script>

<div class={className} {...restProps}>
  <Card class="border-transparent bg-transparent">
    <CardContent class="p-0">
      <!-- Global Controls -->
      <div class="mb-6 flex gap-8">
        <!-- Color Control -->
        <div class="flex w-48 flex-col gap-6">
          <div class="flex h-5 items-center justify-between gap-6">
            <Label class="text-sm font-medium text-foreground">HEX</Label>
            <Input
              type="text"
              bind:value={colorInputValue}
              oninput={handleColorInputInput}
              onblur={handleColorInputBlur}
              placeholder="#ffffff"
              class="h-7 w-24 border-2 border-border bg-transparent px-3 py-1 text-right font-mono text-xs"
              aria-label="Código de cor hexadecimal"
            />
          </div>
          <div class="flex h-10 items-center">
            <!-- Hidden native color picker -->
            <input
              bind:this={colorPickerRef}
              type="color"
              bind:value={globalColor}
              oninput={handleColorPickerInput}
              class="pointer-events-none absolute opacity-0"
              aria-label="Seletor de cor global"
            />

            <TooltipProvider delayDuration={400}>
              <Tooltip>
                <TooltipTrigger asChild>
                  {#snippet child({ props })}
                    <button
                      {...props}
                      onclick={openColorPicker}
                      class="flex h-10 w-full items-center justify-center rounded-lg border-2 border-border transition-all hover:border-border/80"
                      style="background-color: {globalColor}; box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.1), 0 2px 4px rgba(0, 0, 0, 0.2);"
                      aria-label="Abrir seletor de cor"
                    >
                      <span class="sr-only">Cor atual: {globalColor}</span>
                    </button>
                  {/snippet}
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>Alterar cor de todos os logos</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <!-- Size Control -->
        <div class="flex w-48 flex-col gap-6">
          <div class="flex h-5 items-center justify-between gap-6">
            <Label class="text-sm font-medium text-foreground">Tamanho</Label>
            <Input
              type="number"
              bind:value={sizeInputValue}
              oninput={handleSizeInputInput}
              onblur={handleSizeInputBlur}
              min={16}
              max={150}
              step={1}
              placeholder="80"
              class="h-7 w-20 [appearance:textfield] border-2 border-border bg-transparent px-3 py-1 text-right font-mono text-xs [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              aria-label="Tamanho do logo em pixels"
            />
          </div>
          <div class="flex h-10 items-center">
            <Slider
              bind:value={logoSize}
              min={16}
              max={150}
              step={1}
              class="w-full"
            />
          </div>
        </div>
      </div>

      <!-- Grid of Logos -->
      {#if loading}
        <div class="flex min-h-[400px] items-center justify-center">
          <p class="text-muted-foreground">Carregando logos...</p>
        </div>
      {:else if logosArray.length === 0}
        <div class="flex min-h-[400px] items-center justify-center">
          <div class="text-center">
            <p class="text-muted-foreground">Nenhum logo disponível</p>
            <p class="mt-2 text-xs text-muted-foreground">
              Debug: Array length = {logosArray.length}
            </p>
          </div>
        </div>
      {:else}
        <div class="grid gap-4 {gridColumns()}">
          {#each logosArray as [logoName, svgContent] (logoName)}
            <LogoCard
              logoName={logoName}
              svgContent={svgContent}
              bind:color={individualColors[logoName]}
              size={logoSize[0]}
              canvasSize={dynamicCanvasSize()}
              bind:canvasRef={canvasRefs[logoName]}
              isSelected={selectedLogos.has(logoName)}
              onToggleSelection={() => toggleLogoSelection(logoName, svgContent)}
            />
          {/each}
        </div>
      {/if}
    </CardContent>
  </Card>

  <!-- Floating Download Button -->
  <FloatingDownloadButton
    selectedCount={selectedLogos.size}
    onDownload={handleBatchDownload}
  />
</div>
