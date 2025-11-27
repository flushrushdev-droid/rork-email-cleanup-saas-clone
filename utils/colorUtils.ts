/**
 * Color Utilities
 * 
 * Utilities for color manipulation and theme-aware color generation
 */

/**
 * Convert hex color to rgba with opacity
 * @param hex - Hex color string (e.g., '#FF3B30')
 * @param opacity - Opacity value between 0 and 1
 * @returns rgba color string
 */
export function hexToRgba(hex: string, opacity: number): string {
  // Remove # if present
  const color = hex.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * Blend two colors with a given ratio
 * @param color1 - First color (hex)
 * @param color2 - Second color (hex)
 * @param ratio - Blend ratio (0-1, where 0 = color1, 1 = color2)
 * @returns Blended hex color
 */
export function blendColors(color1: string, color2: string, ratio: number): string {
  const c1 = hexToRgb(color1);
  const c2 = hexToRgb(color2);
  
  const r = Math.round(c1.r + (c2.r - c1.r) * ratio);
  const g = Math.round(c1.g + (c2.g - c1.g) * ratio);
  const b = Math.round(c1.b + (c2.b - c1.b) * ratio);
  
  return rgbToHex(r, g, b);
}

/**
 * Convert hex to RGB object
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const color = hex.replace('#', '');
  return {
    r: parseInt(color.substring(0, 2), 16),
    g: parseInt(color.substring(2, 4), 16),
    b: parseInt(color.substring(4, 6), 16),
  };
}

/**
 * Convert RGB to hex
 */
function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('')}`;
}

