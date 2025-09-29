<script>
import { animate } from "motion";

let { currentColor = "#000000", onTransitionComplete = () => {} } = $props();

let overlayRef = $state();
let isAnimating = $state(false);
let previousColor = $state(currentColor);

// Track color changes and trigger animation
$effect(() => {
  console.log("BackgroundTransition effect:", {
    currentColor,
    previousColor,
    overlayRef: !!overlayRef,
  });

  if (
    currentColor !== previousColor &&
    overlayRef &&
    previousColor !== "#000000"
  ) {
    console.log("Triggering animation from", previousColor, "to", currentColor);
    animateColorTransition(currentColor);
    previousColor = currentColor;
  } else if (previousColor === "#000000") {
    // First time setup
    console.log("First time setup, setting previousColor to", currentColor);
    previousColor = currentColor;
  }
});

function animateColorTransition(newColor) {
  if (isAnimating) {
    console.log("Animation already in progress, skipping");
    return;
  }

  console.log("Starting animation with color:", newColor);
  isAnimating = true;

  // Set the new color on the overlay
  overlayRef.style.backgroundColor = newColor;

  // Get the center point of the screen
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;

  // Calculate the maximum radius needed to cover the entire screen
  const maxRadius = Math.sqrt(
    Math.pow(Math.max(centerX, window.innerWidth - centerX), 2) +
      Math.pow(Math.max(centerY, window.innerHeight - centerY), 2),
  );

  console.log("Animation params:", { centerX, centerY, maxRadius });

  // Start with a small circle at the center
  const startClipPath = `circle(0px at ${centerX}px ${centerY}px)`;
  const endClipPath = `circle(${maxRadius}px at ${centerX}px ${centerY}px)`;

  // Set initial state
  overlayRef.style.clipPath = startClipPath;
  overlayRef.style.opacity = "1";
  // Keep z-index low so it stays behind content

  console.log(
    "Starting clip-path animation from",
    startClipPath,
    "to",
    endClipPath,
  );

  // Animate the circle expansion
  animate(
    overlayRef,
    {
      clipPath: [startClipPath, endClipPath],
    },
    {
      duration: 1.2, // Increased duration to make it more visible
      ease: [0.25, 0.46, 0.45, 0.94], // Smoother easing
    },
  )
    .finished.then(() => {
      console.log("Animation completed");

      // Animation completed - background should already be the same color
      console.log("Background transition animation completed");

      // Hide the overlay after animation
      overlayRef.style.opacity = "0";
      overlayRef.style.clipPath = startClipPath;

      isAnimating = false;
      onTransitionComplete();
    })
    .catch((error) => {
      console.error("Animation error:", error);
      isAnimating = false;
    });
}
</script>

<!-- Animated overlay for circle expansion effect -->
<div
  bind:this={overlayRef}
  class="fixed inset-0 opacity-0"
  style="
    background-color: {currentColor};
    clip-path: circle(0px at 50% 50%);
    pointer-events: none;
    z-index: 1;
  "
></div>
