<script>
import { Button } from "$lib/components/ui/button";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-svelte";
import CheckIcon from "@lucide/svelte/icons/check";
import { onMount } from "svelte";
import { loadOriginalSvgContent } from "$lib/utils/original-logos.js";
import CanvasContextMenu from "./CanvasContextMenu.svelte";

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
  class: className = "",
  ...restProps
} = $props();

// Canvas state for modified logo (left side)
let canvasContainer = $state(/** @type {HTMLDivElement | null} */ (null));
let canvas = $state(/** @type {HTMLCanvasElement | null} */ (null));
let ctx = $state(/** @type {CanvasRenderingContext2D | null} */ (null));
let svgImage = $state(/** @type {HTMLImageElement | null} */ (null));
let exportSvgImage = $state(/** @type {HTMLImageElement | null} */ (null));

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
    console.error("Failed to load SVG image");
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
    console.error("Failed to load original SVG image");
    originalSvgImage = null;
    URL.revokeObjectURL(url);
    drawOriginal();
  };

  img.src = url;
}

function loadExportSvgImage(/** @type {string | null} */ svgString) {
  if (!svgString) {
    exportSvgImage = null;
    draw();
    return;
  }

  const img = new Image();
  const svgBlob = new Blob([svgString], {
    type: "image/svg+xml;charset=utf-8",
  });
  const url = URL.createObjectURL(svgBlob);

  img.onload = () => {
    exportSvgImage = img;
    URL.revokeObjectURL(url);
    draw();
  };

  img.onerror = () => {
    console.error("Failed to load export SVG image");
    exportSvgImage = null;
    URL.revokeObjectURL(url);
    draw();
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

  // Draw mini preview in bottom left corner (only on left canvas)
  if (!showComparison) {
    drawMiniPreview();
  }
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

    // Draw original SVG
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

  // Draw SVG if available
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

// Helper function to calculate luminance and determine contrast color
function getContrastColor(backgroundColor) {
  // Convert hex to RGB
  const hex = backgroundColor.replace("#", "");
  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;

  // Calculate relative luminance
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

  // Return white for dark backgrounds, black for light backgrounds
  return luminance > 0.5 ? "#000000" : "#ffffff";
}

function drawMiniPreview() {
  if (!ctx || !exportSvgImage) return;

  const padding = 12;
  const maxSize = 80; // Increased maximum size for the mini preview box
  const actualSize = Math.min(exportSize, maxSize); // Use actual export size but cap at maxSize
  const iconSize = Math.min(actualSize * 0.75, 50); // Icon is smaller than the box (75% of box size, max 50px)

  // Calculate contrast colors based on background
  const contrastColor = getContrastColor(previewBackground);
  const tagTextColor = contrastColor === "#ffffff" ? "#ffffff" : "#000000";
  const dotColor =
    contrastColor === "#ffffff"
      ? "rgba(255, 255, 255, 0.9)"
      : "rgba(0, 0, 0, 0.9)";

  // Calculate positions with increased spacing
  const labelText = `${exportSize}px`;
  ctx.font = "11px system-ui, -apple-system, sans-serif";
  const textMetrics = ctx.measureText(labelText);
  const textWidth = textMetrics.width;
  const textHeight = 11;
  const tagPadding = 6;
  const tagHeight = textHeight + tagPadding * 2;
  const labelSpacing = 12; // Increased spacing between preview and label

  // Position in bottom left corner with space for label below
  const x = padding;
  const y = canvasHeight - padding - actualSize - tagHeight - labelSpacing;

  // Draw label with white border tag BELOW the mini preview
  const tagX = x;
  const tagY = y + actualSize + labelSpacing;
  ctx.save();

  // Draw rounded rectangle with transparent background and contrast border
  const tagRadius = 4;
  const borderColor =
    contrastColor === "#ffffff"
      ? "rgba(255, 255, 255, 0.9)"
      : "rgba(0, 0, 0, 0.9)"; // Contrast-aware border

  // Draw thin contrast border only (no fill)
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 0.8; // Even thinner border
  ctx.beginPath();
  ctx.roundRect(tagX, tagY, textWidth + tagPadding * 2, tagHeight, tagRadius);
  ctx.stroke();

  // Draw contrast-aware text
  ctx.fillStyle = tagTextColor;
  ctx.textAlign = "left";
  ctx.fillText(
    labelText,
    tagX + tagPadding,
    tagY + textHeight + tagPadding - 3,
  );

  // Draw zoom/position indicator frame with rounded corners
  const frameThickness = 0.8; // Thin border
  const frameColor =
    contrastColor === "#ffffff"
      ? "rgba(255, 255, 255, 0.9)"
      : "rgba(0, 0, 0, 0.9)"; // Contrast-aware border
  const frameRadius = 6;

  // Outer frame (zoom indicator) - rounded
  ctx.strokeStyle = frameColor;
  ctx.lineWidth = frameThickness;
  ctx.beginPath();
  ctx.roundRect(x - 4, y - 4, actualSize + 8, actualSize + 8, frameRadius);
  ctx.stroke();

  // Inner position indicator (shows pan offset)
  const maxOffset = 20; // Maximum visual offset for position indicator
  const normalizedX = Math.max(
    -maxOffset,
    Math.min(maxOffset, translateX / 10),
  );
  const normalizedY = Math.max(
    -maxOffset,
    Math.min(maxOffset, translateY / 10),
  );

  // Position indicator dot - smaller and with contrast-aware color
  const dotX = x + actualSize / 2 + normalizedX;
  const dotY = y + actualSize / 2 + normalizedY;
  const dotRadius = 2.5; // Decreased from 4 to 2.5
  ctx.fillStyle = dotColor;
  ctx.beginPath();
  ctx.arc(dotX, dotY, dotRadius, 0, Math.PI * 2);
  ctx.fill();

  // Draw subtle rounded border for the mini preview (no background)
  ctx.strokeStyle = "rgba(0, 0, 0, 0.1)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(x - 1, y - 1, actualSize + 2, actualSize + 2, 3);
  ctx.stroke();

  // Draw the export SVG at smaller size, centered in the larger box
  const iconX = x + (actualSize - iconSize) / 2;
  const iconY = y + (actualSize - iconSize) / 2;
  ctx.drawImage(exportSvgImage, iconX, iconY, iconSize, iconSize);

  ctx.restore();
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
        console.error("Failed to load original logo:", error);
      });
  }
});

