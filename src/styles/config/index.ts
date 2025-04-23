/**
 * Tailwind CSS Configuration Index
 * 
 * This file consolidates and exports all modular Tailwind configurations
 * to be used in the main tailwind.config.ts file.
 * 
 * This modularization helps reduce webpack cache serialization warnings
 * by breaking up large string literals into smaller, more manageable files.
 */

export { animations } from './animations';
export { keyframes } from './keyframes';
export { colors } from './colors';
export { fonts } from './fonts';
export { themes } from './themes';

// Additional configurations can be added here

/**
 * Helper function to create border utilities
 * Extracted from tailwind.config.ts
 */
export const createBorderUtilities = (
  svgToDataUri: (svg: string) => string,
  flattenColorPalette: (colors: Record<string, unknown>) => Record<string, string>,
  theme: (path: string) => Record<string, string>
) => {
  // Return the utilities object that was previously inside the plugin
  return {
    // Utility configuration here
    '.grid-pattern': {
      backgroundImage: `url("${svgToDataUri(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" fill="none" stroke="${theme(
          'colors.gray.200'
        )}"><path d="M0 .5H31.5V32"/></svg>`
      )}")`,
    },
    
    // Add other utility configurations as needed
  };
};

// Export other utility functions as needed
