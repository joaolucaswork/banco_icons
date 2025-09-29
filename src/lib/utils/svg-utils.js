/**
 * SVG utility functions for loading, parsing, and manipulating SVG icons
 * Este módulo centraliza todas as operações relacionadas a SVG no projeto,
 * incluindo carregamento, parsing, modificações e formatação de ícones bancários
 */

import { getPrimaryOriginalColor } from "./original-colors.js";

// Lista de logos bancários disponíveis no diretório /logos_bancos
// Cada entrada corresponde a um arquivo SVG específico
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
 * Carrega o conteúdo SVG do diretório logos_bancos
 * Faz uma requisição HTTP para buscar o arquivo SVG e retorna seu conteúdo como string
 *
 * @param {string} filename - Nome do arquivo SVG sem a extensão (.svg)
 * @returns {Promise<string>} O conteúdo SVG como string, ou null em caso de erro
 *
 * @example
 * const svgContent = await loadSvgContent('banco-itau');
 * // Retorna o conteúdo do arquivo /logos_bancos/banco-itau.svg
 */
export async function loadSvgContent(filename) {
  try {
    // Faz requisição para o arquivo SVG no diretório público
    const response = await fetch(`/logos_bancos/${filename}.svg`);

    // Verifica se a requisição foi bem-sucedida
    if (!response.ok) {
      throw new Error(`Falha ao carregar SVG: ${filename}`);
    }

    // Retorna o conteúdo do arquivo como texto
    return await response.text();
  } catch (error) {
    return null;
  }
}

/**
 * Faz o parsing do conteúdo SVG e extrai atributos essenciais
 * Utiliza DOMParser para converter string SVG em elemento DOM manipulável
 *
 * @param {string} svgContent - Conteúdo SVG como string
 * @returns {Object|null} Dados do SVG parseado com propriedades extraídas, ou null se inválido
 *
 * @example
 * const parsed = parseSvgContent('<svg width="100" height="100">...</svg>');
 * // Retorna: { element: SVGElement, width: "100", height: "100", viewBox: "0 0 240 240", originalContent: "..." }
 */
export function parseSvgContent(svgContent) {
  // Cria um parser DOM para processar o conteúdo SVG
  const parser = new DOMParser();

  // Converte a string SVG em documento XML
  const doc = parser.parseFromString(svgContent, "image/svg+xml");

  // Busca o elemento SVG raiz no documento
  const svgElement = doc.querySelector("svg");

  // Retorna null se não encontrar elemento SVG válido
  if (!svgElement) {
    return null;
  }

  // Retorna objeto com dados extraídos do SVG
  return {
    element: svgElement, // Elemento DOM do SVG
    width: svgElement.getAttribute("width") || "240", // Largura (padrão: 240px)
    height: svgElement.getAttribute("height") || "240", // Altura (padrão: 240px)
    viewBox: svgElement.getAttribute("viewBox") || "0 0 240 240", // ViewBox (padrão: 240x240)
    originalContent: svgContent, // Conteúdo original preservado
  };
}

/**
 * Aplica modificações de tamanho ao SVG
 * Modifica os atributos width e height do elemento SVG raiz
 *
 * @param {string} svgContent - Conteúdo SVG original
 * @param {number} size - Novo tamanho em pixels (aplicado tanto para largura quanto altura)
 * @returns {string} Conteúdo SVG modificado com novo tamanho
 *
 * @example
 * const resizedSvg = applySizeToSvg(originalSvg, 64);
 * // Retorna SVG com width="64" height="64"
 */
export function applySizeToSvg(svgContent, size) {
  // Parse do conteúdo SVG para manipulação DOM
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgContent, "image/svg+xml");
  const svgElement = doc.querySelector("svg");

  // Retorna conteúdo original se não encontrar elemento SVG
  if (!svgElement) return svgContent;

  // Define novos atributos de tamanho (quadrado: width = height)
  svgElement.setAttribute("width", size.toString());
  svgElement.setAttribute("height", size.toString());

  // Serializa o documento modificado de volta para string
  return new XMLSerializer().serializeToString(doc);
}

