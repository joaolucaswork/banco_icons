/**
 * Original colors utility functions
 * Extracts and manages original colors from bank logos
 */

import { ORIGINAL_LOGO_MAPPING } from "./original-logos.js";

/**
 * Mapping of original colors for each bank logo
 * These colors are extracted from the original SVG files in /static/logo_original/
 */
export const ORIGINAL_COLORS = {
  "banco-itau": {
    primary: "#003399", // Blue background
    secondary: "#FFFF00", // Yellow text
  },
  "banco-bradesco": {
    primary: "#E51736", // Red
  },
  "btg-pactual": {
    primary: "#ffffff", // White (logo designed for dark backgrounds)
  },
  "banco-brasil": {
    primary: "#33348E", // Blue
  },
  "caixa-economica": {
    primary: "#0070AF", // Blue
    secondary: "#F6822A", // Orange
  },
  "xp-investimentos": {
    primary: "#FFC709", // Yellow/Gold
  },
  "agora-investimentos": {
    primary: "#00C88D", // Green
    secondary: "#ffffff", // White text
  },
};

/**
 * Extract colors from SVG content
 * @param {string} svgContent - SVG content as string
 * @returns {Array<string>} Array of unique colors found in the SVG
 */
export function extractColorsFromSvg(svgContent) {
  if (!svgContent) return [];

  const parser = new DOMParser();
  const doc = parser.parseFromString(svgContent, "image/svg+xml");
  const colors = new Set();

  // Find all elements with fill attributes
  const elementsWithFill = doc.querySelectorAll("[fill]");
  elementsWithFill.forEach((element) => {
    const fill = element.getAttribute("fill");
    if (
      fill &&
      fill !== "none" &&
      fill !== "transparent" &&
      fill.startsWith("#")
    ) {
      colors.add(fill.toUpperCase());
    }
  });

  // Find all elements with stroke attributes
  const elementsWithStroke = doc.querySelectorAll("[stroke]");
  elementsWithStroke.forEach((element) => {
    const stroke = element.getAttribute("stroke");
    if (
      stroke &&
      stroke !== "none" &&
      stroke !== "transparent" &&
      stroke.startsWith("#")
    ) {
      colors.add(stroke.toUpperCase());
    }
  });

  return Array.from(colors);
}

/**
 * Get original colors for a logo
 * @param {string} logoName - Name of the logo (e.g., "banco-itau")
 * @returns {Object|null} Object with primary and optional secondary colors
 */
export function getOriginalColors(logoName) {
  return ORIGINAL_COLORS[logoName] || null;
}

/**
 * Get primary original color for a logo
 * @param {string} logoName - Name of the logo
 * @returns {string} Primary color or default color if not found
 */
export function getPrimaryOriginalColor(logoName) {
  const colors = getOriginalColors(logoName);
  return colors?.primary || "#ffffff"; // Default to white instead of black for better visibility
}

/**
 * Get secondary original color for a logo
 * @param {string} logoName - Name of the logo
 * @returns {string|null} Secondary color or null if not available
 */
export function getSecondaryOriginalColor(logoName) {
  const colors = getOriginalColors(logoName);
  return colors?.secondary || null;
}

/**
 * Check if a logo has multiple original colors
 * @param {string} logoName - Name of the logo
 * @returns {boolean} True if logo has secondary color
 */
export function hasMultipleOriginalColors(logoName) {
  const colors = getOriginalColors(logoName);
  return colors && colors.secondary !== undefined;
}

/**
 * Load and analyze original SVG to extract colors
 * @param {string} logoName - Name of the logo
 * @returns {Promise<Array<string>>} Promise that resolves to array of colors
 */
export async function analyzeOriginalSvgColors(logoName) {
  try {
    const originalFilename = ORIGINAL_LOGO_MAPPING[logoName];
    if (!originalFilename) {
      console.warn(`No original logo mapping found for: ${logoName}`);
      return [];
    }

    const response = await fetch(`/logo_original/${originalFilename}`);
    if (!response.ok) {
      throw new Error(`Failed to load original SVG: ${originalFilename}`);
    }

    const svgContent = await response.text();
    return extractColorsFromSvg(svgContent);
  } catch (error) {
    console.error(
      `Error analyzing original SVG colors for ${logoName}:`,
      error,
    );
    return [];
  }
}

/**
 * Get all available logo names that have original colors defined
 * @returns {Array<string>} Array of logo names
 */
export function getAvailableLogosWithOriginalColors() {
  return Object.keys(ORIGINAL_COLORS);
}
