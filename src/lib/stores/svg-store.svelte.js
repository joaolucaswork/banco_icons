/**
 * Svelte 5 store for managing SVG icon state
 */

import {
  BANK_LOGOS,
  loadSvgContent,
  applySvgModifications,
  formatSvgContent,
  getDefaultLogoColor,
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
import { getPrimaryOriginalColor } from "../utils/original-colors.js";
import { applyThemeColors, resetThemeColors } from "../utils/theme-colors.js";
import { hexToRgb, calculateLuminance } from "../utils/color-utils.js";

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
  // Background toggle state
  manualBackgroundOverride: false, // When true, disables automatic contrast detection
  manualBackgroundColor: "transparent", // The manually selected background color
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
  async loadAllLogos(autoSelectFirst = false) {
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

      console.log("[SVG Store] Loaded", svgData.logos.size, "logos");

      // Auto-select first logo if requested (for single view mode)
      if (autoSelectFirst && svgData.logos.size > 0) {
        const firstLogo = Array.from(svgData.logos.keys())[0];
        console.log("[SVG Store] Auto-selecting first logo:", firstLogo);
        this.selectLogo(firstLogo);
      }
    } catch (error) {
      svgData.error = "Falha ao carregar logos SVG";
    } finally {
      svgData.loading = false;
    }
  },

  // Select a specific logo
  selectLogo(logoName) {
    if (svgData.logos.has(logoName)) {
      svgData.selectedLogo = logoName;

      // Reset background toggle state when changing logos - re-enable automatic contrast detection
      svgData.manualBackgroundOverride = false;
      svgData.manualBackgroundColor = "transparent";

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

        // Also set the main color to the primary color for background calculation
        svgData.color = getDefaultLogoColor(logoName);
      } else {
        // Reset multi-color state and set single color to original
        svgData.colorableElements = [];
        svgData.colorMap = {};
        // Set the single color to the original color of the logo
        svgData.color = getDefaultLogoColor(logoName);
      }

      // Apply theme colors based on logo's primary color
      const primaryColor = getPrimaryOriginalColor(logoName);
      applyThemeColors(primaryColor);
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

    // Reset colors to original colors
    if (svgData.selectedLogo) {
      if (svgData.isMultiColor) {
        // Reset multi-color state to original colors
        svgData.colorMap = getDefaultColorMap(svgData.selectedLogo);
      } else {
        // Reset single color to original color
        svgData.color = getDefaultLogoColor(svgData.selectedLogo);
      }
    } else {
      // Fallback to default white if no logo selected
      svgData.color = DEFAULT_COLOR;
    }

    // Reset background toggle state - re-enable automatic contrast detection
    svgData.manualBackgroundOverride = false;
    svgData.manualBackgroundColor = "transparent";

    // Reset theme colors to default when resetting
    if (svgData.selectedLogo) {
      const primaryColor = getPrimaryOriginalColor(svgData.selectedLogo);
      applyThemeColors(primaryColor);
    } else {
      resetThemeColors();
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

  // Background toggle methods

  // Toggle background between white and transparent
  toggleBackground() {
    if (!svgData.manualBackgroundOverride) {
      // First toggle: enable manual override and set to the opposite of current automatic background
      svgData.manualBackgroundOverride = true;

      // Import getContrastBackground to determine current automatic background
      import("../utils/color-utils.js").then(({ getContrastBackground }) => {
        const currentAutomaticBg = getContrastBackground(svgData.color);
        // Set to the opposite of what would be automatic
        svgData.manualBackgroundColor =
          currentAutomaticBg === "#ffffff" ? "transparent" : "#ffffff";
      });

      // Fallback synchronous calculation (same logic as getContrastBackground)
      // This ensures immediate response while async import loads
      const rgb = hexToRgb(svgData.color);
      const luminance = calculateLuminance(rgb);
      const isCurrentlyDark = luminance < 0.179;
      svgData.manualBackgroundColor = isCurrentlyDark
        ? "transparent"
        : "#ffffff";
    } else if (svgData.manualBackgroundColor === "#ffffff") {
      // Second toggle: change to transparent
      svgData.manualBackgroundColor = "transparent";
    } else {
      // Third toggle: back to white
      svgData.manualBackgroundColor = "#ffffff";
    }
  },

  // Get the current background color (either manual or automatic)
  getCurrentBackgroundColor() {
    if (svgData.manualBackgroundOverride) {
      return svgData.manualBackgroundColor;
    }
    // Return null to indicate automatic contrast detection should be used
    return null;
  },

  // Check if manual background override is active
  isManualBackgroundActive() {
    return svgData.manualBackgroundOverride;
  },
};

// Initialize store
if (typeof window !== "undefined") {
  svgStore.loadAllLogos();
}