/**
 * Aplica modificações de cor ao SVG
 * Função complexa que lida com diferentes tipos de coloração:
 * - Propriedade CSS color para elementos que usam currentColor
 * - Tratamento especial para logo do Itaú com contraste automático de texto
 * - Modificação direta de atributos fill e stroke em elementos gráficos
 *
 * @param {string} svgContent - Conteúdo SVG original
 * @param {string} color - Nova cor (hex, rgb, etc.)
 * @returns {string} Conteúdo SVG modificado com nova cor aplicada
 *
 * @example
 * const coloredSvg = applyColorToSvg(originalSvg, '#ff0000');
 * // Aplica cor vermelha aos elementos coloráveis do SVG
 */
export function applyColorToSvg(svgContent, color) {
  // Parse do SVG para manipulação DOM
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgContent, "image/svg+xml");
  const svgElement = doc.querySelector("svg");

  if (!svgElement) return svgContent;

  // Define a cor como propriedade CSS no elemento raiz
  // Isso afeta elementos que usam 'currentColor'
  svgElement.style.color = color;

  // Tratamento especial para o logo do Itaú - contraste automático do texto
  const styleElement = svgElement.querySelector("style");
  if (styleElement && styleElement.textContent.includes("itau-text")) {
    // Importação assíncrona das utilidades de cor (para casos futuros)
    import("./color-utils.js").then(({ isDarkColor }) => {
      const textColor = isDarkColor(color) ? "white" : "black";
      svgElement.style.setProperty("--itau-auto-text-color", textColor);
    });

    // Fallback síncrono para aplicação imediata
    // Calcula luminância da cor para determinar contraste do texto
    const rgb = hexToRgb(color);
    const luminance = calculateLuminance(rgb);
    const textColor = luminance < 0.179 ? "white" : "black";
    svgElement.style.setProperty("--itau-auto-text-color", textColor);
  }

  // Aplica cor diretamente aos elementos gráficos que podem usar fill ou stroke
  // Busca todos os elementos gráficos SVG que podem ter cor
  const pathElements = svgElement.querySelectorAll(
    "path, circle, rect, polygon, ellipse",
  );

  pathElements.forEach((element) => {
    // Obtém os atributos de preenchimento e contorno atuais
    const fill = element.getAttribute("fill");
    const stroke = element.getAttribute("stroke");

    // Modifica o preenchimento (fill) se aplicável
    if (fill && fill !== "none" && fill !== "transparent") {
      // Só modifica se for currentColor ou uma cor específica (hex/rgb)
      if (
        fill === "currentColor" ||
        fill.startsWith("#") ||
        fill.startsWith("rgb")
      ) {
        element.setAttribute("fill", color);
      }
    }

    // Modifica o contorno (stroke) se aplicável
    if (stroke && stroke !== "none" && stroke !== "transparent") {
      // Só modifica se for currentColor ou uma cor específica (hex/rgb)
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

// Helper functions for color calculations (duplicated to avoid circular imports)
/**
 * @param {string} hex
 * @returns {{r: number, g: number, b: number}}
 */
function hexToRgb(hex) {
  const cleanHex = hex.replace("#", "");

  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16);
    const g = parseInt(cleanHex[1] + cleanHex[1], 16);
    const b = parseInt(cleanHex[2] + cleanHex[2], 16);
    return { r, g, b };
  }

  if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return { r, g, b };
  }

  return { r: 0, g: 0, b: 0 };
}

/**
 * @param {{r: number, g: number, b: number}} rgb
 * @returns {number}
 */
