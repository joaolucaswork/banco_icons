/**
 * Svelte 5 store for managing SVG icon state
 */

import {
  BANK_LOGOS,
  loadSvgContent,
  applySvgModifications,
  formatSvgContent,
} from "../utils/svg-utils.js";
import {
  hasMultipleColors,
  getMultiColorConfig,
  detectColorableElements,
  applyMultipleColors,
  getDefaultColorMap,
  validateColorMap,
  isDefaultColorMap,
} from "../utils/multi-color-utils.js";

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
  // Multi-color support
  isMultiColor: false,
  colorableElements: [],
  colorMap: {},
  // Comparison mode
  showComparison: false,
});

// Computed values
// Preview SVG - always shows at 120px for consistent display
let previewSvg = $derived.by(() => {
  if (!svgData.selectedLogo || !svgData.logos.has(svgData.selectedLogo)) {
    return null;
  }

  const svgContent = svgData.logos.get(svgData.selectedLogo);

  if (svgData.isMultiColor && Object.keys(svgData.colorMap).length > 0) {
    // Apply multiple colors
    let modifiedSvg = applyMultipleColors(
      svgContent,
      svgData.colorMap,
      svgData.selectedLogo,
    );
    // Apply size
    const parser = new DOMParser();
    const doc = parser.parseFromString(modifiedSvg, "image/svg+xml");
    const svgElement = doc.querySelector("svg");
    if (svgElement) {
      svgElement.setAttribute("width", "120");
      svgElement.setAttribute("height", "120");
      modifiedSvg = new XMLSerializer().serializeToString(doc);
    }
    return modifiedSvg;
  }

  return applySvgModifications(svgContent, 120, svgData.color);
});

// Export SVG - uses the actual size value from slider
let modifiedSvg = $derived.by(() => {
  if (!svgData.selectedLogo || !svgData.logos.has(svgData.selectedLogo)) {
    return null;
  }

  const svgContent = svgData.logos.get(svgData.selectedLogo);

  if (svgData.isMultiColor && Object.keys(svgData.colorMap).length > 0) {
    // Apply multiple colors
    let modifiedSvg = applyMultipleColors(
      svgContent,
      svgData.colorMap,
      svgData.selectedLogo,
    );
    // Apply size
    const parser = new DOMParser();
    const doc = parser.parseFromString(modifiedSvg, "image/svg+xml");
    const svgElement = doc.querySelector("svg");
    if (svgElement) {
      svgElement.setAttribute("width", svgData.size.toString());
      svgElement.setAttribute("height", svgData.size.toString());
      modifiedSvg = new XMLSerializer().serializeToString(doc);
    }
    return modifiedSvg;
  }

  return applySvgModifications(svgContent, svgData.size, svgData.color);
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

      // Select first logo if none selected - use selectLogo method to properly initialize multi-color support
      if (!svgData.selectedLogo && svgData.logos.size > 0) {
        // Use the selectLogo method to properly detect and configure multi-color support
        this.selectLogo(BANK_LOGOS[0]);
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

      // Check if this logo supports multiple colors
      svgData.isMultiColor = hasMultipleColors(logoName);

      if (svgData.isMultiColor) {
        // Detect colorable elements
        const svgContent = svgData.logos.get(logoName);
        svgData.colorableElements = detectColorableElements(
          svgContent,
          logoName,
        );

        // Initialize color map with defaults
        svgData.colorMap = getDefaultColorMap(logoName);

        console.log("Multi-color logo detected:", {
          elements: svgData.colorableElements,
          colorMap: svgData.colorMap,
        });
      } else {
        // Reset multi-color state
        svgData.colorableElements = [];
        svgData.colorMap = {};
      }
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

    // Reset multi-color state
    if (svgData.isMultiColor && svgData.selectedLogo) {
      svgData.colorMap = getDefaultColorMap(svgData.selectedLogo);
    }
  },

  // Multi-color methods

  // Set color for a specific element
  setElementColor(elementKey, color) {
    if (!svgData.isMultiColor) return;

    svgData.colorMap = {
      ...svgData.colorMap,
      [elementKey]: color,
    };

    console.log("Element color updated:", {
      elementKey,
      color,
      colorMap: svgData.colorMap,
    });
  },

  // Reset color for a specific element
  resetElementColor(elementKey) {
    if (!svgData.isMultiColor || !svgData.selectedLogo) return;

    const defaultMap = getDefaultColorMap(svgData.selectedLogo);
    svgData.colorMap = {
      ...svgData.colorMap,
      [elementKey]: defaultMap[elementKey],
    };
  },

  // Get current color for an element
  getElementColor(elementKey) {
    if (!svgData.isMultiColor) return null;
    return svgData.colorMap[elementKey] || null;
  },

  // Check if current colors are default
  isDefaultColors() {
    if (!svgData.isMultiColor || !svgData.selectedLogo) return true;
    return isDefaultColorMap(svgData.colorMap, svgData.selectedLogo);
  },

  // Get original SVG content
  getOriginalSvg(logoName) {
    return svgData.logos.get(logoName) || null;
  },

  // Get all available logos
  getAvailableLogos() {
    return Array.from(svgData.logos.keys());
  },

  // Get current SVG content
  getCurrentSvgContent() {
    if (svgData.selectedLogo && svgData.logos.has(svgData.selectedLogo)) {
      return svgData.logos.get(svgData.selectedLogo);
    }

    return null;
  },

  // Toggle comparison mode
  toggleComparison() {
    svgData.showComparison = !svgData.showComparison;
  },

  // Set comparison mode
  setComparison(show) {
    svgData.showComparison = show;
  },
};

// Initialize store
if (typeof window !== "undefined") {
  svgStore.loadAllLogos();
}
