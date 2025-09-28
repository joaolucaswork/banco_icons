/**
 * Theme color utilities for dynamic background theming
 */

/**
 * Convert hex color to RGB values
 * @param {string} hex - Hex color string (e.g., "#FF0000")
 * @returns {{r: number, g: number, b: number}} RGB values
 */
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

/**
 * Convert RGB to HSL
 * @param {number} r - Red (0-255)
 * @param {number} g - Green (0-255)
 * @param {number} b - Blue (0-255)
 * @returns {{h: number, s: number, l: number}} HSL values
 */
function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h,
    s,
    l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

/**
 * Convert HSL to RGB
 * @param {number} h - Hue (0-360)
 * @param {number} s - Saturation (0-100)
 * @param {number} l - Lightness (0-100)
 * @returns {{r: number, g: number, b: number}} RGB values
 */
function hslToRgb(h, s, l) {
  h /= 360;
  s /= 100;
  l /= 100;

  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

/**
 * Convert RGB to hex
 * @param {number} r - Red (0-255)
 * @param {number} g - Green (0-255)
 * @param {number} b - Blue (0-255)
 * @returns {string} Hex color string
 */
function rgbToHex(r, g, b) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

/**
 * Create a darker version of a color for background theming
 * @param {string} hexColor - Original hex color
 * @param {number} darknessFactor - How much darker (0-1, default 0.95)
 * @returns {string} Darker hex color
 */
export function createDarkThemeColor(hexColor, darknessFactor = 0.95) {
  if (!hexColor || hexColor === "#ffffff") {
    return "#050505"; // Default extremely dark background
  }

  const rgb = hexToRgb(hexColor);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  // Reduce lightness extremely for very dark theme
  const newLightness = Math.max(hsl.l * (1 - darknessFactor), 3); // Minimum 3% lightness

  // Keep good saturation for color identity
  const newSaturation = Math.max(hsl.s * 0.9, 25); // Minimum 25% saturation

  const newRgb = hslToRgb(hsl.h, newSaturation, newLightness);
  return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
}

/**
 * Create a slightly lighter version for card backgrounds
 * @param {string} darkBgColor - Dark background color
 * @returns {string} Slightly lighter hex color for cards
 */
export function createCardThemeColor(darkBgColor) {
  const rgb = hexToRgb(darkBgColor);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  // Make cards barely lighter than background - almost the same darkness
  const newLightness = Math.min(hsl.l + 1, 5); // Add only 1% lightness, max 5%

  const newRgb = hslToRgb(hsl.h, hsl.s, newLightness);
  return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
}

/**
 * Apply theme colors to CSS custom properties
 * @param {string} primaryColor - Primary color from logo
 */
export function applyThemeColors(primaryColor) {
  // Check if we're in the browser
  if (typeof document === "undefined") {
    return;
  }

  const darkBg = createDarkThemeColor(primaryColor);
  const cardBg = createCardThemeColor(darkBg);

  // Apply to CSS custom properties on the document element
  const root = document.documentElement;

  // Try multiple approaches to ensure the colors are applied
  // Method 1: Direct style properties with !important
  root.style.setProperty("--background", darkBg, "important");
  root.style.setProperty("--card", cardBg, "important");

  // Method 2: Also set the actual background color directly
  document.body.style.backgroundColor = darkBg;

  // Method 3: Add a custom class to override dark theme
  root.classList.add("theme-override");

  // Method 4: Create dynamic CSS rule
  let styleElement = document.getElementById("dynamic-theme");
  if (!styleElement) {
    styleElement = document.createElement("style");
    styleElement.id = "dynamic-theme";
    document.head.appendChild(styleElement);
  }

  styleElement.textContent = `
    .theme-override {
      --background: ${darkBg} !important;
      --card: ${cardBg} !important;
      --border: transparent !important;
      --input: ${cardBg} !important;
    }
    .theme-override .dark {
      --background: ${darkBg} !important;
      --card: ${cardBg} !important;
      --border: transparent !important;
      --input: ${cardBg} !important;
    }
    body {
      background-color: ${darkBg} !important;
    }
    /* Consistent button styles with proper hierarchy */
    /* Base button styling - subtle transparent background */
    button:not(.bg-blue-600):not(.bg-gray-600):not(.bg-red-600):not(.bg-green-600):not([style*="background-color"]):not(.bg-white) {
      background-color: rgba(255, 255, 255, 0.08) !important;
      border: 1px solid rgba(255, 255, 255, 0.12) !important;
      color: #ffffff !important;
      backdrop-filter: blur(8px);
      transition: all 0.2s ease !important;
    }
    button:not(.bg-blue-600):not(.bg-gray-600):not(.bg-red-600):not(.bg-green-600):not([style*="background-color"]):not(.bg-white):hover {
      background-color: rgba(255, 255, 255, 0.15) !important;
      border-color: rgba(255, 255, 255, 0.2) !important;
    }

    /* ShadCN Button component styles - consistent with regular buttons */
    [data-slot="button"]:not([class*="bg-"]):not([style*="background-color"]):not(.bg-white) {
      background-color: rgba(255, 255, 255, 0.08) !important;
      border: 1px solid rgba(255, 255, 255, 0.12) !important;
      color: #ffffff !important;
      backdrop-filter: blur(8px);
      transition: all 0.2s ease !important;
    }
    [data-slot="button"]:not([class*="bg-"]):not([style*="background-color"]):not(.bg-white):hover {
      background-color: rgba(255, 255, 255, 0.15) !important;
      border-color: rgba(255, 255, 255, 0.2) !important;
      color: #ffffff !important;
    }

    /* Color preview buttons - preserve their inline background-color with better borders */
    button[style*="background-color"], [data-slot="button"][style*="background-color"] {
      border: 2px solid rgba(255, 255, 255, 0.3) !important;
      transition: all 0.2s ease !important;
    }
    button[style*="background-color"]:hover, [data-slot="button"][style*="background-color"]:hover {
      border-color: rgba(255, 255, 255, 0.5) !important;
      transform: scale(1.05) !important;
    }

    /* Action buttons (Figma, Webflow, etc.) - ensure proper white text and icons */
    button.h-14.w-14, [data-slot="button"].h-14.w-14 {
      color: #ffffff !important;
      background-color: rgba(255, 255, 255, 0.08) !important;
      border: 1px solid rgba(255, 255, 255, 0.12) !important;
    }
    button.h-14.w-14:hover, [data-slot="button"].h-14.w-14:hover {
      background-color: rgba(255, 255, 255, 0.15) !important;
      border-color: rgba(255, 255, 255, 0.2) !important;
    }
    button.h-14.w-14 svg, [data-slot="button"].h-14.w-14 svg {
      color: #ffffff !important;
      stroke: currentColor !important;
    }

    /* Ensure all Lucide icons use stroke properly */
    svg[stroke="currentColor"] {
      stroke: currentColor !important;
      fill: none !important;
    }

    /* Ensure proper icon styling for all buttons */
    button svg, [data-slot="button"] svg {
      color: inherit !important;
    }
    /* Remove borders from cards and inputs */
    .border-border {
      border-color: transparent !important;
    }
    .border {
      border-color: transparent !important;
    }
    /* Input and select styling */
    input, select, textarea {
      background-color: ${cardBg} !important;
      border-color: transparent !important;
      color: #ffffff !important;
    }
    /* Card styling to ensure very dark appearance */
    [data-slot="card"], .bg-card {
      background-color: ${cardBg} !important;
      border-color: transparent !important;
    }
    /* Ensure cards are extremely dark */
    .border-border {
      border-color: transparent !important;
    }
    /* Preserve SVG colors - don't override them */
    svg, svg * {
      color: inherit !important;
      fill: inherit !important;
    }
    /* Remove background from action buttons container */
    .bg-muted\\/20, .bg-muted {
      background-color: transparent !important;
    }
  `;
}

/**
 * Reset theme colors to default
 */
export function resetThemeColors() {
  // Check if we're in the browser
  if (typeof document === "undefined") {
    console.log("Não está no browser, pulando reset de cores");
    return;
  }

  const root = document.documentElement;

  // Remove custom properties
  root.style.removeProperty("--background");
  root.style.removeProperty("--card");

  // Remove direct body background
  document.body.style.removeProperty("background-color");

  // Remove custom class
  root.classList.remove("theme-override");

  // Remove dynamic CSS
  const styleElement = document.getElementById("dynamic-theme");
  if (styleElement) {
    styleElement.remove();
  }
}
