/**
 * Tests for SVG utilities, specifically the convertStylesToAttributes function
 */

import { describe, it, expect } from 'vitest';
import { convertStylesToAttributes, applyColorToSvg } from './svg-utils.js';

describe('SVG Utils - Color Preservation', () => {
  it('should convert currentColor to actual color values', () => {
    const svgWithCurrentColor = `
      <svg width="240" height="240" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill="currentColor" d="M120 60L180 180H60L120 60Z"/>
      </svg>
    `;

    // Apply a color first
    const coloredSvg = applyColorToSvg(svgWithCurrentColor, '#ff0000');
    
    // Then convert styles to attributes
    const result = convertStylesToAttributes(coloredSvg);
    
    // The result should have the actual color instead of currentColor
    expect(result).toContain('fill="#ff0000"');
    expect(result).not.toContain('fill="currentColor"');
  });

  it('should handle CSS classes with currentColor', () => {
    const svgWithClasses = `
      <svg width="240" height="240" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>
          .test-class { fill: currentColor; }
        </style>
        <path class="test-class" d="M120 60L180 180H60L120 60Z"/>
      </svg>
    `;

    // Apply a color first
    const coloredSvg = applyColorToSvg(svgWithClasses, '#00ff00');
    
    // Then convert styles to attributes
    const result = convertStylesToAttributes(coloredSvg);
    
    // The result should have the actual color applied to the path
    expect(result).toContain('fill="#00ff00"');
  });

  it('should handle CSS variables', () => {
    const svgWithVariables = `
      <svg width="240" height="240" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>
          .bg-class { fill: var(--bg-color, currentColor); }
        </style>
        <path class="bg-class" d="M120 60L180 180H60L120 60Z"/>
      </svg>
    `;

    // Simulate applying a CSS variable (this would normally be done by applyMultipleColors)
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgWithVariables, "image/svg+xml");
    const svgElement = doc.querySelector("svg");
    svgElement.style.setProperty("--bg-color", "#0000ff");
    const modifiedSvg = new XMLSerializer().serializeToString(doc);
    
    // Then convert styles to attributes
    const result = convertStylesToAttributes(modifiedSvg);
    
    // The result should have the actual color applied
    expect(result).toContain('fill="#0000ff"');
  });

  it('should preserve existing fill attributes', () => {
    const svgWithExistingFill = `
      <svg width="240" height="240" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill="#123456" d="M120 60L180 180H60L120 60Z"/>
        <path fill="currentColor" d="M60 120L180 120L120 180L60 120Z"/>
      </svg>
    `;

    // Apply a color
    const coloredSvg = applyColorToSvg(svgWithExistingFill, '#ff0000');
    
    // Convert styles to attributes
    const result = convertStylesToAttributes(coloredSvg);
    
    // Should preserve the existing fill and convert currentColor
    expect(result).toContain('fill="#123456"');
    expect(result).toContain('fill="#ff0000"');
    expect(result).not.toContain('fill="currentColor"');
  });

  it('should remove inline styles from root element', () => {
    const svgWithInlineStyles = `
      <svg width="240" height="240" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill="currentColor" d="M120 60L180 180H60L120 60Z"/>
      </svg>
    `;

    // Apply a color (this adds inline styles)
    const coloredSvg = applyColorToSvg(svgWithInlineStyles, '#ff0000');
    
    // Verify that inline styles were added
    expect(coloredSvg).toContain('style="color: rgb(255, 0, 0)');
    
    // Convert styles to attributes
    const result = convertStylesToAttributes(coloredSvg);
    
    // Should not contain inline styles on the root element
    expect(result).not.toContain('style="color:');
    expect(result).not.toContain('style="color: rgb(255, 0, 0)');
    
    // But should have the color applied to the path
    expect(result).toContain('fill="#ff0000"');
  });
});
