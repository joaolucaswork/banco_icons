<script>
import { Button } from "$lib/components/ui/button";
import * as Popover from "$lib/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "$lib/components/ui/tooltip";
import { Download, Palette } from "lucide-svelte";
import { getBankDisplayName } from "$lib/utils/svg-utils.js";
import {
  hasMultipleColors,
  getMultiColorConfig,
} from "$lib/utils/multi-color-utils.js";
import {
  getPrimaryOriginalColor,
  getSecondaryOriginalColor,
} from "$lib/utils/original-colors.js";
import {
  isDarkColor,
  getContrastBackground,
  getDottedPatternColor,
} from "$lib/utils/color-utils.js";
import { downloadSvgAsPng, downloadSvgAsFile } from "$lib/utils/svg-utils.js";
import { toast } from "svelte-sonner";
import { animate } from "motion";

let {
  logoName,
  svgContent,
  color = $bindable(),
  size,
  canvasRef = $bindable(),
} = $props();

// Hover state
let isHovered = $state(false);

// Popover state for download menu
let downloadPopoverOpen = $state(false);

// Popover state for color picker menu
let colorPickerPopoverOpen = $state(false);

// Toolbar and button refs for animations
let toolbarRef = $state();
let downloadButtonRef = $state();
let paletteButtonRef = $state();

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

// Function to render logo on canvas
async function renderLogoOnCanvas() {
  if (!canvasRef || !svgContent) return;

  const ctx = canvasRef.getContext("2d");
  if (!ctx) return;

  // Use high DPI canvas for crisp rendering
  const dpr = window.devicePixelRatio || 1;
  const canvasSize = 300;

  // Set actual canvas size (accounting for device pixel ratio)
  canvasRef.width = canvasSize * dpr;
  canvasRef.height = canvasSize * dpr;

  // Scale context to match device pixel ratio
  ctx.scale(dpr, dpr);

  // Clear canvas
  ctx.clearRect(0, 0, canvasSize, canvasSize);

  // Apply automatic contrast background based on logo color
  const backgroundColor = getContrastBackground(color);
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvasSize, canvasSize);

  // Draw dotted pattern with color based on background
  const dotColor = getDottedPatternColor(color);
  drawDottedPattern(ctx, canvasSize, canvasSize, dotColor);

  // Apply color to SVG
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgContent, "image/svg+xml");
  const svgElement = doc.querySelector("svg");

  if (!svgElement) return;

  // Use larger size for rendering to maintain quality
  const renderSize = size * 2;
  svgElement.setAttribute("width", renderSize.toString());
  svgElement.setAttribute("height", renderSize.toString());

  // Set color on the SVG element
  svgElement.style.color = color;

  // Apply colors for multi-color logos
  if (hasMultipleColors(logoName)) {
    const config = getMultiColorConfig(logoName);
    if (config) {
      if (isOriginalColorsMode) {
        // When original colors mode is active, apply both primary and secondary colors
        const primaryColor = getPrimaryOriginalColor(logoName);
        const secondaryColor = getSecondaryOriginalColor(logoName);

        config.elements.forEach((element) => {
          if (element.key === "bg" || element.key === "blue") {
            // Apply primary color to background/main element
            svgElement.style.setProperty(element.cssVar, primaryColor);
          } else if (element.key === "text" || element.key === "orange") {
            // Apply secondary color to text/secondary element
            if (secondaryColor) {
              svgElement.style.setProperty(element.cssVar, secondaryColor);
              // Also set auto contrast var to the original color (not auto-calculated)
              if (element.autoContrastVar) {
                svgElement.style.setProperty(
                  element.autoContrastVar,
                  secondaryColor,
                );
              }
            }
          }
        });
      } else {
        // Apply automatic contrast for single-color mode
        config.elements.forEach((element) => {
          if (element.autoContrastVar) {
            const textColor = isDarkColor(color) ? "#ffffff" : "#000000";
            svgElement.style.setProperty(element.autoContrastVar, textColor);
          }
        });
      }
    }
  }

  const modifiedSvg = new XMLSerializer().serializeToString(doc);

  // Create image from SVG
  const img = new Image();
  const blob = new Blob([modifiedSvg], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);

  img.onload = () => {
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    const x = (canvasSize - renderSize) / 2;
    const y = (canvasSize - renderSize) / 2;
    ctx.drawImage(img, x, y, renderSize, renderSize);
    URL.revokeObjectURL(url);
  };

  img.src = url;
}

// Render logo when color or size changes
$effect(() => {
  renderLogoOnCanvas();
});

