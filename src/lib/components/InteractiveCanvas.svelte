<script>
import { Button } from "$lib/components/ui/button";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-svelte";
import { onMount } from "svelte";

let {
  svgContent = null,
  previewBackground = "#ffffff",
  dotColor = "#000000",
  loading = false,
  error = null,
  class: className = "",
  ...restProps
} = $props();

// Canvas state
let canvasContainer = $state(/** @type {HTMLDivElement | null} */ (null));
let canvas = $state(/** @type {HTMLCanvasElement | null} */ (null));
let ctx = $state(/** @type {CanvasRenderingContext2D | null} */ (null));
let svgImage = $state(/** @type {HTMLImageElement | null} */ (null));

// Transform state
let scale = $state(1);
let translateX = $state(0);
let translateY = $state(0);
let isDragging = $state(false);
let lastMouseX = $state(0);
let lastMouseY = $state(0);

// Canvas dimensions
let canvasWidth = $state(400);
let canvasHeight = $state(200);

// Zoom configuration
const MIN_SCALE = 0.1;
const MAX_SCALE = 10;
const ZOOM_FACTOR = 1.2;

onMount(() => {
  if (canvas) {
    ctx = canvas.getContext("2d");
    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);

    return () => {
      window.removeEventListener("resize", updateCanvasSize);
    };
  }
});

function updateCanvasSize() {
  if (canvasContainer && canvas) {
    const rect = canvasContainer.getBoundingClientRect();
    canvasWidth = rect.width;
    canvasHeight = Math.max(200, Math.min(300, rect.height));

    canvas.width = canvasWidth * window.devicePixelRatio;
    canvas.height = canvasHeight * window.devicePixelRatio;
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;

    if (ctx) {
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }

    draw();
  }
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

function draw() {
  if (!ctx || !canvas) return;

  // Clear canvas
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  // Draw background
  ctx.fillStyle = previewBackground;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Draw dotted pattern
  drawDottedPattern();

  // Save context for transforms
  ctx.save();

  // Apply transforms
  ctx.translate(canvasWidth / 2 + translateX, canvasHeight / 2 + translateY);
  ctx.scale(scale, scale);

  // Draw SVG if available
  if (svgImage) {
    const imgWidth = 120; // Fixed size for consistency
    const imgHeight = 120;
    ctx.drawImage(svgImage, -imgWidth / 2, -imgHeight / 2, imgWidth, imgHeight);
  }

  // Restore context
  ctx.restore();
}

function drawDottedPattern() {
  if (!ctx) return;

  const dotSize = 1;
  const spacing = 16;
  const opacity = 0.3;

  ctx.fillStyle = dotColor;
  ctx.globalAlpha = opacity;

  for (let x = 0; x < canvasWidth; x += spacing) {
    for (let y = 0; y < canvasHeight; y += spacing) {
      ctx.beginPath();
      ctx.arc(x, y, dotSize, 0, Math.PI * 2);
      ctx.fill();

      // Offset pattern
      ctx.beginPath();
      ctx.arc(x + spacing / 2, y + spacing / 2, dotSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.globalAlpha = 1;
}

// Zoom functions
function zoomIn() {
  const newScale = Math.min(scale * ZOOM_FACTOR, MAX_SCALE);
  scale = newScale;
  draw();
}

function zoomOut() {
  const newScale = Math.max(scale / ZOOM_FACTOR, MIN_SCALE);
  scale = newScale;
  draw();
}

function resetView() {
  scale = 1;
  translateX = 0;
  translateY = 0;
  draw();
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

$effect(() => {
  updateCanvasSize();
});

$effect(() => {
  draw();
});
</script>

<div
  bind:this={canvasContainer}
  class="relative flex min-h-[180px] items-center justify-center rounded-lg border border-border transition-colors duration-200 lg:min-h-[200px] {className}"
  {...restProps}
>
  <!-- Canvas -->
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

  <!-- Controls overlay -->
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
