<script>
import { Button } from "$lib/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "$lib/components/ui/tooltip";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Copy,
  Download,
  Sun,
  Moon,
} from "lucide-svelte";
import CheckIcon from "@lucide/svelte/icons/check";
import { onMount } from "svelte";
import { loadOriginalSvgContent } from "$lib/utils/original-logos.js";
import CanvasContextMenu from "./CanvasContextMenu.svelte";
import { toast } from "svelte-sonner";
import {
  downloadSvgAsPng,
  downloadSvgAsFile,
  copyToClipboard,
  getBankDisplayName,
} from "$lib/utils/svg-utils.js";
import { isDarkColor } from "$lib/utils/color-utils.js";

let {
  svgContent = null,
  originalSvgContent = null,
  previewBackground = "#ffffff",
  dotColor = "#000000",
  originalPreviewBackground = "transparent", // Independent background for original canvas
  originalDotColor = "#666666", // Independent dot color for original canvas
  loading = false,
  error = null,
  exportSize = 24,
  exportColor = "#ffffff",
  showComparison = false,
  selectedLogo = null,
  formattedSvg = null,
  onReset = () => {},
  // Background toggle support
  onBackgroundToggle = () => {},
  isManualBackgroundActive = false,
  currentBackgroundColor = null,
  class: className = "",
  ...restProps
} = $props();

// Calculate icon color based on background for contrast
let iconColor = $derived.by(() => {
  // Get the current background color - use manual override if active, otherwise automatic
  let bgColor;

  if (isManualBackgroundActive && currentBackgroundColor !== null) {
    bgColor = currentBackgroundColor;
  } else {
    bgColor = previewBackground;
  }

  // If background is transparent, use light color for dark theme
  if (bgColor === "transparent") {
    return "text-foreground"; // Use theme foreground color for transparent backgrounds
  }

  // For solid backgrounds, use contrast logic
  if (isDarkColor(bgColor)) {
    return "text-white"; // White text on dark backgrounds
  } else {
    return "text-black"; // Black text on light backgrounds
  }
});

// Canvas state for modified logo (left side)
let canvasContainer = $state(/** @type {HTMLDivElement | null} */ (null));
let canvas = $state(/** @type {HTMLCanvasElement | null} */ (null));
let ctx = $state(/** @type {CanvasRenderingContext2D | null} */ (null));
let svgImage = $state(/** @type {HTMLImageElement | null} */ (null));

// Canvas state for original logo (right side)
let originalCanvasContainer = $state(
  /** @type {HTMLDivElement | null} */ (null),
);
let originalCanvas = $state(/** @type {HTMLCanvasElement | null} */ (null));
let originalCtx = $state(/** @type {CanvasRenderingContext2D | null} */ (null));
let originalSvgImage = $state(/** @type {HTMLImageElement | null} */ (null));

// Transform state for modified logo (left side)
let scale = $state(Math.pow(1.2, 4)); // Start with 4x zoom (1.2^4 ≈ 2.07)
let translateX = $state(0);
let translateY = $state(0);
let isDragging = $state(false);
let lastMouseX = $state(0);
let lastMouseY = $state(0);

// Transform state for original logo (right side)
let originalScale = $state(Math.pow(1.2, 4));
let originalTranslateX = $state(0);
let originalTranslateY = $state(0);
let originalIsDragging = $state(false);
let originalLastMouseX = $state(0);
let originalLastMouseY = $state(0);

// Canvas dimensions
let canvasWidth = $state(400);
let canvasHeight = $state(200);
let originalCanvasWidth = $state(400);
let originalCanvasHeight = $state(200);

// Zoom configuration
const MIN_SCALE = 0.1;
const MAX_SCALE = 10;
const ZOOM_FACTOR = 1.2;

onMount(() => {
  if (canvas) {
    ctx = canvas.getContext("2d");
  }
  if (originalCanvas) {
    originalCtx = originalCanvas.getContext("2d");
  }

  updateCanvasSize();
  window.addEventListener("resize", updateCanvasSize);

  return () => {
    window.removeEventListener("resize", updateCanvasSize);
  };
});

// Ensure original canvas context is initialized when comparison mode is enabled
$effect(() => {
  if (showComparison && originalCanvas && !originalCtx) {
    originalCtx = originalCanvas.getContext("2d");
    if (originalCtx) {
      originalCtx.scale(window.devicePixelRatio, window.devicePixelRatio);
      // Force a redraw to show the background and dots
      drawOriginal();
    }
  }
});