// Animate toolbar on hover with Motion.dev
$effect(() => {
  if (toolbarRef) {
    if (isHovered) {
      console.log("Animating toolbar in for", logoName);
      // Animate toolbar sliding up from bottom (entrance)
      animate(
        toolbarRef,
        {
          y: [20, 0],
          opacity: [0, 1],
        },
        {
          duration: 0.3,
          ease: [0.25, 0.46, 0.45, 0.94],
        },
      );
    } else {
      console.log("Animating toolbar out for", logoName);
      // Animate toolbar sliding down and fading out (exit)
      animate(
        toolbarRef,
        {
          y: [0, 20],
          opacity: [1, 0],
        },
        {
          duration: 0.25,
          ease: [0.25, 0.46, 0.45, 0.94],
        },
      );
    }
  }
});

// Animate button separately when it becomes available
$effect(() => {
  if (downloadButtonRef) {
    if (isHovered) {
      console.log("Download button ref available for", logoName);

      // Small delay to let toolbar animation start first
      setTimeout(() => {
        console.log("Animating button in for", logoName);
        animate(
          downloadButtonRef,
          {
            opacity: [0, 1],
            y: [10, 0],
          },
          {
            duration: 0.25,
            ease: [0.25, 0.46, 0.45, 0.94],
          },
        );
      }, 100);
    } else {
      console.log("Animating button out for", logoName);
      // Animate button fading out (exit)
      animate(
        downloadButtonRef,
        {
          opacity: [1, 0],
          y: [0, 10],
        },
        {
          duration: 0.2,
          ease: [0.25, 0.46, 0.45, 0.94],
        },
      );
    }
  }
});

// Animate palette button with staggered delay
$effect(() => {
  if (paletteButtonRef) {
    if (isHovered) {
      // Staggered delay after download button (0.08s difference)
      setTimeout(() => {
        console.log("Animating palette button in for", logoName);
        animate(
          paletteButtonRef,
          {
            opacity: [0, 1],
            y: [10, 0],
          },
          {
            duration: 0.25,
            ease: [0.25, 0.46, 0.45, 0.94],
          },
        );
      }, 180); // 100ms + 80ms stagger
    } else {
      console.log("Animating palette button out for", logoName);
      // Animate button fading out (exit)
      animate(
        paletteButtonRef,
        {
          opacity: [1, 0],
          y: [0, 10],
        },
        {
          duration: 0.2,
          ease: [0.25, 0.46, 0.45, 0.94],
        },
      );
    }
  }
});

// Get available colors for this logo
function getAvailableColors() {
  const colors = [
    {
      name: "Preto",
      value: "#000000",
      isGradient: false,
      secondaryValue: null,
    },
    {
      name: "Branco",
      value: "#FFFFFF",
      isGradient: false,
      secondaryValue: null,
    },
  ];

  // Add primary original color
  const primaryColor = getPrimaryOriginalColor(logoName);
  const secondaryColor = getSecondaryOriginalColor(logoName);

  if (primaryColor) {
    // Check if logo has two colors - create gradient thumbnail
    if (secondaryColor) {
      colors.push({
        name: "Cores Originais",
        value: primaryColor,
        secondaryValue: secondaryColor,
        isGradient: true,
      });
    } else {
      colors.push({
        name: "Cor Original",
        value: primaryColor,
        isGradient: false,
        secondaryValue: null,
      });
    }
  }

  return colors;
}

// Track if original colors mode is active
let isOriginalColorsMode = $state(false);

// Handle color selection
function handleColorSelect(selectedColor, isOriginalMode = false) {
  color = selectedColor;
  isOriginalColorsMode = isOriginalMode;
  colorPickerPopoverOpen = false;
  const bankName = getBankDisplayName(logoName);
  toast.success(`Cor do ${bankName} alterada!`);
}

// Handle PNG download
async function handleDownloadPng() {
  if (!svgContent || !logoName) {
    return;
  }

  const filename = `${logoName}-${size}px`;
  const success = await downloadSvgAsPng(svgContent, filename, size * 2);

  if (success) {
    const bankName = getBankDisplayName(logoName);
    toast.success(`${bankName} baixado como PNG!`);
    downloadPopoverOpen = false;
  } else {
    toast.error("Falha ao baixar PNG. Tente novamente.");
  }
}

// Handle SVG download
async function handleDownloadSvg() {
  if (!svgContent || !logoName) {
    return;
  }

  const filename = `${logoName}-${size}px`;
  const success = downloadSvgAsFile(svgContent, filename);

  if (success) {
    const bankName = getBankDisplayName(logoName);
    toast.success(`${bankName} baixado como SVG!`);
    downloadPopoverOpen = false;
  } else {
    toast.error("Falha ao baixar SVG. Tente novamente.");
  }
}
</script>

