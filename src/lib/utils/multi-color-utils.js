/**
 * Multi-color SVG utilities for detecting and managing multiple colorable elements
 */

import { isDarkColor } from "./color-utils.js";
import {
  getOriginalColors,
  getPrimaryOriginalColor,
  getSecondaryOriginalColor,
} from "./original-colors.js";

/**
 * Configuration for multi-color logos
 * Each logo can have multiple colorable elements with their own properties
 */
export const MULTI_COLOR_CONFIGS = {
  "banco-itau": {
    elements: [
      {
        key: "bg",
        label: "Fundo",
        cssVar: "--itau-bg-color",
        autoContrastVar: null,
        defaultColor: getPrimaryOriginalColor("banco-itau"), // #003399
        description: "Cor do fundo do logo",
      },
      {
        key: "text",
        label: "Texto",
        cssVar: "--itau-text-color",
        autoContrastVar: "--itau-auto-text-color",
        defaultColor: getSecondaryOriginalColor("banco-itau") || "auto", // #FFFF00 or auto contrast
        description: "Cor do texto do logo",
      },
    ],
  },
  "agora-investimentos": {
    elements: [
      {
        key: "bg",
        label: "Fundo",
        cssVar: "--agora-bg-color",
        autoContrastVar: null,
        defaultColor: getPrimaryOriginalColor("agora-investimentos"), // #00C88D
        description: "Cor do fundo e elementos principais",
      },
      {
        key: "text",
        label: "Texto",
        cssVar: "--agora-text-color",
        autoContrastVar: null,
        defaultColor:
          getSecondaryOriginalColor("agora-investimentos") || "#ffffff", // #ffffff
        description: "Cor do texto inferior",
      },
    ],
  },
};

/**
 * Check if a logo has multiple colorable elements
 * @param {string} logoName - Name of the logo
 * @returns {boolean} True if logo has multiple colorable elements
 */
export function hasMultipleColors(logoName) {
  return logoName in MULTI_COLOR_CONFIGS;
}

/**
 * Get multi-color configuration for a logo
 * @param {string} logoName - Name of the logo
 * @returns {Object|null} Configuration object or null if not multi-color
 */
export function getMultiColorConfig(logoName) {
  return MULTI_COLOR_CONFIGS[logoName] || null;
}

/**
 * Detect colorable elements from SVG content
 * @param {string} svgContent - SVG content as string
 * @param {string} logoName - Name of the logo
 * @returns {Array} Array of detected colorable elements
 */
export function detectColorableElements(svgContent, logoName) {
  const config = getMultiColorConfig(logoName);
  if (!config) {
    return [];
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(svgContent, "image/svg+xml");
  const styleElement = doc.querySelector("style");

  if (!styleElement) {
    return [];
  }

  const styleContent = styleElement.textContent;
  const detectedElements = [];

  // Check which configured elements are actually present in the SVG
  config.elements.forEach((element) => {
    if (styleContent.includes(element.cssVar)) {
      detectedElements.push({
        ...element,
        currentColor: element.defaultColor,
      });
    }
  });

  return detectedElements;
}

/**
 * Apply multiple colors to SVG
 * @param {string} svgContent - Original SVG content
 * @param {Object} colorMap - Map of element keys to colors
 * @param {string} logoName - Name of the logo
 * @returns {string} Modified SVG content
 */
export function applyMultipleColors(svgContent, colorMap, logoName) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgContent, "image/svg+xml");
  const svgElement = doc.querySelector("svg");

  if (!svgElement) return svgContent;

  const config = getMultiColorConfig(logoName);
  if (!config) return svgContent;

  // Apply each color from the color map
  config.elements.forEach((element) => {
    const color = colorMap[element.key];
    if (!color) return;

    if (color === "auto" && element.autoContrastVar) {
      // For auto contrast elements, calculate based on background color
      const bgElement = config.elements.find((el) => el.key === "bg");
      const bgColor =
        colorMap[bgElement?.key] || bgElement?.defaultColor || "#000000";

      const textColor = isDarkColor(bgColor) ? "white" : "black";
      svgElement.style.setProperty(element.autoContrastVar, textColor);
    } else if (color !== "auto") {
      // Apply direct color
      svgElement.style.setProperty(element.cssVar, color);

      // If this element has auto contrast, also set that
      if (element.autoContrastVar) {
        const textColor = isDarkColor(color) ? "white" : "black";
        svgElement.style.setProperty(element.autoContrastVar, textColor);
      }
    }
  });

  return new XMLSerializer().serializeToString(doc);
}

/**
 * Get default color map for a logo
 * @param {string} logoName - Name of the logo
 * @returns {Object} Default color map
 */
export function getDefaultColorMap(logoName) {
  const config = getMultiColorConfig(logoName);
  if (!config) return {};

  const colorMap = {};
  config.elements.forEach((element) => {
    colorMap[element.key] = element.defaultColor;
  });

  return colorMap;
}

/**
 * Resolve "auto" colors to actual hex colors for display
 * @param {Object} colorMap - Color map that may contain "auto" values
 * @param {string} logoName - Name of the logo
 * @returns {Object} Color map with resolved colors
 */
export function resolveAutoColors(colorMap, logoName) {
  const config = getMultiColorConfig(logoName);
  if (!config) return colorMap;

  const resolvedMap = { ...colorMap };

  config.elements.forEach((element) => {
    const color = colorMap[element.key];

    if (color === "auto" && element.autoContrastVar) {
      // For auto contrast elements, calculate based on background color
      const bgElement = config.elements.find((el) => el.key === "bg");
      const bgColor =
        colorMap[bgElement?.key] || bgElement?.defaultColor || "#000000";

      const textColor = isDarkColor(bgColor) ? "#ffffff" : "#000000";
      resolvedMap[element.key] = textColor;
    }
  });

  return resolvedMap;
}

/**
 * Validate color map for a logo
 * @param {Object} colorMap - Color map to validate
 * @param {string} logoName - Name of the logo
 * @returns {Object} Validated and normalized color map
 */
export function validateColorMap(colorMap, logoName) {
  const config = getMultiColorConfig(logoName);
  if (!config) return {};

  const validatedMap = {};

  config.elements.forEach((element) => {
    const color = colorMap[element.key];
    if (color && (color === "auto" || /^#[0-9A-Fa-f]{6}$/.test(color))) {
      validatedMap[element.key] = color;
    } else {
      validatedMap[element.key] = element.defaultColor;
    }
  });

  return validatedMap;
}

/**
 * Check if a color map represents default values
 * @param {Object} colorMap - Color map to check
 * @param {string} logoName - Name of the logo
 * @returns {boolean} True if all colors are default values
 */
export function isDefaultColorMap(colorMap, logoName) {
  const defaultMap = getDefaultColorMap(logoName);
  const config = getMultiColorConfig(logoName);

  if (!config) return true;

  return config.elements.every((element) => {
    return colorMap[element.key] === defaultMap[element.key];
  });
}