function calculateLuminance(rgb) {
  const { r, g, b } = rgb;

  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const rLinear =
    rNorm <= 0.03928 ? rNorm / 12.92 : Math.pow((rNorm + 0.055) / 1.055, 2.4);
  const gLinear =
    gNorm <= 0.03928 ? gNorm / 12.92 : Math.pow((gNorm + 0.055) / 1.055, 2.4);
  const bLinear =
    bNorm <= 0.03928 ? bNorm / 12.92 : Math.pow((bNorm + 0.055) / 1.055, 2.4);

  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
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
 * Convert CSS styles to inline attributes for better clipboard compatibility
 * This ensures that colors applied via CSS properties are preserved when copying
 * Enhanced version that completely removes CSS dependencies and creates self-contained SVGs
 * @param {string} svgContent - SVG content with CSS styles
 * @returns {string} SVG content with styles converted to attributes and CSS removed
 */
export function convertStylesToAttributes(svgContent) {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgContent, "image/svg+xml");
    const svgElement = doc.querySelector("svg");

    if (!svgElement) return svgContent;

    // Get the root color from inline styles
    const rootColor = svgElement.style.color;

    // Handle CSS custom properties (for multi-color SVGs like Itaú)
    const customProperties = new Map();
    for (let i = 0; i < svgElement.style.length; i++) {
      const property = svgElement.style[i];
      if (property.startsWith("--")) {
        const value = svgElement.style.getPropertyValue(property);
        customProperties.set(property, value);
      }
    }

    // Get the style element to understand CSS rules
    const styleElement = svgElement.querySelector("style");
    let cssRules = new Map();

    if (styleElement) {
      const cssText = styleElement.textContent || "";

      // Enhanced CSS parsing to handle multiple properties per rule
      const ruleMatches = cssText.match(/\.[\w-]+\s*\{[^}]+\}/g);
      if (ruleMatches) {
        ruleMatches.forEach((rule) => {
          const classMatch = rule.match(/\.([\w-]+)/);
          if (!classMatch) return;

          const className = classMatch[1];
          const ruleContent = rule.match(/\{([^}]+)\}/)?.[1] || "";

          // Parse all CSS properties in the rule
          const properties = {};

          // Extract fill property
          const fillMatch = ruleContent.match(/fill:\s*([^;]+)/);
          if (fillMatch) {
            let fillValue = fillMatch[1].trim();

            // Handle CSS variables in fill values
            const varMatch = fillValue.match(
              /var\((--[\w-]+)(?:,\s*([^)]+))?\)/,
            );
            if (varMatch) {
              const varName = varMatch[1];
              const fallback = varMatch[2] || "currentColor";
              fillValue = customProperties.get(varName) || fallback;
            }

            // Handle currentColor
            if (fillValue === "currentColor" && rootColor) {
              fillValue = rootColor;
            }

            properties.fill = fillValue;
          }

          // Extract opacity property
          const opacityMatch = ruleContent.match(/opacity:\s*([^;]+)/);
          if (opacityMatch) {
            properties.opacity = opacityMatch[1].trim();
          }

          // Extract stroke property
          const strokeMatch = ruleContent.match(/stroke:\s*([^;]+)/);
          if (strokeMatch) {
            let strokeValue = strokeMatch[1].trim();

            // Handle CSS variables in stroke values
            const varMatch = strokeValue.match(
              /var\((--[\w-]+)(?:,\s*([^)]+))?\)/,
            );
            if (varMatch) {
              const varName = varMatch[1];
              const fallback = varMatch[2] || "currentColor";
              strokeValue = customProperties.get(varName) || fallback;
            }

            // Handle currentColor
            if (strokeValue === "currentColor" && rootColor) {
              strokeValue = rootColor;
            }

            properties.stroke = strokeValue;
          }

          // Extract stroke-width property
          const strokeWidthMatch = ruleContent.match(/stroke-width:\s*([^;]+)/);
          if (strokeWidthMatch) {
            properties["stroke-width"] = strokeWidthMatch[1].trim();
          }

          cssRules.set(className, properties);
        });
      }
    }

    // Apply CSS properties to elements and remove classes
    const allElements = svgElement.querySelectorAll("*");

    allElements.forEach((element) => {
      // Skip style elements
      if (element.tagName.toLowerCase() === "style") return;

      // Handle elements with currentColor fill attribute
      if (element.getAttribute("fill") === "currentColor" && rootColor) {
        element.setAttribute("fill", rootColor);
      }

      // Handle elements with currentColor stroke attribute
      if (element.getAttribute("stroke") === "currentColor" && rootColor) {
        element.setAttribute("stroke", rootColor);
      }

      // Handle elements with CSS classes
      if (element.classList.length > 0) {
        const classesToRemove = [];

        for (const className of element.classList) {
          if (cssRules.has(className)) {
            const properties = cssRules.get(className);

            // Apply fill property
            if (properties.fill && properties.fill !== "currentColor") {
              if (
                !element.getAttribute("fill") ||
                element.getAttribute("fill") === "currentColor"
              ) {
                element.setAttribute("fill", properties.fill);
              }
            }

            // Apply opacity property
            if (properties.opacity) {
              if (!element.getAttribute("opacity")) {
                element.setAttribute("opacity", properties.opacity);
              }
            }

            // Apply stroke property
            if (properties.stroke && properties.stroke !== "currentColor") {
              if (
                !element.getAttribute("stroke") ||
                element.getAttribute("stroke") === "currentColor"
              ) {
                element.setAttribute("stroke", properties.stroke);
              }
            }

            // Apply stroke-width property
            if (properties["stroke-width"]) {
              if (!element.getAttribute("stroke-width")) {
                element.setAttribute(
                  "stroke-width",
                  properties["stroke-width"],
                );
              }
            }

            // Mark class for removal
            classesToRemove.push(className);
          }
        }

        // Remove CSS classes that have been converted to attributes
        classesToRemove.forEach((className) => {
          element.classList.remove(className);
        });

        // Remove class attribute if no classes remain
        if (element.classList.length === 0) {
          element.removeAttribute("class");
        }
      }
    });

    // Remove the style element completely
    if (styleElement) {
      styleElement.remove();
    }

    // Clear inline styles from root element since we've converted them to attributes
    svgElement.removeAttribute("style");

    return new XMLSerializer().serializeToString(doc);
  } catch (error) {
    return svgContent;
  }
}

