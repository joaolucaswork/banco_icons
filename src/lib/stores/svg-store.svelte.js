/**
 * Svelte 5 store for managing SVG icon state
 */

import {
  BANK_LOGOS,
  loadSvgContent,
  applySvgModifications,
  formatSvgContent,
} from "../utils/svg-utils.js";

// Default settings
const DEFAULT_SIZE = 24;
const DEFAULT_COLOR = "#ffffff";

// Create reactive state
let svgData = $state({
  logos: new Map(),
  selectedLogo: null,
  size: DEFAULT_SIZE,
  color: DEFAULT_COLOR,
  loading: false,
  error: null,
});

// Computed values
// Preview SVG - always shows at 120px for consistent display
let previewSvg = $derived.by(() => {
  if (!svgData.selectedLogo || !svgData.logos.has(svgData.selectedLogo)) {
    return null;
  }

  const originalSvg = svgData.logos.get(svgData.selectedLogo);
  return applySvgModifications(originalSvg, 120, svgData.color);
});

// Export SVG - uses the actual size value from slider
let modifiedSvg = $derived.by(() => {
  if (!svgData.selectedLogo || !svgData.logos.has(svgData.selectedLogo)) {
    return null;
  }

  const originalSvg = svgData.logos.get(svgData.selectedLogo);
  return applySvgModifications(originalSvg, svgData.size, svgData.color);
});

let formattedSvg = $derived.by(() => {
  if (!modifiedSvg) return "";
  return formatSvgContent(modifiedSvg);
});

// Actions
export const svgStore = {
  // Getters
  get data() {
    return svgData;
  },
  get previewSvg() {
    return previewSvg;
  },
  get modifiedSvg() {
    return modifiedSvg;
  },
  get formattedSvg() {
    return formattedSvg;
  },

  // Load all SVG logos
  async loadAllLogos() {
    svgData.loading = true;
    svgData.error = null;

    try {
      const logoPromises = BANK_LOGOS.map(async (logo) => {
        const content = await loadSvgContent(logo);
        return [logo, content];
      });

      const results = await Promise.all(logoPromises);

      // Clear existing logos and add new ones
      svgData.logos.clear();
      results.forEach(([logo, content]) => {
        if (content) {
          svgData.logos.set(logo, content);
        }
      });

      // Select first logo if none selected
      if (!svgData.selectedLogo && svgData.logos.size > 0) {
        svgData.selectedLogo = BANK_LOGOS[0];
      }
    } catch (error) {
      console.error("Erro ao carregar logos:", error);
      svgData.error = "Falha ao carregar logos SVG";
    } finally {
      svgData.loading = false;
    }
  },

  // Select a specific logo
  selectLogo(logoName) {
    console.log("svgStore.selectLogo chamado com:", logoName);
    console.log("svgData.logos.has(logoName):", svgData.logos.has(logoName));
    console.log("svgData.selectedLogo antes:", svgData.selectedLogo);
    if (svgData.logos.has(logoName)) {
      svgData.selectedLogo = logoName;
      console.log("svgData.selectedLogo depois:", svgData.selectedLogo);
    }
  },

  // Update size
  setSize(newSize) {
    const size = Math.max(24, Math.min(256, Number(newSize)));
    svgData.size = size;
  },

  // Update color
  setColor(newColor) {
    svgData.color = newColor;
  },

  // Reset to defaults
  reset() {
    svgData.size = DEFAULT_SIZE;
    svgData.color = DEFAULT_COLOR;
  },

  // Get original SVG content
  getOriginalSvg(logoName) {
    return svgData.logos.get(logoName) || null;
  },

  // Get all available logos
  getAvailableLogos() {
    return Array.from(svgData.logos.keys());
  },
};

// Initialize store
if (typeof window !== "undefined") {
  svgStore.loadAllLogos();
}
