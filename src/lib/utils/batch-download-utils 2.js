/**
 * Batch Download Utilities
 * Functions for downloading multiple logos as a ZIP file
 */

import JSZip from "jszip";
import { createWebflowOptimizedSvg } from "./svg-utils.js";
import { getBankDisplayName } from "./svg-utils.js";

/**
 * Convert SVG to PNG blob
 * @param {string} svgContent - The SVG content as string
 * @param {number} size - The size in pixels (width and height)
 * @returns {Promise<Blob|null>} PNG blob or null on error
 */
async function svgToPngBlob(svgContent, size = 256) {
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

    // Create blob from SVG
    const svgBlob = new Blob([optimizedSvg], { type: "image/svg+xml" });
    const svgUrl = URL.createObjectURL(svgBlob);

    return new Promise((resolve) => {
      img.onload = () => {
        // Draw the image on canvas
        ctx.drawImage(img, 0, 0, size, size);

        // Convert canvas to PNG blob
        canvas.toBlob((blob) => {
          URL.revokeObjectURL(svgUrl);
          resolve(blob);
        }, "image/png");
      };

      img.onerror = () => {
        URL.revokeObjectURL(svgUrl);
        resolve(null);
      };

      img.src = svgUrl;
    });
  } catch (error) {
    console.error("Error converting SVG to PNG:", error);
    return null;
  }
}

/**
 * Download a single logo (SVG format)
 * @param {string} logoName - Name of the logo
 * @param {string} svgContent - The SVG content
 * @param {number} size - The size in pixels
 * @returns {boolean} Success status
 */
export function downloadSingleLogo(logoName, svgContent, size) {
  try {
    const optimizedSvg = createWebflowOptimizedSvg(svgContent);
    const filename = `${logoName}-${size}px.svg`;

    // Create a blob with the optimized SVG content
    const svgBlob = new Blob([optimizedSvg], {
      type: "image/svg+xml;charset=utf-8",
    });

    // Create download link
    const downloadUrl = URL.createObjectURL(svgBlob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = filename;

    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up
    URL.revokeObjectURL(downloadUrl);

    return true;
  } catch (error) {
    console.error("Error downloading single logo:", error);
    return false;
  }
}

/**
 * Download multiple logos as a ZIP file
 * @param {Array<{logoName: string, svgContent: string}>} logos - Array of logo objects
 * @param {number} size - The size in pixels for all logos
 * @param {string} format - Format to download ('svg' or 'png')
 * @returns {Promise<boolean>} Success status
 */
export async function downloadMultipleLogosAsZip(logos, size, format = "svg") {
  try {
    const zip = new JSZip();

    // Create a folder for the logos
    const folder = zip.folder("logos");

    if (format === "svg") {
      // Add SVG files to ZIP
      for (const { logoName, svgContent } of logos) {
        const optimizedSvg = createWebflowOptimizedSvg(svgContent);
        const filename = `${logoName}-${size}px.svg`;
        folder.file(filename, optimizedSvg);
      }
    } else if (format === "png") {
      // Convert each SVG to PNG and add to ZIP
      const conversionPromises = logos.map(async ({ logoName, svgContent }) => {
        const pngBlob = await svgToPngBlob(svgContent, size);
        if (pngBlob) {
          const filename = `${logoName}-${size}px.png`;
          folder.file(filename, pngBlob);
          return true;
        }
        return false;
      });

      const results = await Promise.all(conversionPromises);
      const failedCount = results.filter((r) => !r).length;

      if (failedCount > 0) {
        console.warn(`Failed to convert ${failedCount} logo(s) to PNG`);
      }
    }

    // Generate ZIP file
    const zipBlob = await zip.generateAsync({ type: "blob" });

    // Create download link
    const downloadUrl = URL.createObjectURL(zipBlob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `logos-${size}px-${format}.zip`;

    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up
    URL.revokeObjectURL(downloadUrl);

    return true;
  } catch (error) {
    console.error("Error creating ZIP file:", error);
    return false;
  }
}

/**
 * Download logos based on selection count
 * If only one logo is selected, download it directly
 * If multiple logos are selected, create a ZIP file
 * @param {Map<string, string>} selectedLogos - Map of logoName to svgContent
 * @param {number} size - The size in pixels
 * @param {string} format - Format to download ('svg' or 'png')
 * @returns {Promise<{success: boolean, count: number}>} Result object
 */
export async function downloadSelectedLogos(selectedLogos, size, format = "svg") {
  const count = selectedLogos.size;

  if (count === 0) {
    return { success: false, count: 0 };
  }

  if (count === 1) {
    // Single logo - download directly
    const [logoName, svgContent] = Array.from(selectedLogos.entries())[0];
    
    if (format === "svg") {
      const success = downloadSingleLogo(logoName, svgContent, size);
      return { success, count: 1 };
    } else {
      // For PNG, we need to convert
      const pngBlob = await svgToPngBlob(svgContent, size);
      if (pngBlob) {
        const filename = `${logoName}-${size}px.png`;
        const downloadUrl = URL.createObjectURL(pngBlob);
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(downloadUrl);
        return { success: true, count: 1 };
      }
      return { success: false, count: 1 };
    }
  }

  // Multiple logos - create ZIP
  const logosArray = Array.from(selectedLogos.entries()).map(([logoName, svgContent]) => ({
    logoName,
    svgContent,
  }));

  const success = await downloadMultipleLogosAsZip(logosArray, size, format);
  return { success, count };
}

/**
 * Get display names for selected logos
 * @param {Map<string, string>} selectedLogos - Map of logoName to svgContent
 * @returns {string[]} Array of display names
 */
export function getSelectedLogoNames(selectedLogos) {
  return Array.from(selectedLogos.keys()).map((logoName) =>
    getBankDisplayName(logoName)
  );
}

