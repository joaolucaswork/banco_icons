/**
 * Original logos utility functions
 * Maps between modified logos and their original counterparts
 */

// Mapping between modified logo filenames and original logo filenames
export const ORIGINAL_LOGO_MAPPING = {
  "banco-itau": "Itau.svg",
  "banco-bradesco": "Bradesco.svg",
  "banco-brasil": "Banco do brasil.svg",
  "btg-pactual": "BTG.svg",
  "caixa-economica": "Caixa.svg",
  "xp-investimentos": "XP CORRETORA.svg",
  "agora-investimentos": "ÁGORA.svg",
};

/**
 * Load original SVG content from the logo_original directory
 * @param {string} modifiedLogoFilename - The modified logo filename without extension
 * @returns {Promise<string|null>} The original SVG content as string or null if not found
 */
export async function loadOriginalSvgContent(modifiedLogoFilename) {
  try {
    const originalFilename = ORIGINAL_LOGO_MAPPING[modifiedLogoFilename];

    if (!originalFilename) {
      console.warn(
        `No original logo mapping found for: ${modifiedLogoFilename}`,
      );
      return null;
    }

    const url = `/logo_original/${originalFilename}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `Failed to load original SVG: ${originalFilename} (${response.status})`,
      );
    }

    const content = await response.text();
    return content;
  } catch (error) {
    console.error("Error loading original SVG:", error);
    return null;
  }
}

/**
 * Check if an original logo exists for the given modified logo
 * @param {string} modifiedLogoFilename - The modified logo filename without extension
 * @returns {boolean} True if original logo exists, false otherwise
 */
export function hasOriginalLogo(modifiedLogoFilename) {
  return modifiedLogoFilename in ORIGINAL_LOGO_MAPPING;
}

/**
 * Get the original logo filename for a given modified logo
 * @param {string} modifiedLogoFilename - The modified logo filename without extension
 * @returns {string|null} The original logo filename or null if not found
 */
export function getOriginalLogoFilename(modifiedLogoFilename) {
  return ORIGINAL_LOGO_MAPPING[modifiedLogoFilename] || null;
}