$effect(() => {
  // Load export SVG when export parameters change
  if (svgContent && exportSize && exportColor) {
    // Create export SVG with the specified size and color
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgContent, "image/svg+xml");
    const svgElement = doc.documentElement;

    // Update size attributes
    svgElement.setAttribute("width", exportSize.toString());
    svgElement.setAttribute("height", exportSize.toString());

    // Update fill color for all path elements
    const paths = svgElement.querySelectorAll(
      "path, circle, rect, polygon, ellipse",
    );
    paths.forEach((path) => {
      path.setAttribute("fill", exportColor);
    });

    const exportSvgString = new XMLSerializer().serializeToString(svgElement);
    loadExportSvgImage(exportSvgString);
  } else {
    exportSvgImage = null;
    draw();
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

        <!-- Left Controls -->
        <div class="absolute top-3 left-3 z-10 flex flex-col gap-1">
          <Button
            variant="secondary"
            size="icon"
            class="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background/90"
            onclick={zoomIn}
            disabled={scale >= MAX_SCALE}
          >
            <ZoomIn class="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            class="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background/90"
            onclick={zoomOut}
            disabled={scale <= MIN_SCALE}
          >
            <ZoomOut class="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            class="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background/90"
            onclick={resetView}
            disabled={false}
          >
            <RotateCcw class="h-4 w-4" />
          </Button>
        </div>

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

        <!-- Right Controls -->
        <div class="absolute top-3 left-3 z-10 flex flex-col gap-1">
          <Button
            variant="secondary"
            size="icon"
            class="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background/90"
            onclick={originalZoomIn}
            disabled={originalScale >= MAX_SCALE}
          >
            <ZoomIn class="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            class="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background/90"
            onclick={originalZoomOut}
            disabled={originalScale <= MIN_SCALE}
          >
            <ZoomOut class="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            class="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background/90"
            onclick={originalResetView}
            disabled={false}
          >
            <RotateCcw class="h-4 w-4" />
          </Button>
        </div>

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
    <div class="absolute top-3 left-3 z-10 flex flex-col gap-1">
      <Button
        variant="secondary"
        size="icon"
        class="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background/90"
        onclick={zoomIn}
        disabled={scale >= MAX_SCALE}
      >
        <ZoomIn class="h-4 w-4" />
      </Button>

      <Button
        variant="secondary"
        size="icon"
        class="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background/90"
        onclick={zoomOut}
        disabled={scale <= MIN_SCALE}
      >
        <ZoomOut class="h-4 w-4" />
      </Button>

      <Button
        variant="secondary"
        size="icon"
        class="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background/90"
        onclick={resetView}
        disabled={false}
      >
        <RotateCcw class="h-4 w-4" />
      </Button>
    </div>
  {/if}

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