<div
  role="group"
  aria-label={`Logo card for ${getBankDisplayName(logoName)}`}
  class="group relative flex flex-col items-center gap-2"
  onmouseenter={() => (isHovered = true)}
  onmouseleave={() => {
    // Keep toolbar visible when any popover is open
    if (!downloadPopoverOpen && !colorPickerPopoverOpen) {
      isHovered = false;
    }
  }}
>
  <!-- Canvas Container -->
  <div
    class="relative w-full overflow-hidden rounded-lg border border-border bg-background"
  >
    <canvas
      bind:this={canvasRef}
      class="h-auto w-full"
      style="aspect-ratio: 1 / 1;"
    ></canvas>

    <!-- Animated Toolbar - Only visible on hover -->
    {#if isHovered}
      <div
        bind:this={toolbarRef}
        class="absolute right-0 bottom-0 left-0 flex items-center justify-center gap-2 bg-gradient-to-t from-black/80 to-transparent p-3 pb-4"
        style="opacity: 0;"
      >
        <!-- Palette Button Wrapper for Animation -->
        <div bind:this={paletteButtonRef} style="opacity: 0;">
          <!-- Color Picker Button with Popover -->
          <Popover.Root bind:open={colorPickerPopoverOpen}>
            <Popover.Trigger asChild>
              {#snippet child({ props })}
                <Button
                  {...props}
                  variant="secondary"
                  size="icon"
                  class="h-9 w-9 bg-white/90 text-black hover:bg-white"
                >
                  <Palette class="h-4 w-4" />
                </Button>
              {/snippet}
            </Popover.Trigger>
            <Popover.Content
              align="center"
              side="top"
              sideOffset={8}
              class="w-fit border-border/50 bg-background/95 p-3 backdrop-blur-sm"
              portalProps={{}}
            >
              <div class="grid grid-cols-4 gap-4">
                <TooltipProvider delayDuration={400}>
                  {#each getAvailableColors() as colorOption}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        {#snippet child({ props })}
                          <button
                            {...props}
                            onclick={() => handleColorSelect(colorOption.value, colorOption.isGradient)}
                            class="group/color relative flex h-12 w-12 items-center justify-center rounded-lg border-2 transition-all hover:scale-110 hover:border-primary"
                            style={colorOption.isGradient && colorOption.secondaryValue
                                ? `background: linear-gradient(135deg, ${colorOption.value} 0%, ${colorOption.value} 35%, ${colorOption.secondaryValue} 65%, ${colorOption.secondaryValue} 100%) !important; border-color: white !important;`
                                : `background: ${colorOption.value} !important; border-color: white !important;`}
                            aria-label={`Selecionar cor ${colorOption.name}`}
                          >
                            <!-- Checkmark if current color -->
                            {#if color === colorOption.value}
                              <div
                                class="absolute inset-0 flex items-center justify-center text-xl font-bold drop-shadow-lg"
                                style="color: {isDarkColor(colorOption.value) ? '#ffffff' : '#000000'}; text-shadow: 0 0 3px {isDarkColor(colorOption.value) ? '#000000' : '#ffffff'};"
                              >
                                ✓
                              </div>
                            {/if}
                          </button>
                        {/snippet}
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p>{colorOption.name}</p>
                      </TooltipContent>
                    </Tooltip>
                  {/each}
                </TooltipProvider>
              </div>
            </Popover.Content>
          </Popover.Root>
        </div>

        <!-- Download Button Wrapper for Animation -->
        <div bind:this={downloadButtonRef} style="opacity: 0;">
          <!-- Download Button with Popover -->
          <Popover.Root bind:open={downloadPopoverOpen}>
            <Popover.Trigger asChild>
              {#snippet child({ props })}
                <Button
                  {...props}
                  variant="secondary"
                  size="icon"
                  class="h-9 w-9 bg-white/90 text-black hover:bg-white"
                >
                  <Download class="h-4 w-4" />
                </Button>
              {/snippet}
            </Popover.Trigger>
            <Popover.Content
              align="center"
              side="top"
              sideOffset={8}
              class="w-48 border-border/50 bg-background/95 p-3 backdrop-blur-sm"
              portalProps={{}}
            >
              <div class="flex flex-col gap-2">
                <p class="mb-2 text-sm font-medium text-foreground">
                  Formato de Download
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  class="w-full justify-start"
                  onclick={handleDownloadPng}
                >
                  PNG
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  class="w-full justify-start"
                  onclick={handleDownloadSvg}
                >
                  SVG
                </Button>
              </div>
            </Popover.Content>
          </Popover.Root>
        </div>
      </div>
    {/if}
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
