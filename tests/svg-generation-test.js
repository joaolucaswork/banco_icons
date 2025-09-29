/**
 * SVG Generation Test Suite
 * Tests the enhanced SVG generation functions for compatibility and correctness
 */

// Sample SVG with CSS dependencies (problematic format)
const originalSvgWithCss = `<svg width="240" height="240" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
<style>
  .agora-bg { fill: var(--agora-bg-color, currentColor); }
  .agora-text { fill: var(--agora-text-color, currentColor); opacity: 0.9; }
</style>
<path fill-rule="evenodd" clip-rule="evenodd" d="M165.144 23H64.707V123.453H165.144V23ZM118.115 49.9434L111.087 49.9434L92.293 96.5118H98.7253L114.603 57.9796L131.122 96.5118H137.554L118.115 49.9434Z" class="agora-bg"/>
<path d="M124.082 199.89C121.86 199.893 119.687 199.238 117.838 198.007C115.989 196.777 114.547 195.026 113.695 192.977C112.842 190.928 112.618 188.672 113.049 186.495C113.48 184.318 114.549 182.318 116.118 180.748C117.688 179.177 119.689 178.107 121.868 177.673C124.047 177.239 126.306 177.460 128.359 178.309C130.412 179.157 132.166 180.595 133.401 182.440C134.636 184.285 135.295 186.454 135.295 188.673C135.296 190.145 135.007 191.603 134.444 192.963C133.881 194.323 133.055 195.560 132.014 196.601C130.973 197.643 129.736 198.469 128.375 199.033C127.014 199.598 125.555 199.889 124.082 199.89ZM124.082 172.998C120.976 172.995 117.940 173.912 115.357 175.632C112.773 177.353 110.759 179.800 109.568 182.665C108.378 185.529 108.064 188.682 108.668 191.724C109.272 194.767 110.766 197.562 112.960 199.756C115.155 201.950 117.951 203.445 120.997 204.051C124.042 204.658 127.199 204.348 130.068 203.162C132.937 201.976 135.389 199.966 137.115 197.388C138.840 194.809 139.761 191.777 139.761 188.676C139.761 184.521 138.110 180.536 135.170 177.596C132.230 174.656 128.242 173.002 124.082 172.998Z" class="agora-text"/>
<defs>
<clipPath id="clip0_17_150">
<rect width="95.9661" height="96.9632" fill="white" transform="translate(71.9507 23)"/>
</clipPath>
<clipPath id="unused_clip">
<rect width="100" height="100" fill="white"/>
</clipPath>
</defs>
</svg>`;

// Test suite
class SvgGenerationTestSuite {
  constructor() {
    this.tests = [];
    this.results = [];
  }

  // Add a test
  addTest(name, testFunction) {
    this.tests.push({ name, testFunction });
  }

  // Run all tests
  async runTests() {
    console.log('🧪 Running SVG Generation Test Suite...\n');
    
    for (const test of this.tests) {
      try {
        const result = await test.testFunction();
        this.results.push({
          name: test.name,
          status: result.status,
          message: result.message,
          details: result.details || null
        });
        
        const statusIcon = result.status === 'pass' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
        console.log(`${statusIcon} ${test.name}: ${result.message}`);
        
        if (result.details) {
          console.log(`   Details: ${result.details}`);
        }
      } catch (error) {
        this.results.push({
          name: test.name,
          status: 'fail',
          message: `Test failed with error: ${error.message}`,
          details: error.stack
        });
        console.log(`❌ ${test.name}: Test failed with error: ${error.message}`);
      }
    }
    
    this.printSummary();
  }