function updateCanvasSize() {
  // Update modified logo canvas (left side)
  if (canvasContainer && canvas) {
    const rect = canvasContainer.getBoundingClientRect();
    const containerWidth = showComparison ? rect.width / 2 - 5 : rect.width; // Split width if comparison mode
    canvasWidth = containerWidth;
    canvasHeight = Math.max(200, Math.min(300, rect.height));

    canvas.width = canvasWidth * window.devicePixelRatio;
    canvas.height = canvasHeight * window.devicePixelRatio;
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;

    // Re-get the context and apply scaling fresh to avoid accumulation
    if (canvas) {
      ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      }
    }
  }

  // Update original logo canvas (right side)
  if (showComparison && originalCanvasContainer && originalCanvas) {
    const rect = originalCanvasContainer.getBoundingClientRect();
    const containerWidth = rect.width; // Use full width of the right container
    originalCanvasWidth = containerWidth;
    originalCanvasHeight = Math.max(200, Math.min(300, rect.height));

    originalCanvas.width = originalCanvasWidth * window.devicePixelRatio;
    originalCanvas.height = originalCanvasHeight * window.devicePixelRatio;
    originalCanvas.style.width = `${originalCanvasWidth}px`;
    originalCanvas.style.height = `${originalCanvasHeight}px`;

    // Re-get the context and apply scaling fresh to avoid accumulation
    if (originalCanvas) {
      originalCtx = originalCanvas.getContext("2d");
      if (originalCtx) {
        originalCtx.scale(window.devicePixelRatio, window.devicePixelRatio);
      }
    }
  }

  draw();
  drawOriginal();
}

function loadSvgImage(/** @type {string | null} */ svgString) {
  if (!svgString) {
    svgImage = null;
    draw();
    return;
  }

  const img = new Image();
  const svgBlob = new Blob([svgString], {
    type: "image/svg+xml;charset=utf-8",
  });
  const url = URL.createObjectURL(svgBlob);

  img.onload = () => {
    svgImage = img;
    URL.revokeObjectURL(url);
    draw();
  };

  img.onerror = () => {
    svgImage = null;
    URL.revokeObjectURL(url);
    draw();
  };

  img.src = url;
}

function loadOriginalSvgImage(/** @type {string | null} */ svgString) {
  if (!svgString) {
    originalSvgImage = null;
    drawOriginal();
    return;
  }

  const img = new Image();
  const svgBlob = new Blob([svgString], {
    type: "image/svg+xml;charset=utf-8",
  });
  const url = URL.createObjectURL(svgBlob);

  img.onload = () => {
    originalSvgImage = img;
    URL.revokeObjectURL(url);
    drawOriginal();
  };

  img.onerror = () => {
    originalSvgImage = null;
    URL.revokeObjectURL(url);
    drawOriginal();
  };

  img.src = url;
}

function draw() {
  if (!ctx || !canvas) return;

  // Clear canvas
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  // Draw background
  ctx.fillStyle = previewBackground;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Draw dotted pattern
  drawDottedPattern(ctx, canvasWidth, canvasHeight);

  // Draw modified logo
  drawSingleLogo();
}

function drawOriginal() {
  if (!showComparison || !originalCtx || !originalCanvas) {
    return;
  }

  // Clear canvas
  originalCtx.clearRect(0, 0, originalCanvasWidth, originalCanvasHeight);

  // Draw background - use independent background for original canvas
  if (originalPreviewBackground !== "transparent") {
    originalCtx.fillStyle = originalPreviewBackground;
    originalCtx.fillRect(0, 0, originalCanvasWidth, originalCanvasHeight);
  }

  // Draw dotted pattern with independent dot color
  drawDottedPatternOriginal(
    originalCtx,
    originalCanvasWidth,
    originalCanvasHeight,
  );

  // Only draw the SVG if it exists
  if (originalSvgImage) {
    // Save context for transforms
    originalCtx.save();

    // Apply transforms for original canvas
    originalCtx.translate(
      originalCanvasWidth / 2 + originalTranslateX,
      originalCanvasHeight / 2 + originalTranslateY,
    );
    originalCtx.scale(originalScale, originalScale);

    // Draw original SVG logo without glow effect

    const imgWidth = 120; // Fixed size for consistency
    const imgHeight = 120;
    originalCtx.drawImage(
      originalSvgImage,
      -imgWidth / 2,
      -imgHeight / 2,
      imgWidth,
      imgHeight,
    );

    // Restore context
    originalCtx.restore();
  }
}

function drawSingleLogo() {
  if (!ctx || !svgImage) return;

  // Save context for transforms
  ctx.save();

  // Apply transforms
  ctx.translate(canvasWidth / 2 + translateX, canvasHeight / 2 + translateY);
  ctx.scale(scale, scale);

  // Draw SVG logo without glow effect

  const imgWidth = 120; // Fixed size for consistency
  const imgHeight = 120;
  ctx.drawImage(svgImage, -imgWidth / 2, -imgHeight / 2, imgWidth, imgHeight);

  // Restore context
  ctx.restore();
}

function drawDottedPattern(context, width, height) {
  if (!context) return;

  const dotSize = 1;
  const spacing = 16;
  const opacity = 0.3;

  context.fillStyle = dotColor;
  context.globalAlpha = opacity;

  for (let x = 0; x < width; x += spacing) {
    for (let y = 0; y < height; y += spacing) {
      context.beginPath();
      context.arc(x, y, dotSize, 0, Math.PI * 2);
      context.fill();

      // Offset pattern
      context.beginPath();
      context.arc(x + spacing / 2, y + spacing / 2, dotSize, 0, Math.PI * 2);
      context.fill();
    }
  }

  context.globalAlpha = 1;
}

