/**
 * Color utility functions for detecting dark colors and managing contrast
 */

/**
 * Convert hex color to RGB values
 * @param {string} hex - Hex color string (e.g., "#ff0000" or "ff0000")
 * @returns {Object} RGB values {r, g, b}
 */
export function hexToRgb(hex) {
  // Remove # if present
  const cleanHex = hex.replace("#", "");

  // Handle 3-digit hex codes
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16);
    const g = parseInt(cleanHex[1] + cleanHex[1], 16);
    const b = parseInt(cleanHex[2] + cleanHex[2], 16);
    return { r, g, b };
  }

  // Handle 6-digit hex codes
  if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return { r, g, b };
  }

  // Default to black if invalid
  return { r: 0, g: 0, b: 0 };
}

/**
 * Calculate the luminance of a color using the relative luminance formula
 * @param {Object} rgb - RGB values {r, g, b}
 * @returns {number} Luminance value between 0 and 1
 */
export function calculateLuminance(rgb) {
  const { r, g, b } = rgb;

  // Convert to 0-1 range
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  // Apply gamma correction
  const rLinear =
    rNorm <= 0.03928 ? rNorm / 12.92 : Math.pow((rNorm + 0.055) / 1.055, 2.4);
  const gLinear =
    gNorm <= 0.03928 ? gNorm / 12.92 : Math.pow((gNorm + 0.055) / 1.055, 2.4);
  const bLinear =
    bNorm <= 0.03928 ? bNorm / 12.92 : Math.pow((bNorm + 0.055) / 1.055, 2.4);

  // Calculate luminance
  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

/**
 * Check if a color is considered dark
 * Uses relative luminance which is the most accurate method for determining
 * if a color appears dark to the human eye
 * @param {string} hexColor - Hex color string
 * @returns {boolean} True if the color is dark
 */
export function isDarkColor(hexColor) {
  if (!hexColor || typeof hexColor !== "string") {
    return false;
  }

  const rgb = hexToRgb(hexColor);

  // Use relative luminance with a threshold of 0.179
  // This threshold works well for determining if white text would be readable
  const luminance = calculateLuminance(rgb);

  // Colors with luminance below 0.179 are considered dark
  // This ensures black (#000000) with luminance 0 is definitely dark
  // and provides good contrast detection for other dark colors
  return luminance < 0.179;
}

/**
 * Get the appropriate background color for contrast
 * @param {string} iconColor - The icon color in hex format
 * @returns {string} Background color for optimal contrast
 */
export function getContrastBackground(iconColor) {
  if (isDarkColor(iconColor)) {
    // For dark colors (including black), use white background
    return "#ffffff";
  } else {
    // For light colors, use transparent background
    return "transparent";
  }
}

/**
 * Get the appropriate dot color for the dotted background pattern
 * @param {string} iconColor - The icon color in hex format
 * @returns {string} Dot color for optimal contrast
 */
export function getDottedPatternColor(iconColor) {
  if (isDarkColor(iconColor)) {
    // For dark colors (white background), use dark dots
    return "#000000";
  } else {
    // For light colors (transparent background), use light dots
    return "#666666";
  }
}

/**
 * Validate if a string is a valid hex color
 * @param {string} color - Color string to validate
 * @returns {boolean} True if valid hex color
 */
export function isValidHexColor(color) {
  if (!color || typeof color !== "string") {
    return false;
  }

  const hexRegex = /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return hexRegex.test(color);
}

/**
 * Normalize hex color input to ensure consistent format
 * @param {string} color - Color string to normalize
 * @returns {string} Normalized hex color with # prefix and lowercase
 */
export function normalizeHexColor(color) {
  if (!color || typeof color !== "string") {
    return "#000000";
  }

  // Remove any whitespace
  const cleanColor = color.trim();

  // Check if it's a valid hex color
  if (!isValidHexColor(cleanColor)) {
    return "#000000";
  }

  // Remove # if present, then add it back
  const withoutHash = cleanColor.replace("#", "");

  // Convert 3-digit hex to 6-digit hex
  if (withoutHash.length === 3) {
    const expanded = withoutHash
      .split("")
      .map((char) => char + char)
      .join("");
    return `#${expanded.toLowerCase()}`;
  }

  // Return 6-digit hex with # prefix and lowercase
  return `#${withoutHash.toLowerCase()}`;
}