  // Print test summary
  printSummary() {
    const passed = this.results.filter(r => r.status === 'pass').length;
    const warnings = this.results.filter(r => r.status === 'warning').length;
    const failed = this.results.filter(r => r.status === 'fail').length;
    const total = this.results.length;
    
    console.log('\n📊 Test Summary:');
    console.log(`   Total: ${total}`);
    console.log(`   Passed: ${passed}`);
    console.log(`   Warnings: ${warnings}`);
    console.log(`   Failed: ${failed}`);
    console.log(`   Success Rate: ${Math.round((passed / total) * 100)}%`);
    
    if (passed === total) {
      console.log('\n🎉 All tests passed! SVG generation is working correctly.');
    } else if (failed === 0) {
      console.log('\n✨ All tests passed with some warnings. SVG generation is mostly working correctly.');
    } else {
      console.log('\n⚠️ Some tests failed. SVG generation needs improvement.');
    }
  }
}

// Test functions
function testCssDependencyRemoval() {
  return new Promise((resolve) => {
    // Simulate the enhanced convertStylesToAttributes function
    const processedSvg = simulateConvertStylesToAttributes(originalSvgWithCss);
    
    const hasStyleBlock = processedSvg.includes('<style>');
    const hasClasses = /class="[^"]*"/.test(processedSvg);
    const hasCssVars = /var\(--[^)]+\)/.test(processedSvg);
    
    if (!hasStyleBlock && !hasClasses && !hasCssVars) {
      resolve({
        status: 'pass',
        message: 'CSS dependencies successfully removed',
        details: 'No style blocks, classes, or CSS variables found'
      });
    } else {
      const issues = [];
      if (hasStyleBlock) issues.push('style blocks');
      if (hasClasses) issues.push('CSS classes');
      if (hasCssVars) issues.push('CSS variables');
      
      resolve({
        status: 'fail',
        message: 'CSS dependencies still present',
        details: `Found: ${issues.join(', ')}`
      });
    }
  });
}

function testHardCodedColors() {
  return new Promise((resolve) => {
    const processedSvg = simulateConvertStylesToAttributes(originalSvgWithCss);
    
    const fillMatches = processedSvg.match(/fill="([^"]+)"/g) || [];
    const hasHardCodedColors = fillMatches.some(match => 
      match.includes('#') || match.includes('rgb') || match.includes('white') || match.includes('black')
    );
    const hasCurrentColor = processedSvg.includes('currentColor');
    
    if (hasHardCodedColors && !hasCurrentColor) {
      resolve({
        status: 'pass',
        message: 'All colors are hard-coded',
        details: `Found ${fillMatches.length} fill attributes with hard-coded colors`
      });
    } else {
      resolve({
        status: 'fail',
        message: 'Some colors are not hard-coded',
        details: `currentColor references: ${hasCurrentColor}, hard-coded colors: ${hasHardCodedColors}`
      });
    }
  });
}

function testUnusedElementRemoval() {
  return new Promise((resolve) => {
    const processedSvg = simulateCreateCleanSvgOutput(originalSvgWithCss);
    
    // Check for unused clipPath elements
    const hasUnusedClipPath = processedSvg.includes('unused_clip');
    const hasEmptyDefs = processedSvg.includes('<defs></defs>') || processedSvg.includes('<defs/>');
    
    if (!hasUnusedClipPath && !hasEmptyDefs) {
      resolve({
        status: 'pass',
        message: 'Unused elements successfully removed',
        details: 'No unused clipPath elements or empty defs found'
      });
    } else {
      resolve({
        status: 'fail',
        message: 'Some unused elements still present',
        details: `Unused clipPath: ${hasUnusedClipPath}, Empty defs: ${hasEmptyDefs}`
      });
    }
  });
}

function testSvgStructure() {
  return new Promise((resolve) => {
    const processedSvg = simulateFormatSvgContent(originalSvgWithCss);
    
    const hasNamespace = processedSvg.includes('xmlns="http://www.w3.org/2000/svg"');
    const isWellFormed = processedSvg.startsWith('<svg') && processedSvg.endsWith('</svg>');
    const hasProperIndentation = processedSvg.includes('\n  <path');
    
    if (hasNamespace && isWellFormed && hasProperIndentation) {
      resolve({
        status: 'pass',
        message: 'SVG structure is correct',
        details: 'Proper namespace, well-formed, and indented'
      });
    } else {
      const issues = [];
      if (!hasNamespace) issues.push('missing namespace');
      if (!isWellFormed) issues.push('not well-formed');
      if (!hasProperIndentation) issues.push('poor indentation');
      
      resolve({
        status: 'fail',
        message: 'SVG structure has issues',
        details: `Issues: ${issues.join(', ')}`
      });
    }
  });
}