/**
 * Create completely clean, self-contained SVG output similar to Figma exports
 * Removes all CSS dependencies, unused elements, and ensures compatibility with external platforms
 * @param {string} svgContent - Original SVG content
 * @returns {string} Clean, self-contained SVG content
 */
export function createCleanSvgOutput(svgContent) {
  try {
    // First convert all CSS styles to attributes
    let cleanSvg = convertStylesToAttributes(svgContent);

    const parser = new DOMParser();
    const doc = parser.parseFromString(cleanSvg, "image/svg+xml");
    const svgElement = doc.querySelector("svg");

    if (!svgElement) return svgContent;

    // Comprehensive removal of unused SVG elements
    removeUnusedSvgElements(svgElement);

    // Ensure all colors are hard-coded (no currentColor references)
    const allElements = svgElement.querySelectorAll("*");
    allElements.forEach((element) => {
      // Replace any remaining currentColor with a default color
      if (element.getAttribute("fill") === "currentColor") {
        element.setAttribute("fill", "#000000"); // Default to black
      }
      if (element.getAttribute("stroke") === "currentColor") {
        element.setAttribute("stroke", "#000000"); // Default to black
      }
    });

    // Remove any remaining empty attributes
    allElements.forEach((element) => {
      const attributes = Array.from(element.attributes);
      attributes.forEach((attr) => {
        if (!attr.value || attr.value.trim() === "") {
          element.removeAttribute(attr.name);
        }
      });
    });

    return new XMLSerializer().serializeToString(doc);
  } catch (error) {
    return svgContent;
  }
}

/**
 * Remove unused SVG elements to create cleaner, more optimized output
 * @param {Element} svgElement - The SVG DOM element to clean
 */
