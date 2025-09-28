/**
 * SVG utility functions for loading, parsing, and manipulating SVG icons
 */

// List of available SVG bank logos
export const BANK_LOGOS = [
  "agora-investimentos",
  "banco-bradesco",
  "banco-brasil",
  "banco-itau",
  "btg-pactual",
  "caixa-economica",
  "xp-investimentos",
];

/**
 * Load SVG content from the logos_bancos directory
 * @param {string} filename - The SVG filename without extension
 * @returns {Promise<string>} The SVG content as string
 */
export async function loadSvgContent(filename) {
  try {
    const response = await fetch(`/logos_bancos/${filename}.svg`);
    if (!response.ok) {
      throw new Error(`Falha ao carregar SVG: ${filename}`);
    }
    return await response.text();
  } catch (error) {
    console.error("Erro ao carregar SVG:", error);
    return null;
  }
}

/**
 * Parse SVG string and extract key attributes
 * @param {string} svgContent - The SVG content as string
 * @returns {Object} Parsed SVG data
 */
export function parseSvgContent(svgContent) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgContent, "image/svg+xml");
  const svgElement = doc.querySelector("svg");

  if (!svgElement) {
    return null;
  }

  return {
    element: svgElement,
    width: svgElement.getAttribute("width") || "240",
    height: svgElement.getAttribute("height") || "240",
    viewBox: svgElement.getAttribute("viewBox") || "0 0 240 240",
    originalContent: svgContent,
  };
}

/**
 * Apply size modifications to SVG
 * @param {string} svgContent - Original SVG content
 * @param {number} size - New size in pixels
 * @returns {string} Modified SVG content
 */
export function applySizeToSvg(svgContent, size) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgContent, "image/svg+xml");
  const svgElement = doc.querySelector("svg");

  if (!svgElement) return svgContent;

  svgElement.setAttribute("width", size.toString());
  svgElement.setAttribute("height", size.toString());

  return new XMLSerializer().serializeToString(doc);
}

/**
 * Apply color modifications to SVG
 * @param {string} svgContent - Original SVG content
 * @param {string} color - New color (hex, rgb, etc.)
 * @returns {string} Modified SVG content
 */
export function applyColorToSvg(svgContent, color) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgContent, "image/svg+xml");
  const svgElement = doc.querySelector("svg");

  if (!svgElement) return svgContent;

  // Set the color as a CSS custom property or direct style
  svgElement.style.color = color;

  // Also apply to elements that might use fill or stroke directly
  const pathElements = svgElement.querySelectorAll(
    "path, circle, rect, polygon, ellipse",
  );
  pathElements.forEach((element) => {
    // Only modify elements that use currentColor or have fill/stroke attributes
    const fill = element.getAttribute("fill");
    const stroke = element.getAttribute("stroke");

    if (fill && fill !== "none" && fill !== "transparent") {
      if (
        fill === "currentColor" ||
        fill.startsWith("#") ||
        fill.startsWith("rgb")
      ) {
        element.setAttribute("fill", color);
      }
    }

    if (stroke && stroke !== "none" && stroke !== "transparent") {
      if (
        stroke === "currentColor" ||
        stroke.startsWith("#") ||
        stroke.startsWith("rgb")
      ) {
        element.setAttribute("stroke", color);
      }
    }
  });

  return new XMLSerializer().serializeToString(doc);
}

/**
 * Apply both size and color modifications to SVG
 * @param {string} svgContent - Original SVG content
 * @param {number} size - New size in pixels
 * @param {string} color - New color
 * @returns {string} Modified SVG content
 */
export function applySvgModifications(svgContent, size, color) {
  let modifiedSvg = applySizeToSvg(svgContent, size);
  modifiedSvg = applyColorToSvg(modifiedSvg, color);
  return modifiedSvg;
}

/**
 * Format SVG content for display (pretty print)
 * @param {string} svgContent - SVG content to format
 * @returns {string} Formatted SVG content
 */
export function formatSvgContent(svgContent) {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgContent, "image/svg+xml");
    const serializer = new XMLSerializer();
    let formatted = serializer.serializeToString(doc);

    // Basic formatting - add line breaks and indentation
    formatted = formatted
      .replace(/></g, ">\n<")
      .replace(/^\s*\n/gm, "")
      .split("\n")
      .map((line, index) => {
        const depth =
          (line.match(/</g) || []).length - (line.match(/\//g) || []).length;
        const indent = "  ".repeat(Math.max(0, depth - 1));
        return indent + line.trim();
      })
      .join("\n");

    return formatted;
  } catch (error) {
    console.error("Erro ao formatar SVG:", error);
    return svgContent;
  }
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
export async function copyToClipboard(text) {
  try {
    // Check if text is valid
    if (!text || typeof text !== "string") {
      console.error("Texto inválido para copiar:", typeof text, text);
      return false;
    }

    // Check if clipboard API is available
    if (!navigator.clipboard) {
      console.error("API da área de transferência não disponível");
      // Fallback to older method
      try {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        return true;
      } catch (fallbackError) {
        console.error("Método de cópia alternativo falhou:", fallbackError);
        return false;
      }
    }

    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error("Falha ao copiar para área de transferência:", error);
    return false;
  }
}

/**
 * Get display name for bank logo filename
 * @param {string} filename - The filename without extension
 * @returns {string} Display name
 */
export function getBankDisplayName(filename) {
  const names = {
    "agora-investimentos": "Ágora Investimentos",
    "banco-bradesco": "Banco Bradesco",
    "banco-brasil": "Banco do Brasil",
    "banco-itau": "Banco Itaú",
    "btg-pactual": "BTG Pactual",
    "caixa-economica": "Caixa Econômica",
    "xp-investimentos": "XP Investimentos",
  };

  return (
    names[filename] ||
    filename.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  );
}