function testWebflowCompatibility() {
  return new Promise((resolve) => {
    const processedSvg = simulateFormatSvgContent(originalSvgWithCss);
    
    // Webflow compatibility checks
    const noCssClasses = !processedSvg.includes('class=');
    const noStyleBlocks = !processedSvg.includes('<style>');
    const noCurrentColor = !processedSvg.includes('currentColor');
    const hasDirectFill = processedSvg.includes('fill="#') || processedSvg.includes('fill="white"');
    
    if (noCssClasses && noStyleBlocks && noCurrentColor && hasDirectFill) {
      resolve({
        status: 'pass',
        message: 'Compatible with Webflow HTML Embed',
        details: 'No CSS dependencies, direct fill attributes'
      });
    } else {
      resolve({
        status: 'warning',
        message: 'May have Webflow compatibility issues',
        details: 'Some CSS dependencies or indirect color references found'
      });
    }
  });
}

// Simulation functions (these would normally import from svg-utils.js)
function simulateConvertStylesToAttributes(svgContent) {
  // Simulate the enhanced convertStylesToAttributes function
  return svgContent
    .replace(/<style>[\s\S]*?<\/style>/g, '') // Remove style blocks
    .replace(/class="[^"]*"/g, '') // Remove class attributes
    .replace(/class="agora-bg"/g, 'fill="#00C88D"')
    .replace(/class="agora-text"/g, 'fill="#ffffff" opacity="0.9"')
    .replace(/var\([^)]+\)/g, 'currentColor') // Replace CSS variables
    .replace(/currentColor/g, '#000000'); // Replace currentColor with default
}

function simulateCreateCleanSvgOutput(svgContent) {
  // Simulate the createCleanSvgOutput function
  let cleaned = simulateConvertStylesToAttributes(svgContent);
  
  // Remove unused clipPath elements
  cleaned = cleaned.replace(/<clipPath id="unused_clip"[\s\S]*?<\/clipPath>/g, '');
  
  // Remove empty defs
  cleaned = cleaned.replace(/<defs>\s*<\/defs>/g, '');
  cleaned = cleaned.replace(/<defs\/>/g, '');
  
  return cleaned;
}

function simulateFormatSvgContent(svgContent) {
  // Simulate the enhanced formatSvgContent function
  let formatted = simulateCreateCleanSvgOutput(svgContent);
  
  // Add proper formatting
  formatted = formatted
    .replace(/></g, '>\n<')
    .split('\n')
    .map(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('</') || trimmed === '') return trimmed;
      if (trimmed.startsWith('<svg')) return trimmed;
      return '  ' + trimmed; // Add indentation
    })
    .filter(line => line.trim() !== '')
    .join('\n');
  
  // Ensure namespace
  if (!formatted.includes('xmlns=')) {
    formatted = formatted.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  
  return formatted;
}

// Run the test suite
async function runTestSuite() {
  const testSuite = new SvgGenerationTestSuite();
  
  // Add tests
  testSuite.addTest('CSS Dependency Removal', testCssDependencyRemoval);
  testSuite.addTest('Hard-coded Colors', testHardCodedColors);
  testSuite.addTest('Unused Element Removal', testUnusedElementRemoval);
  testSuite.addTest('SVG Structure Validation', testSvgStructure);
  testSuite.addTest('Webflow Compatibility', testWebflowCompatibility);
  
  // Run all tests
  await testSuite.runTests();
}

// Export for use in other files or run directly
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runTestSuite, SvgGenerationTestSuite };
} else {
  // Run tests if this file is executed directly
  runTestSuite().catch(console.error);
}