function removeUnusedSvgElements(svgElement) {
  // Track all referenced IDs
  const referencedIds = new Set();
  const allElements = svgElement.querySelectorAll("*");

  // Find all ID references in various attributes
  allElements.forEach((element) => {
    // Check clip-path references
    const clipPath = element.getAttribute("clip-path");
    if (clipPath) {
      const match = clipPath.match(/url\(#([^)]+)\)/);
      if (match) referencedIds.add(match[1]);
    }

    // Check mask references
    const mask = element.getAttribute("mask");
    if (mask) {
      const match = mask.match(/url\(#([^)]+)\)/);
      if (match) referencedIds.add(match[1]);
    }

    // Check filter references
    const filter = element.getAttribute("filter");
    if (filter) {
      const match = filter.match(/url\(#([^)]+)\)/);
      if (match) referencedIds.add(match[1]);
    }

    // Check fill references (gradients, patterns)
    const fill = element.getAttribute("fill");
    if (fill && fill.startsWith("url(#")) {
      const match = fill.match(/url\(#([^)]+)\)/);
      if (match) referencedIds.add(match[1]);
    }

    // Check stroke references
    const stroke = element.getAttribute("stroke");
    if (stroke && stroke.startsWith("url(#")) {
      const match = stroke.match(/url\(#([^)]+)\)/);
      if (match) referencedIds.add(match[1]);
    }

    // Check href/xlink:href references
    const href =
      element.getAttribute("href") || element.getAttribute("xlink:href");
    if (href && href.startsWith("#")) {
      referencedIds.add(href.substring(1));
    }
  });

  // Remove unused elements from defs
  const defsElements = svgElement.querySelectorAll("defs");
  defsElements.forEach((defs) => {
    const childElements = Array.from(defs.children);

    childElements.forEach((child) => {
      const id = child.getAttribute("id");
      if (id && !referencedIds.has(id)) {
        child.remove();
      }
    });

    // Remove defs element if it's empty
    if (defs.children.length === 0) {
      defs.remove();
    }
  });

  // Remove unused elements outside of defs (gradients, patterns, etc.)
  const potentiallyUnusedElements = svgElement.querySelectorAll(
    "linearGradient, radialGradient, pattern, clipPath, mask, filter",
  );

  potentiallyUnusedElements.forEach((element) => {
    const id = element.getAttribute("id");
    if (id && !referencedIds.has(id)) {
      element.remove();
    }
  });

  // Remove empty groups that don't contribute to the visual output
  const groups = svgElement.querySelectorAll("g");
  groups.forEach((group) => {
    // Check if group has any visual children or useful attributes
    const hasVisualChildren = group.querySelector(
      "path, circle, rect, polygon, ellipse, line, polyline, text, image, use",
    );
    const hasTransform = group.getAttribute("transform");
    const hasClipPath = group.getAttribute("clip-path");
    const hasMask = group.getAttribute("mask");
    const hasFilter = group.getAttribute("filter");
    const hasOpacity = group.getAttribute("opacity");
    const hasFill = group.getAttribute("fill");
    const hasStroke = group.getAttribute("stroke");

    // Remove group if it has no visual children and no useful attributes
    if (
      !hasVisualChildren &&
      !hasTransform &&
      !hasClipPath &&
      !hasMask &&
      !hasFilter &&
      !hasOpacity &&
      !hasFill &&
      !hasStroke
    ) {
      group.remove();
    }
  });

  // Remove comments and processing instructions
  const walker = document.createTreeWalker(
    svgElement,
    NodeFilter.SHOW_COMMENT | NodeFilter.SHOW_PROCESSING_INSTRUCTION,
    null,
    false,
  );

  const nodesToRemove = [];
  let node;
  while ((node = walker.nextNode())) {
    nodesToRemove.push(node);
  }

  nodesToRemove.forEach((node) => {
    node.remove();
  });
}

/**
 * Format SVG content for display (pretty print)
 * Enhanced version with better formatting for clean output
 * @param {string} svgContent - SVG content to format
 * @returns {string} Formatted SVG content
 */
export function formatSvgContent(svgContent) {
  try {
    // Create completely clean SVG output first
    let processedSvg = createCleanSvgOutput(svgContent);

    const parser = new DOMParser();
    const doc = parser.parseFromString(processedSvg, "image/svg+xml");
    const serializer = new XMLSerializer();
    let formatted = serializer.serializeToString(doc);

    // Enhanced formatting with better attribute ordering and spacing
    formatted = formatted
      .replace(/></g, ">\n<")
      .replace(/^\s*\n/gm, "")
      .split("\n")
      .map((line, index) => {
        const trimmed = line.trim();
        if (!trimmed) return "";

        // Calculate indentation depth
        let depth = 0;
        if (trimmed.startsWith("</")) {
          // Closing tag
          depth = Math.max(0, (trimmed.match(/</g) || []).length - 1);
        } else if (trimmed.startsWith("<") && !trimmed.endsWith("/>")) {
          // Opening tag
          depth = (trimmed.match(/</g) || []).length - 1;
        } else {
          // Self-closing or content
          depth =
            (trimmed.match(/</g) || []).length -
            (trimmed.match(/\//g) || []).length;
        }

        const indent = "  ".repeat(Math.max(0, depth));

        // Optimize attribute ordering for better readability
        if (trimmed.includes(" ")) {
          const optimized = optimizeAttributeOrder(trimmed);
          return indent + optimized;
        }

        return indent + trimmed;
      })
      .filter((line) => line.trim() !== "")
      .join("\n");

    // Final cleanup and validation
    formatted = finalizeFormattedSvg(formatted);

    return formatted;
  } catch (error) {
    return svgContent;
  }
}

/**
 * Optimize attribute ordering in SVG elements for better readability
 * @param {string} elementString - SVG element as string
 * @returns {string} Element with optimized attribute order
 */
function optimizeAttributeOrder(elementString) {
  try {
    // Define preferred attribute order
    const attributeOrder = [
      "width",
      "height",
      "viewBox",
      "fill",
      "stroke",
      "stroke-width",
      "opacity",
      "d",
      "fill-rule",
      "clip-rule",
      "transform",
      "id",
      "class",
    ];

    // Extract tag name and attributes
    const tagMatch = elementString.match(/^<(\w+)([^>]*)>?/);
    if (!tagMatch) return elementString;

    const tagName = tagMatch[1];
    const attributesString = tagMatch[2];
    const isSelfClosing = elementString.endsWith("/>");

    // Parse attributes
    const attributes = new Map();
    const attrRegex = /(\w+(?:-\w+)*)=["']([^"']*)["']/g;
    let match;

    while ((match = attrRegex.exec(attributesString)) !== null) {
      attributes.set(match[1], match[2]);
    }

    // Sort attributes according to preferred order
    const sortedAttrs = [];

    // Add attributes in preferred order
    attributeOrder.forEach((attrName) => {
      if (attributes.has(attrName)) {
        sortedAttrs.push(`${attrName}="${attributes.get(attrName)}"`);
        attributes.delete(attrName);
      }
    });

    // Add remaining attributes alphabetically
    const remainingAttrs = Array.from(attributes.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, value]) => `${name}="${value}"`);

    sortedAttrs.push(...remainingAttrs);

    // Reconstruct element
    const attrString =
      sortedAttrs.length > 0 ? " " + sortedAttrs.join(" ") : "";
    return `<${tagName}${attrString}${isSelfClosing ? "/>" : ">"}`;
  } catch (error) {
    return elementString;
  }
}

/**
 * Final cleanup and validation of formatted SVG
 * @param {string} formattedSvg - The formatted SVG string
 * @returns {string} Final cleaned SVG string
 */
function finalizeFormattedSvg(formattedSvg) {
  try {
    // Ensure proper XML declaration and namespace
    let finalSvg = formattedSvg;

    // Ensure xmlns attribute is present
    if (!finalSvg.includes('xmlns="http://www.w3.org/2000/svg"')) {
      finalSvg = finalSvg.replace(
        /<svg([^>]*)>/,
        '<svg$1 xmlns="http://www.w3.org/2000/svg">',
      );
    }

    // Remove any duplicate xmlns attributes
    finalSvg = finalSvg.replace(
      /xmlns="http:\/\/www\.w3\.org\/2000\/svg"\s+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/g,
      'xmlns="http://www.w3.org/2000/svg"',
    );

    // Ensure proper spacing around attributes
    finalSvg = finalSvg.replace(/(\w+)=([^"\s]+)/g, '$1="$2"');

    // Clean up any double spaces
    finalSvg = finalSvg.replace(/\s+/g, " ");

    // Ensure consistent line endings
    finalSvg = finalSvg.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

    // Remove any trailing whitespace from lines
    finalSvg = finalSvg
      .split("\n")
      .map((line) => line.trimEnd())
      .join("\n");

    // Ensure the SVG ends with a newline
    if (!finalSvg.endsWith("\n")) {
      finalSvg += "\n";
    }

    return finalSvg;
  } catch (error) {
    return formattedSvg;
  }
}

/**
 * Group text elements that are positioned close together
 * This helps keep text letters together as cohesive groups instead of separate elements
 * @param {Element} svgElement - The SVG DOM element to process
 */
function groupTextElements(svgElement) {
  try {
    // Get all path elements that could be text
    const allPaths = Array.from(svgElement.querySelectorAll("path"));

    // Group paths by their vertical position (Y coordinate) to identify text lines
    const textGroups = new Map();

    allPaths.forEach((path) => {
      const d = path.getAttribute("d");
      if (!d) return;

      // Extract the first Y coordinate from the path data
      const yMatch = d.match(/M[^,]*,?\s*(\d+(?:\.\d+)?)/);
      if (!yMatch) return;

      const yPosition = parseFloat(yMatch[1]);

      // Check if this looks like a text element based on position and complexity
      const hasTextLikeCommands =
        d.includes("M") &&
        (d.includes("C") || d.includes("L")) &&
        d.includes("Z");
      const isInTextArea = yPosition > 160; // Text typically appears in lower portion of logos
      const hasReasonableComplexity = d.length > 50 && d.length < 2000; // Text paths have moderate complexity

      if (hasTextLikeCommands && isInTextArea && hasReasonableComplexity) {
        // Group by approximate Y position (within 10 units = same text line)
        const groupKey = Math.round(yPosition / 10) * 10;

        if (!textGroups.has(groupKey)) {
          textGroups.set(groupKey, []);
        }
        textGroups.get(groupKey).push(path);
      }
    });

    // Create groups for text lines that have multiple elements
    textGroups.forEach((paths, yPosition) => {
      if (paths.length > 1) {
        // Sort paths by X position to maintain reading order
        paths.sort((a, b) => {
          const aX = parseFloat(
            a.getAttribute("d").match(/M\s*(\d+(?:\.\d+)?)/)?.[1] || "0",
          );
          const bX = parseFloat(
            b.getAttribute("d").match(/M\s*(\d+(?:\.\d+)?)/)?.[1] || "0",
          );
          return aX - bX;
        });

        // Create a group for this text line
        const textGroup = svgElement.ownerDocument.createElementNS(
          "http://www.w3.org/2000/svg",
          "g",
        );
        textGroup.setAttribute("data-text-group", "true");
        textGroup.setAttribute("data-text-line", yPosition.toString());

        // Insert the group before the first text path
        const firstPath = paths[0];
        const parent = firstPath.parentNode;
        parent.insertBefore(textGroup, firstPath);

        // Move all paths in this line into the group
        paths.forEach((path) => {
          textGroup.appendChild(path);
        });
      }
    });
  } catch (error) {
    // If grouping fails, continue without grouping
    console.warn("Text grouping failed:", error);
  }
}

/**
 * Create Webflow-optimized SVG with responsive dimensions
 * Generates SVG code specifically for Webflow HTML Embed elements with controllable sizing
 * @param {string} svgContent - Original SVG content
 * @returns {string} Webflow-optimized SVG content with responsive dimensions
 */
export function createWebflowOptimizedSvg(svgContent) {
  try {
    // First create clean SVG output
    let webflowSvg = createCleanSvgOutput(svgContent);

    const parser = new DOMParser();
    const doc = parser.parseFromString(webflowSvg, "image/svg+xml");
    const svgElement = doc.querySelector("svg");

    if (!svgElement) return svgContent;

    // Group text elements for better organization
    groupTextElements(svgElement);

    // Make SVG responsive for Webflow
    // Remove fixed width and height attributes to allow Webflow controls to work
    svgElement.removeAttribute("width");
    svgElement.removeAttribute("height");

    // Ensure viewBox is present for proper scaling
    if (!svgElement.getAttribute("viewBox")) {
      // Default viewBox based on common logo dimensions
      svgElement.setAttribute("viewBox", "0 0 240 240");
    }

    // Add responsive attributes for better Webflow compatibility
    svgElement.setAttribute("preserveAspectRatio", "xMidYMid meet");

    // Add CSS-friendly attributes for Webflow styling
    svgElement.setAttribute(
      "style",
      "width: 100%; height: 100%; display: block;",
    );

    return new XMLSerializer().serializeToString(doc);
  } catch (error) {
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
      return false;
    }

    // Check if we're in a secure context
    if (!window.isSecureContext) {
      // Context is not secure, clipboard may not work
    }

    // Check if clipboard API is available
    if (!navigator.clipboard) {
      // Fallback to older method
      try {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        const successful = document.execCommand("copy");
        document.body.removeChild(textArea);

        if (successful) {
          return true;
        } else {
          return false;
        }
      } catch (fallbackError) {
        return false;
      }
    }

    // Check if writeText is available
    if (!navigator.clipboard.writeText) {
      return false;
    }

    // Try to copy using modern clipboard API
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    // Try fallback method as last resort
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);

      if (successful) {
        return true;
      }
    } catch (fallbackError) {
      // Fallback failed
    }

    return false;
  }
}

/**
 * Diagnose clipboard capabilities and environment
 * @returns {Object} Diagnostic information
 */
export function diagnoseClipboard() {
  const diagnosis = {
    isSecureContext: window.isSecureContext,
    protocol: window.location.protocol,
    hostname: window.location.hostname,
    clipboardAPI: !!navigator.clipboard,
    writeTextAPI: !!navigator.clipboard?.writeText,
    execCommandSupported: document.queryCommandSupported
      ? document.queryCommandSupported("copy")
      : "unknown",
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
  };

  return diagnosis;
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

/**
 * Get default color for a logo based on its original colors
 * @param {string} logoName - Name of the logo
 * @returns {string} Default color for the logo
 */
export function getDefaultLogoColor(logoName) {
  // Use original primary color if available, otherwise fallback to white
  return getPrimaryOriginalColor(logoName) || "#ffffff";
}

/**
 * Convert SVG to PNG and download it with Webflow optimization
 * @param {string} svgContent - The SVG content as string
 * @param {string} filename - The filename for the download (without extension)
 * @param {number} size - The size in pixels (width and height)
 * @returns {Promise<boolean>} Success status
 */
export async function downloadSvgAsPng(svgContent, filename, size = 256) {
  try {
    // Optimize SVG for better rendering
    const optimizedSvg = createWebflowOptimizedSvg(svgContent);

    // Create a canvas element
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // Set canvas size
    canvas.width = size;
    canvas.height = size;

    // Create an image element
    const img = new Image();

    // Convert optimized SVG to data URL
    const svgBlob = new Blob([optimizedSvg], {
      type: "image/svg+xml;charset=utf-8",
    });
    const svgUrl = URL.createObjectURL(svgBlob);

    return new Promise((resolve) => {
      img.onload = () => {
        // Draw the image on canvas
        ctx.drawImage(img, 0, 0, size, size);

        // Convert canvas to PNG blob
        canvas.toBlob((blob) => {
          if (blob) {
            // Create download link
            const downloadUrl = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = downloadUrl;
            link.download = `${filename}.png`;

            // Trigger download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Clean up URLs
            URL.revokeObjectURL(downloadUrl);
            URL.revokeObjectURL(svgUrl);

            resolve(true);
          } else {
            resolve(false);
          }
        }, "image/png");
      };

      img.onerror = () => {
        URL.revokeObjectURL(svgUrl);
        resolve(false);
      };

      img.src = svgUrl;
    });
  } catch (error) {
    return false;
  }
}

/**
 * Download SVG content as a file with Webflow optimization
 * @param {string} svgContent - The SVG content as string
 * @param {string} filename - The filename for the download (without extension)
 * @returns {boolean} Success status
 */
export function downloadSvgAsFile(svgContent, filename) {
  try {
    // Optimize SVG for better compatibility
    const optimizedSvg = createWebflowOptimizedSvg(svgContent);

    // Create a blob with the optimized SVG content
    const svgBlob = new Blob([optimizedSvg], {
      type: "image/svg+xml;charset=utf-8",
    });

    // Create download link
    const downloadUrl = URL.createObjectURL(svgBlob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `${filename}.svg`;

    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up URL
    URL.revokeObjectURL(downloadUrl);

    return true;
  } catch (error) {
    return false;
  }
}
