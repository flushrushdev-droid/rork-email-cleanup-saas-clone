import { Platform } from 'react-native';

/**
 * Typography utility for Dynamic Type support
 * Provides font sizes that scale with the user's accessibility settings
 */

/**
 * iOS Dynamic Type text styles (mapped to base font sizes)
 * These correspond to iOS UIFontTextStyle categories
 */
export const iOSDynamicTypeStyles = {
  // Large text styles (for headings)
  largeTitle: 34,
  title1: 28,
  title2: 22,
  title3: 20,
  
  // Body text styles
  headline: 17,
  body: 17,
  callout: 16,
  subhead: 15,
  footnote: 13,
  caption1: 12,
  caption2: 11,
} as const;

/**
 * Base font sizes for Android/Web (no Dynamic Type categories)
 * These will still scale with user's font size preferences via allowFontScaling
 */
export const baseFontSizes = {
  // Large text styles (for headings)
  largeTitle: 34,
  title1: 28,
  title2: 22,
  title3: 20,
  
  // Body text styles
  headline: 17,
  body: 17,
  callout: 16,
  subhead: 15,
  footnote: 13,
  caption1: 12,
  caption2: 11,
} as const;

export type FontSizeKey = keyof typeof baseFontSizes;

/**
 * Maximum font size multipliers for different UI elements
 * Prevents extreme scaling that would break layouts
 */
export const maxFontSizeMultipliers = {
  // UI elements that should scale minimally
  button: 1.2,
  tabBar: 1.15,
  caption: 1.3,
  
  // Body text that should scale more
  body: 1.5,
  heading: 1.4,
  
  // Default for most text
  default: 1.25,
  
  // Elements that should not scale (very rare)
  fixed: 1.0,
} as const;

export type MaxFontSizeMultiplierKey = keyof typeof maxFontSizeMultipliers;

/**
 * Get the maximum font size multiplier for a UI element type
 * 
 * @param elementType - Type of UI element
 * @returns Maximum font size multiplier
 */
export function getMaxFontSizeMultiplier(
  elementType: MaxFontSizeMultiplierKey = 'default'
): number {
  return maxFontSizeMultipliers[elementType];
}

/**
 * Get scaled font size based on Dynamic Type support
 * On iOS, this will use the system's Dynamic Type scaling
 * On Android/Web, this uses the base size which will scale via allowFontScaling
 * 
 * @param sizeKey - The font size key (e.g., 'body', 'title1')
 * @param customScale - Optional custom scale multiplier (default: 1.0)
 * @returns The font size in points
 */
export function getScaledFontSize(sizeKey: FontSizeKey, customScale: number = 1.0): number {
  const baseSize = Platform.OS === 'ios' 
    ? iOSDynamicTypeStyles[sizeKey]
    : baseFontSizes[sizeKey];
  
  return baseSize * customScale;
}

/**
 * Calculate appropriate line height for a font size
 * Provides good readability while allowing Dynamic Type scaling
 * 
 * @param fontSize - Font size in points
 * @param multiplier - Line height multiplier (default: 1.4 for body text, 1.2 for headings)
 * @returns The line height in points
 */
export function getLineHeight(fontSize: number, multiplier: number = 1.4): number {
  return fontSize * multiplier;
}

