/**
 * SVG utility functions for loading, parsing, and manipulating SVG icons
 * Este módulo centraliza todas as operações relacionadas a SVG no projeto,
 * incluindo carregamento, parsing, modificações e formatação de ícones bancários
 */

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
    console.error("Erro ao carregar SVG:", error);
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
      console.error("❌ Texto inválido para copiar:", {
        type: typeof text,
        value: text,
        length: text?.length,
      });
      return false;
    }

    console.log("📋 Tentando copiar texto:", {
      length: text.length,
      preview: text.substring(0, 100) + (text.length > 100 ? "..." : ""),
    });

    // Check if we're in a secure context
    if (!window.isSecureContext) {
      console.warn(
        "⚠️ Contexto não seguro detectado - clipboard pode não funcionar",
      );
    }

    // Check if clipboard API is available
    if (!navigator.clipboard) {
      console.warn(
        "⚠️ API da área de transferência não disponível, usando método alternativo",
      );
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
          console.log("✅ Cópia bem-sucedida usando método alternativo");
          return true;
        } else {
          console.error(
            "❌ Método de cópia alternativo falhou - execCommand retornou false",
          );
          return false;
        }
      } catch (fallbackError) {
        console.error("❌ Método de cópia alternativo falhou:", {
          error: fallbackError.message,
          name: fallbackError.name,
          stack: fallbackError.stack,
        });
        return false;
      }
    }

    // Check if writeText is available
    if (!navigator.clipboard.writeText) {
      console.error("❌ navigator.clipboard.writeText não está disponível");
      return false;
    }

    // Try to copy using modern clipboard API
    await navigator.clipboard.writeText(text);
    console.log("✅ Cópia bem-sucedida usando API moderna do clipboard");
    return true;
  } catch (error) {
    console.error("❌ Falha ao copiar para área de transferência:", {
      error: error.message,
      name: error.name,
      stack: error.stack,
      isSecureContext: window.isSecureContext,
      clipboardAvailable: !!navigator.clipboard,
      writeTextAvailable: !!navigator.clipboard?.writeText,
    });

    // Try fallback method as last resort
    try {
      console.log("🔄 Tentando método de fallback como último recurso...");
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
        console.log("✅ Fallback bem-sucedido após erro da API moderna");
        return true;
      }
    } catch (fallbackError) {
      console.error("❌ Fallback também falhou:", fallbackError.message);
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

  console.log("🔍 Diagnóstico do Clipboard:", diagnosis);
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
 * Convert SVG to PNG and download it
 * @param {string} svgContent - The SVG content as string
 * @param {string} filename - The filename for the download (without extension)
 * @param {number} size - The size in pixels (width and height)
 * @returns {Promise<boolean>} Success status
 */
export async function downloadSvgAsPng(svgContent, filename, size = 256) {
  try {
    // Create a canvas element
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // Set canvas size
    canvas.width = size;
    canvas.height = size;

    // Create an image element
    const img = new Image();

    // Convert SVG to data URL
    const svgBlob = new Blob([svgContent], {
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
            console.error("Falha ao converter canvas para blob");
            resolve(false);
          }
        }, "image/png");
      };

      img.onerror = () => {
        console.error("Falha ao carregar SVG como imagem");
        URL.revokeObjectURL(svgUrl);
        resolve(false);
      };

      img.src = svgUrl;
    });
  } catch (error) {
    console.error("Erro ao converter SVG para PNG:", error);
    return false;
  }
}

/**
 * Download SVG content as a file
 * @param {string} svgContent - The SVG content as string
 * @param {string} filename - The filename for the download (without extension)
 * @returns {boolean} Success status
 */
export function downloadSvgAsFile(svgContent, filename) {
  try {
    // Create a blob with the SVG content
    const svgBlob = new Blob([svgContent], {
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
    console.error("Erro ao baixar SVG:", error);
    return false;
  }
}
