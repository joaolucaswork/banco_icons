<script>
import { onMount } from "svelte";
import { Card, CardContent } from "$lib/components/ui/card";
import { Slider } from "$lib/components/ui/slider";
import { Label } from "$lib/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "$lib/components/ui/tooltip";
import { getBankDisplayName } from "$lib/utils/svg-utils.js";

let {
  logos = new Map(),
  loading = false,
  class: className = "",
  ...restProps
} = $props();

// State for global controls
let globalColor = $state("#808080"); // Start with gray
let logoSize = $state([80]); // Default size for grid items
let colorPickerRef = $state();

// Convert logos Map to array
let logoArray = $derived(Array.from(logos.entries()));

// Canvas refs for each logo
let canvasRefs = $state({});

// Function to draw dotted pattern background
function drawDottedPattern(ctx, width, height, dotColor = "#666666") {
  const dotSize = 1;
  const spacing = 15;

  ctx.fillStyle = dotColor;

  for (let x = spacing / 2; x < width; x += spacing) {
    for (let y = spacing / 2; y < height; y += spacing) {
      ctx.beginPath();
      ctx.arc(x, y, dotSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// Function to render a single logo on canvas
async function renderLogoOnCanvas(canvas, svgContent, color, size) {
  if (!canvas || !svgContent) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Use high DPI canvas for crisp rendering
  const dpr = window.devicePixelRatio || 1;
  const canvasSize = 300; // Larger base size for better quality

  // Set actual canvas size (accounting for device pixel ratio)
  canvas.width = canvasSize * dpr;
  canvas.height = canvasSize * dpr;

  // Scale context to match device pixel ratio
  ctx.scale(dpr, dpr);

  // Clear canvas
  ctx.clearRect(0, 0, canvasSize, canvasSize);

  // Draw transparent background
  ctx.fillStyle = "transparent";
  ctx.fillRect(0, 0, canvasSize, canvasSize);

  // Draw dotted pattern
  drawDottedPattern(ctx, canvasSize, canvasSize, "#666666");

  // Apply color to SVG
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgContent, "image/svg+xml");
  const svgElement = doc.querySelector("svg");

  if (!svgElement) return;

  // Use larger size for rendering to maintain quality
  const renderSize = size * 2; // Render at 2x size for better quality
  svgElement.setAttribute("width", renderSize.toString());
  svgElement.setAttribute("height", renderSize.toString());

  // Apply color to all fill and stroke attributes
  const allElements = svgElement.querySelectorAll("*");
  allElements.forEach((el) => {
    if (el.hasAttribute("fill") && el.getAttribute("fill") !== "none") {
      el.setAttribute("fill", color);
    }
    if (el.hasAttribute("stroke") && el.getAttribute("stroke") !== "none") {
      el.setAttribute("stroke", color);
    }
  });

  // Also set fill on the svg element itself if it has one
  if (
    svgElement.hasAttribute("fill") &&
    svgElement.getAttribute("fill") !== "none"
  ) {
    svgElement.setAttribute("fill", color);
  }

  const modifiedSvg = new XMLSerializer().serializeToString(doc);

  // Create image from SVG
  const img = new Image();
  const blob = new Blob([modifiedSvg], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);

  img.onload = () => {
    // Enable image smoothing for better quality
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // Center the logo on canvas
    const x = (canvasSize - renderSize) / 2;
    const y = (canvasSize - renderSize) / 2;
    ctx.drawImage(img, x, y, renderSize, renderSize);
    URL.revokeObjectURL(url);
  };

  img.src = url;
}

// Render all logos when color or size changes
$effect(() => {
  const currentSize = logoSize[0];
  logoArray.forEach(([logoName, svgContent]) => {
    const canvas = canvasRefs[logoName];
    if (canvas) {
      renderLogoOnCanvas(canvas, svgContent, globalColor, currentSize);
    }
  });
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
}
</script>

<div class={className} {...restProps}>
  <Card class="border-border bg-card">
    <CardContent class="p-6">
      <!-- Global Controls -->
      <div
        class="mb-6 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"
      >
        <!-- Color Control -->
        <div class="flex flex-col gap-2">
          <Label class="text-sm font-medium text-foreground">Cor Global</Label>
          <div class="flex items-center gap-3">
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
                      class="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-border transition-all hover:border-border/80"
                      style="background-color: {globalColor};"
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

            <span class="font-mono text-sm text-muted-foreground"
              >{globalColor}</span
            >
          </div>
        </div>

        <!-- Size Control -->
        <div class="flex flex-col gap-2 sm:min-w-[200px]">
          <div class="flex items-center justify-between">
            <Label class="text-sm font-medium text-foreground">Tamanho</Label>
            <span class="font-mono text-xs text-muted-foreground"
              >{logoSize[0]}px</span
            >
          </div>
          <Slider
            bind:value={logoSize}
            min={40}
            max={150}
            step={5}
            class="w-full"
          />
        </div>
      </div>

      <!-- Grid of Logos -->
      {#if loading}
        <div class="flex min-h-[400px] items-center justify-center">
          <p class="text-muted-foreground">Carregando logos...</p>
        </div>
      {:else if logoArray.length === 0}
        <div class="flex min-h-[400px] items-center justify-center">
          <p class="text-muted-foreground">Nenhum logo disponível</p>
        </div>
      {:else}
        <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {#each logoArray as [logoName, svgContent]}
            <div class="flex flex-col items-center gap-2">
              <!-- Canvas Container -->
              <div
                class="relative w-full overflow-hidden rounded-lg border border-border bg-background"
              >
                <canvas
                  bind:this={canvasRefs[logoName]}
                  class="h-auto w-full"
                  style="aspect-ratio: 1 / 1;"
                ></canvas>
              </div>

              <!-- Logo Name -->
              <TooltipProvider delayDuration={400}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    {#snippet child({ props })}
                      <p
                        {...props}
                        class="w-full truncate text-center text-xs font-medium text-muted-foreground"
                      >
                        {getBankDisplayName(logoName)}
                      </p>
                    {/snippet}
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>{getBankDisplayName(logoName)}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          {/each}
        </div>
      {/if}
    </CardContent>
  </Card>
</div>