function drawDottedPatternOriginal(context, width, height) {
  if (!context) return;

  const dotSize = 1;
  const spacing = 16;
  const opacity = 0.3;

  context.fillStyle = originalDotColor;
  context.globalAlpha = opacity;

  for (let x = 0; x < width; x += spacing) {
    for (let y = 0; y < height; y += spacing) {
      context.beginPath();
      context.arc(x, y, dotSize, 0, Math.PI * 2);
      context.fill();

      // Offset pattern
      context.beginPath();
      context.arc(x + spacing / 2, y + spacing / 2, dotSize, 0, Math.PI * 2);
      context.fill();
    }
  }

  context.globalAlpha = 1;
}

// Zoom functions for modified logo (left canvas)
function zoomIn() {
  const newScale = Math.min(scale * ZOOM_FACTOR, MAX_SCALE);
  scale = newScale;
  draw();
  if (showComparison) drawOriginal();
}

function zoomOut() {
  const newScale = Math.max(scale / ZOOM_FACTOR, MIN_SCALE);
  scale = newScale;
  draw();
  if (showComparison) drawOriginal();
}

function resetView() {
  scale = Math.pow(1.2, 4); // Reset to 4x zoom (1.2^4 ≈ 2.07)
  translateX = 0;
  translateY = 0;
  draw();
  if (showComparison) drawOriginal();
}

// Zoom functions for original logo (right canvas)
function originalZoomIn() {
  const newScale = Math.min(originalScale * ZOOM_FACTOR, MAX_SCALE);
  originalScale = newScale;
  drawOriginal();
  draw(); // Also redraw left canvas to maintain consistency
}

function originalZoomOut() {
  const newScale = Math.max(originalScale / ZOOM_FACTOR, MIN_SCALE);
  originalScale = newScale;
  drawOriginal();
  draw(); // Also redraw left canvas to maintain consistency
}

function originalResetView() {
  originalScale = Math.pow(1.2, 4); // Reset to 4x zoom (1.2^4 ≈ 2.07)
  originalTranslateX = 0;
  originalTranslateY = 0;
  drawOriginal();
  draw(); // Also redraw left canvas to maintain consistency
}

// Copy and download handlers for modified logo (left canvas)
async function handleCopySvg() {
  if (!formattedSvg || !selectedLogo) {
    toast.error("Nenhum logo selecionado para copiar.");
    return;
  }

  const bankName = getBankDisplayName(selectedLogo);
  const success = await copyToClipboard(formattedSvg);

  if (success) {
    toast.success(`Código SVG do ${bankName} copiado!`);
  } else {
    toast.error("Falha ao copiar código SVG. Tente novamente.");
  }
}

async function handleDownloadSvg() {
  if (!formattedSvg || !selectedLogo) {
    toast.error("Nenhum logo selecionado para download.");
    return;
  }

  const filename = `${selectedLogo}-${exportSize}px`;
  const success = downloadSvgAsFile(formattedSvg, filename);

  if (success) {
    const bankName = getBankDisplayName(selectedLogo);
    toast.success(`${bankName} baixado como SVG!`);
  } else {
    toast.error("Falha ao baixar SVG. Tente novamente.");
  }
}

async function handleDownloadPng() {
  if (!svgContent || !selectedLogo) {
    toast.error("Nenhum logo selecionado para download.");
    return;
  }

  const filename = `${selectedLogo}-${exportSize}px`;
  const success = await downloadSvgAsPng(svgContent, filename, exportSize);

  if (success) {
    const bankName = getBankDisplayName(selectedLogo);
    toast.success(`${bankName} baixado como PNG!`);
  } else {
    toast.error("Falha ao baixar PNG. Tente novamente.");
  }
}

// Copy and download handlers for original logo (right canvas)
async function handleOriginalCopySvg() {
  if (!originalSvgContent || !selectedLogo) {
    toast.error("Nenhum logo original disponível para copiar.");
    return;
  }

  const bankName = getBankDisplayName(selectedLogo);
  const success = await copyToClipboard(originalSvgContent);

  if (success) {
    toast.success(`Código SVG original do ${bankName} copiado!`);
  } else {
    toast.error("Falha ao copiar código SVG original. Tente novamente.");
  }
}

async function handleOriginalDownloadSvg() {
  if (!originalSvgContent || !selectedLogo) {
    toast.error("Nenhum logo original disponível para download.");
    return;
  }

  const filename = `${selectedLogo}-original-${exportSize}px`;
  const success = downloadSvgAsFile(originalSvgContent, filename);

  if (success) {
    const bankName = getBankDisplayName(selectedLogo);
    toast.success(`${bankName} original baixado como SVG!`);
  } else {
    toast.error("Falha ao baixar SVG original. Tente novamente.");
  }
}

async function handleOriginalDownloadPng() {
  if (!originalSvgContent || !selectedLogo) {
    toast.error("Nenhum logo original disponível para download.");
    return;
  }

  const filename = `${selectedLogo}-original-${exportSize}px`;
  const success = await downloadSvgAsPng(
    originalSvgContent,
    filename,
    exportSize,
  );

  if (success) {
    const bankName = getBankDisplayName(selectedLogo);
    toast.success(`${bankName} original baixado como PNG!`);
  } else {
    toast.error("Falha ao baixar PNG original. Tente novamente.");
  }
}

// Mouse event handlers
function handleMouseDown(/** @type {MouseEvent} */ event) {
  if (!canvas) return;
  isDragging = true;
  lastMouseX = event.clientX;
  lastMouseY = event.clientY;
  canvas.style.cursor = "grabbing";
  event.preventDefault();
}

function handleMouseMove(/** @type {MouseEvent} */ event) {
  if (!isDragging || !canvas) return;

  const deltaX = event.clientX - lastMouseX;
  const deltaY = event.clientY - lastMouseY;

  translateX += deltaX;
  translateY += deltaY;

  lastMouseX = event.clientX;
  lastMouseY = event.clientY;

  draw();
  if (showComparison) drawOriginal();
}

function handleMouseUp() {
  if (!canvas) return;
  isDragging = false;
  canvas.style.cursor = "grab";
}

// Touch event handlers for mobile support
function handleTouchStart(/** @type {TouchEvent} */ event) {
  if (!canvas || event.touches.length !== 1) return;
  const touch = event.touches[0];
  isDragging = true;
  lastMouseX = touch.clientX;
  lastMouseY = touch.clientY;
  event.preventDefault();
}

function handleTouchMove(/** @type {TouchEvent} */ event) {
  if (!isDragging || !canvas || event.touches.length !== 1) return;
  const touch = event.touches[0];

  const deltaX = touch.clientX - lastMouseX;
  const deltaY = touch.clientY - lastMouseY;

  translateX += deltaX;
  translateY += deltaY;

  lastMouseX = touch.clientX;
  lastMouseY = touch.clientY;

  draw();
  if (showComparison) drawOriginal();
  event.preventDefault();
}

function handleTouchEnd() {
  isDragging = false;
}

function handleWheel(/** @type {WheelEvent} */ event) {
  if (!canvas) return;
  event.preventDefault();

  const rect = canvas.getBoundingClientRect();
  const mouseX = event.clientX - rect.left - canvasWidth / 2;
  const mouseY = event.clientY - rect.top - canvasHeight / 2;

  const wheel = event.deltaY < 0 ? 1 : -1;
  const zoom = Math.exp(wheel * 0.1);
  const newScale = Math.min(Math.max(scale * zoom, MIN_SCALE), MAX_SCALE);

  if (newScale !== scale) {
    const factor = newScale / scale - 1;
    translateX -= (mouseX - translateX) * factor;
    translateY -= (mouseY - translateY) * factor;
    scale = newScale;
    draw();
    if (showComparison) drawOriginal();
  }
}

// Original canvas event handlers
function handleOriginalMouseDown(/** @type {MouseEvent} */ event) {
  if (!originalCanvas) return;
  originalIsDragging = true;
  originalLastMouseX = event.clientX;
  originalLastMouseY = event.clientY;
  originalCanvas.style.cursor = "grabbing";
  event.preventDefault();
}

function handleOriginalMouseMove(/** @type {MouseEvent} */ event) {
  if (!originalIsDragging || !originalCanvas) return;

  const deltaX = event.clientX - originalLastMouseX;
  const deltaY = event.clientY - originalLastMouseY;

  originalTranslateX += deltaX;
  originalTranslateY += deltaY;

  originalLastMouseX = event.clientX;
  originalLastMouseY = event.clientY;

  drawOriginal();
  draw(); // Also redraw left canvas to maintain consistency
}

function handleOriginalMouseUp() {
  if (!originalCanvas) return;
  originalIsDragging = false;
  originalCanvas.style.cursor = "grab";
}

function handleOriginalWheel(/** @type {WheelEvent} */ event) {
  if (!originalCanvas) return;
  event.preventDefault();

  const rect = originalCanvas.getBoundingClientRect();
  const mouseX = event.clientX - rect.left - originalCanvasWidth / 2;
  const mouseY = event.clientY - rect.top - originalCanvasHeight / 2;

  const wheel = event.deltaY < 0 ? 1 : -1;
  const zoom = Math.exp(wheel * 0.1);
  const newScale = Math.min(
    Math.max(originalScale * zoom, MIN_SCALE),
    MAX_SCALE,
  );

  if (newScale !== originalScale) {
    const factor = newScale / originalScale - 1;
    originalTranslateX -= (mouseX - originalTranslateX) * factor;
    originalTranslateY -= (mouseY - originalTranslateY) * factor;
    originalScale = newScale;
    drawOriginal();
    draw(); // Also redraw left canvas to maintain consistency
  }
}

// Reactive updates
$effect(() => {
  if (svgContent) {
    loadSvgImage(svgContent);
  } else {
    svgImage = null;
    draw();
  }
});

// Note: originalSvgContent prop is not used - we load original content internally

// Load original SVG when selectedLogo changes and comparison is enabled
$effect(() => {
  if (showComparison && selectedLogo) {
    loadOriginalSvgContent(selectedLogo)
      .then((originalContent) => {
        if (originalContent) {
          loadOriginalSvgImage(originalContent);
        }
      })
      .catch((error) => {
        // Failed to load original logo
      });
  }
});

$effect(() => {
  updateCanvasSize();
});

$effect(() => {
  draw();
  if (showComparison) {
    drawOriginal(); // Only redraw original canvas when in comparison mode
  }
});

// Handle showComparison changes to ensure proper canvas rendering
$effect(() => {
  if (showComparison !== undefined) {
    // Small delay to ensure DOM has updated
    setTimeout(() => {
      updateCanvasSize();
      // Force redraw of both canvases
      draw();
      drawOriginal();
    }, 0);
  }
});

// Specific effect to handle comparison mode activation
$effect(() => {
  if (showComparison) {
    // Ensure original canvas is properly initialized and drawn
    setTimeout(() => {
      if (originalCanvas && !originalCtx) {
        originalCtx = originalCanvas.getContext("2d");
        if (originalCtx) {
          originalCtx.scale(window.devicePixelRatio, window.devicePixelRatio);
        }
      }
      drawOriginal();
    }, 10);
  }
});
</script>

<div
  bind:this={canvasContainer}
  class="relative flex min-h-[180px] items-center justify-center rounded-lg border border-border transition-colors duration-200 lg:min-h-[200px] {className}"
  {...restProps}
>
  {#if showComparison}
    <!-- Comparison Mode: Two Canvas Side by Side -->
    <div class="flex h-full w-full">
      <!-- Modified Logo Canvas (Left) -->
      <div
        class="relative flex flex-1 items-center justify-center border-r border-border/50"
      >
        <CanvasContextMenu
          svgContent={svgContent}
          selectedLogo={selectedLogo}
          exportSize={exportSize}
          exportColor={exportColor}
          formattedSvg={formattedSvg}
          onReset={onReset}
        >
          <canvas
            bind:this={canvas}
            class="cursor-grab touch-none rounded-l-lg"
            onmousedown={handleMouseDown}
            onmousemove={handleMouseMove}
            onmouseup={handleMouseUp}
            onmouseleave={handleMouseUp}
            onwheel={handleWheel}
            ontouchstart={handleTouchStart}
            ontouchmove={handleTouchMove}
            ontouchend={handleTouchEnd}
            ontouchcancel={handleTouchEnd}
          ></canvas>
        </CanvasContextMenu>

        <!-- Left Top Controls - Copy and Download -->
        <div class="absolute top-3 left-3 z-10 flex flex-col gap-3">
          <Button
            variant="secondary"
            size="icon"
            class="h-10 w-10 border border-border/20 bg-white text-black hover:bg-white/90"
            onclick={handleCopySvg}
            disabled={!formattedSvg || !selectedLogo}
            title="Copiar SVG"
          >
            <Copy class="h-5 w-5" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            class="h-10 w-10 border border-border/20 bg-white text-black hover:bg-white/90"
            onclick={handleDownloadSvg}
            disabled={!formattedSvg || !selectedLogo}
            title="Baixar SVG"
          >
            <Download class="h-5 w-5" />
          </Button>
        </div>

        <!-- Left Bottom Controls - Zoom -->
        <TooltipProvider delayDuration={400}>
          <div class="absolute bottom-12 left-3 z-10 flex flex-col gap-1">
            <!-- Zoom In Button -->
            <Tooltip
              disableHoverableContent={false}
              disableCloseOnTriggerClick={true}
            >
              <TooltipTrigger asChild>
                {#snippet child({ props })}
                  <Button
                    {...props}
                    variant="secondary"
                    size="icon"
                    class="h-8 w-8 bg-background/80 backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:bg-background/90 active:scale-95"
                    onclick={zoomIn}
                    disabled={scale >= MAX_SCALE}
                  >
                    <ZoomIn class="h-4 w-4" />
                  </Button>
                {/snippet}
              </TooltipTrigger>
              <TooltipContent
                side="right"
                align="center"
                sideOffset={8}
                class=""
                arrowClasses=""
              >
                <p class="text-sm">Aumentar zoom</p>
              </TooltipContent>
            </Tooltip>

            <!-- Zoom Out Button -->
            <Tooltip
              disableHoverableContent={false}
              disableCloseOnTriggerClick={true}
            >
              <TooltipTrigger asChild>
                {#snippet child({ props })}
                  <Button
                    {...props}
                    variant="secondary"
                    size="icon"
                    class="h-8 w-8 bg-background/80 backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:bg-background/90 active:scale-95"
                    onclick={zoomOut}
                    disabled={scale <= MIN_SCALE}
                  >
                    <ZoomOut class="h-4 w-4" />
                  </Button>
                {/snippet}
              </TooltipTrigger>
              <TooltipContent
                side="right"
                align="center"
                sideOffset={8}
                class=""
                arrowClasses=""
              >
                <p class="text-sm">Diminuir zoom</p>
              </TooltipContent>
            </Tooltip>
            <!-- Reset View Button -->
            <Tooltip
              disableHoverableContent={false}
              disableCloseOnTriggerClick={true}
            >
              <TooltipTrigger asChild>
                {#snippet child({ props })}
                  <Button
                    {...props}
                    variant="secondary"
                    size="icon"
                    class="group h-8 w-8 bg-background/80 backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:bg-background/90 active:scale-95"
                    onclick={resetView}
                    disabled={false}
                  >
                    <RotateCcw
                      class="h-4 w-4 transition-transform duration-200 group-hover:rotate-180"
                    />
                  </Button>
                {/snippet}
              </TooltipTrigger>
              <TooltipContent
                side="right"
                align="center"
                sideOffset={8}
                class=""
                arrowClasses=""
              >
                <p class="text-sm">Resetar visualização</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>

        <!-- Left Label -->
        <div class="absolute bottom-3 left-1/2 z-10 -translate-x-1/2 transform">
          <div
            class="rounded bg-background/80 px-2 py-1 text-xs font-medium text-foreground backdrop-blur-sm"
          >
            Modificado
          </div>
        </div>
      </div>

      <!-- Original Logo Canvas (Right) -->
      <div
        bind:this={originalCanvasContainer}
        class="relative flex flex-1 items-center justify-center"
      >
        <canvas
          bind:this={originalCanvas}
          class="cursor-grab touch-none rounded-r-lg"
          onmousedown={handleOriginalMouseDown}
          onmousemove={handleOriginalMouseMove}
          onmouseup={handleOriginalMouseUp}
          onmouseleave={handleOriginalMouseUp}
          onwheel={handleOriginalWheel}
        ></canvas>

        <!-- Right Top Controls - Copy and Download -->
        <TooltipProvider delayDuration={400}>
          <div class="absolute top-3 left-3 z-10 flex flex-col gap-3">
            <!-- Copy Original Button -->
            <Tooltip
              disableHoverableContent={false}
              disableCloseOnTriggerClick={true}
            >
              <TooltipTrigger asChild>
                {#snippet child({ props })}
                  <Button
                    {...props}
                    variant="secondary"
                    size="icon"
                    class="h-10 w-10 border border-border/20 bg-white text-black transition-all duration-200 hover:scale-105 hover:bg-white/90 active:scale-95"
                    onclick={handleOriginalCopySvg}
                    disabled={!originalSvgContent || !selectedLogo}
                  >
                    <Copy class="h-5 w-5" />
                  </Button>
                {/snippet}
              </TooltipTrigger>
              <TooltipContent
                side="right"
                align="center"
                sideOffset={8}
                class=""
                arrowClasses=""
              >
                <p class="text-sm">Copiar SVG Original</p>
              </TooltipContent>
            </Tooltip>

            <!-- Download Original Button -->
            <Tooltip
              disableHoverableContent={false}
              disableCloseOnTriggerClick={true}
            >
              <TooltipTrigger asChild>
                {#snippet child({ props })}
                  <Button
                    {...props}
                    variant="secondary"
                    size="icon"
                    class="h-10 w-10 border border-border/20 bg-white text-black transition-all duration-200 hover:scale-105 hover:bg-white/90 active:scale-95"
                    onclick={handleOriginalDownloadSvg}
                    disabled={!originalSvgContent || !selectedLogo}
                  >
                    <Download class="h-5 w-5" />
                  </Button>
                {/snippet}
              </TooltipTrigger>
              <TooltipContent
                side="right"
                align="center"
                sideOffset={8}
                class=""
                arrowClasses=""
              >
                <p class="text-sm">Baixar SVG Original</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>

        <!-- Right Bottom Controls - Zoom -->
        <TooltipProvider delayDuration={400}>
          <div class="absolute bottom-12 left-3 z-10 flex flex-col gap-1">
            <!-- Zoom In Button -->
            <Tooltip
              disableHoverableContent={false}
              disableCloseOnTriggerClick={true}
            >
              <TooltipTrigger asChild>
                {#snippet child({ props })}
                  <Button
                    {...props}
                    variant="secondary"
                    size="icon"
                    class="h-8 w-8 bg-background/80 backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:bg-background/90 active:scale-95"
                    onclick={originalZoomIn}
                    disabled={originalScale >= MAX_SCALE}
                  >
                    <ZoomIn class="h-4 w-4" />
                  </Button>
                {/snippet}
              </TooltipTrigger>
              <TooltipContent
                side="right"
                align="center"
                sideOffset={8}
                class=""
                arrowClasses=""
              >
                <p class="text-sm">Aumentar zoom</p>
              </TooltipContent>
            </Tooltip>

            <!-- Zoom Out Button -->
            <Tooltip
              disableHoverableContent={false}
              disableCloseOnTriggerClick={true}
            >
              <TooltipTrigger asChild>
                {#snippet child({ props })}
                  <Button
                    {...props}
                    variant="secondary"
                    size="icon"
                    class="h-8 w-8 bg-background/80 backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:bg-background/90 active:scale-95"
                    onclick={originalZoomOut}
                    disabled={originalScale <= MIN_SCALE}
                  >
                    <ZoomOut class="h-4 w-4" />
                  </Button>
                {/snippet}
              </TooltipTrigger>
              <TooltipContent
                side="right"
                align="center"
                sideOffset={8}
                class=""
                arrowClasses=""
              >
                <p class="text-sm">Diminuir zoom</p>
              </TooltipContent>
            </Tooltip>
            <!-- Reset View Button -->
            <Tooltip
              disableHoverableContent={false}
              disableCloseOnTriggerClick={true}
            >
              <TooltipTrigger asChild>
                {#snippet child({ props })}
                  <Button
                    {...props}
                    variant="secondary"
                    size="icon"
                    class="group h-8 w-8 bg-background/80 backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:bg-background/90 active:scale-95"
                    onclick={originalResetView}
                    disabled={false}
                  >
                    <RotateCcw
                      class="h-4 w-4 transition-transform duration-200 group-hover:rotate-180"
                    />
                  </Button>
                {/snippet}
              </TooltipTrigger>
              <TooltipContent
                side="right"
                align="center"
                sideOffset={8}
                class=""
                arrowClasses=""
              >
                <p class="text-sm">Resetar visualização</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>

        <!-- Green Checkmark Icon - Top Right -->
        <div class="absolute top-3 right-3 z-30">
          <div
            class="cursor-pointer rounded-full p-1 transition-all duration-200 hover:scale-110 hover:bg-green-500/20"
          >
            <CheckIcon class="h-5 w-5 text-green-600 drop-shadow-sm" />
          </div>
        </div>

        <!-- Right Label -->
        <div class="absolute bottom-3 left-1/2 z-10 -translate-x-1/2 transform">
          <div
            class="rounded bg-background/80 px-2 py-1 text-xs font-medium text-foreground backdrop-blur-sm"
          >
            Original
          </div>
        </div>
      </div>
    </div>
  {:else}
    <!-- Single Canvas Mode -->
    <CanvasContextMenu
      svgContent={svgContent}
      selectedLogo={selectedLogo}
      exportSize={exportSize}
      exportColor={exportColor}
      formattedSvg={formattedSvg}
      onReset={onReset}
    >
      <canvas
        bind:this={canvas}
        class="cursor-grab touch-none rounded-lg"
        onmousedown={handleMouseDown}
        onmousemove={handleMouseMove}
        onmouseup={handleMouseUp}
        onmouseleave={handleMouseUp}
        onwheel={handleWheel}
        ontouchstart={handleTouchStart}
        ontouchmove={handleTouchMove}
        ontouchend={handleTouchEnd}
        ontouchcancel={handleTouchEnd}
      ></canvas>
    </CanvasContextMenu>
  {/if}

  <!-- Controls overlay (only in single canvas mode) -->
  {#if !showComparison}
    <TooltipProvider delayDuration={400}>
      <!-- Top Controls - Copy and Download -->
      <div class="absolute top-3 left-3 z-10 flex flex-col gap-3">
        <!-- Copy Button -->
        <Tooltip
          disableHoverableContent={false}
          disableCloseOnTriggerClick={true}
        >
          <TooltipTrigger asChild>
            {#snippet child({ props })}
              <Button
                {...props}
                variant="secondary"
                size="icon"
                class="h-10 w-10 border border-border/20 bg-white text-black transition-all duration-200 hover:scale-105 hover:bg-white/90 active:scale-95"
                onclick={handleCopySvg}
                disabled={!formattedSvg || !selectedLogo}
              >
                <Copy class="h-5 w-5" style="color: #000000 !important;" />
              </Button>
            {/snippet}
          </TooltipTrigger>
          <TooltipContent
            side="right"
            align="center"
            sideOffset={8}
            class=""
            arrowClasses=""
          >
            <p class="text-sm">Copiar SVG</p>
          </TooltipContent>
        </Tooltip>

        <!-- Download Button -->
        <Tooltip
          disableHoverableContent={false}
          disableCloseOnTriggerClick={true}
        >
          <TooltipTrigger asChild>
            {#snippet child({ props })}
              <Button
                {...props}
                variant="secondary"
                size="icon"
                class="h-10 w-10 border border-border/20 bg-white text-black transition-all duration-200 hover:scale-105 hover:bg-white/90 active:scale-95"
                onclick={handleDownloadSvg}
                disabled={!formattedSvg || !selectedLogo}
              >
                <Download class="h-5 w-5" style="color: #000000 !important;" />
              </Button>
            {/snippet}
          </TooltipTrigger>
          <TooltipContent
            side="right"
            align="center"
            sideOffset={8}
            class=""
            arrowClasses=""
          >
            <p class="text-sm">Baixar SVG</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <!-- Bottom Controls - Zoom -->
      <div class="absolute bottom-3 left-3 z-10 flex flex-col gap-1">
        <!-- Zoom In Button -->
        <Tooltip
          disableHoverableContent={false}
          disableCloseOnTriggerClick={true}
        >
          <TooltipTrigger asChild>
            {#snippet child({ props })}
              <Button
                {...props}
                variant="secondary"
                size="icon"
                class="h-8 w-8 bg-background/80 backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:bg-background/90 active:scale-95"
                onclick={zoomIn}
                disabled={scale >= MAX_SCALE}
              >
                <ZoomIn
                  class="h-4 w-4"
                  style="color: {iconColor === 'text-black' ? '#000000' : iconColor === 'text-white' ? '#ffffff' : 'hsl(var(--foreground))'} !important;"
                />
              </Button>
            {/snippet}
          </TooltipTrigger>
          <TooltipContent
            side="right"
            align="center"
            sideOffset={8}
            class=""
            arrowClasses=""
          >
            <p class="text-sm">Aumentar zoom</p>
          </TooltipContent>
        </Tooltip>

        <!-- Zoom Out Button -->
        <Tooltip
          disableHoverableContent={false}
          disableCloseOnTriggerClick={true}
        >
          <TooltipTrigger asChild>
            {#snippet child({ props })}
              <Button
                {...props}
                variant="secondary"
                size="icon"
                class="h-8 w-8 bg-background/80 backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:bg-background/90 active:scale-95"
                onclick={zoomOut}
                disabled={scale <= MIN_SCALE}
              >
                <ZoomOut
                  class="h-4 w-4"
                  style="color: {iconColor === 'text-black' ? '#000000' : iconColor === 'text-white' ? '#ffffff' : 'hsl(var(--foreground))'} !important;"
                />
              </Button>
            {/snippet}
          </TooltipTrigger>
          <TooltipContent
            side="right"
            align="center"
            sideOffset={8}
            class=""
            arrowClasses=""
          >
            <p class="text-sm">Diminuir zoom</p>
          </TooltipContent>
        </Tooltip>

        <!-- Reset View Button -->
        <Tooltip
          disableHoverableContent={false}
          disableCloseOnTriggerClick={true}
        >
          <TooltipTrigger asChild>
            {#snippet child({ props })}
              <Button
                {...props}
                variant="secondary"
                size="icon"
                class="group h-8 w-8 bg-background/80 backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:bg-background/90 active:scale-95"
                onclick={resetView}
                disabled={false}
              >
                <RotateCcw
                  class="h-4 w-4 transition-transform duration-200 group-hover:rotate-180"
                  style="color: {iconColor === 'text-black' ? '#000000' : iconColor === 'text-white' ? '#ffffff' : 'hsl(var(--foreground))'} !important;"
                />
              </Button>
            {/snippet}
          </TooltipTrigger>
          <TooltipContent
            side="right"
            align="center"
            sideOffset={8}
            class=""
            arrowClasses=""
          >
            <p class="text-sm">Resetar visualização</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  {/if}

  <!-- Background Toggle Button - Bottom Right (always visible) -->
  <TooltipProvider delayDuration={400}>
    <div class="absolute right-6 bottom-3 z-10">
      <Tooltip
        disableHoverableContent={false}
        disableCloseOnTriggerClick={true}
      >
        <TooltipTrigger asChild>
          {#snippet child({ props })}
            <Button
              {...props}
              variant="secondary"
              size="icon"
              class="h-10 w-10 border-2 border-border bg-background/90 text-foreground shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:bg-background active:scale-95"
              onclick={onBackgroundToggle}
              disabled={false}
            >
              {#if isManualBackgroundActive}
                {#if currentBackgroundColor === "#ffffff"}
                  <!-- White background active - Sun icon with black color for contrast -->
                  <Sun class="h-5 w-5" style="color: #000000 !important;" />
                {:else}
                  <!-- Transparent background active - Moon icon with theme color -->
                  <Moon
                    class="h-5 w-5"
                    style="color: hsl(var(--foreground)) !important;"
                  />
                {/if}
              {:else}
                <!-- Automatic mode - Dimmed sun icon with dynamic color -->
                <Sun
                  class="h-5 w-5 opacity-50"
                  style="color: {iconColor === 'text-black' ? '#000000' : iconColor === 'text-white' ? '#ffffff' : 'hsl(var(--foreground))'} !important;"
                />
              {/if}
            </Button>
          {/snippet}
        </TooltipTrigger>
        <TooltipContent
          side="left"
          align="center"
          sideOffset={8}
          class=""
          arrowClasses=""
        >
          <p class="text-sm">
            {#if isManualBackgroundActive}
              {#if currentBackgroundColor === "#ffffff"}
                Fundo branco (clique para transparente)
              {:else}
                Fundo transparente (clique para branco)
              {/if}
            {:else}
              Alternar fundo (automático ativo)
            {/if}
          </p>
        </TooltipContent>
      </Tooltip>
    </div>
  </TooltipProvider>

  <!-- Loading state -->
  {#if loading}
    <div
      class="absolute inset-0 flex items-center justify-center rounded-lg bg-background/50 backdrop-blur-sm"
    >
      <div class="text-center">
        <div
          class="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"
        ></div>
        <p class="text-sm text-muted-foreground">Carregando...</p>
      </div>
    </div>
  {/if}

  <!-- Error state -->
  {#if error}
    <div
      class="absolute inset-0 flex items-center justify-center rounded-lg bg-background/50 backdrop-blur-sm"
    >
      <div class="text-center text-destructive">
        <p class="font-medium">Erro ao carregar</p>
        <p class="text-sm">{error}</p>
      </div>
    </div>
  {/if}
</div>
