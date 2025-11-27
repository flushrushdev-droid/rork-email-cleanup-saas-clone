/**
 * Theme Utilities
 * 
 * Utilities for theme management, contrast checking, and smooth transitions
 */

import type { ThemeColors } from '@/constants/colors';

/**
 * Calculate relative luminance of a color (for contrast ratio calculation)
 * Based on WCAG 2.1 guidelines
 */
function getLuminance(hex: string): number {
  // Remove # if present
  const color = hex.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(color.substring(0, 2), 16) / 255;
  const g = parseInt(color.substring(2, 4), 16) / 255;
  const b = parseInt(color.substring(4, 6), 16) / 255;
  
  // Apply gamma correction
  const [rs, gs, bs] = [r, g, b].map(val => {
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  
  // Calculate relative luminance
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 * Returns a value between 1 (no contrast) and 21 (maximum contrast)
 * WCAG requires:
 * - 4.5:1 for normal text (AA)
 * - 7:1 for large text (AA)
 * - 3:1 for UI components (AA)
 */
export function getContrastRatio(color1: string, color2: string): number {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast ratio meets WCAG AA standards
 */
export function meetsContrastAA(
  foreground: string,
  background: string,
  isLargeText = false
): boolean {
  const ratio = getContrastRatio(foreground, background);
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
}

/**
 * Check if contrast ratio meets WCAG AAA standards
 */
export function meetsContrastAAA(
  foreground: string,
  background: string,
  isLargeText = false
): boolean {
  const ratio = getContrastRatio(foreground, background);
  return isLargeText ? ratio >= 4.5 : ratio >= 7;
}

/**
 * Get appropriate text color for a background
 * Returns light or dark text color based on contrast
 */
export function getContrastText(backgroundColor: string, colors: ThemeColors): string {
  const lightContrast = getContrastRatio(colors.text, backgroundColor);
  const darkContrast = getContrastRatio('#000000', backgroundColor);
  
  // If background is dark, use light text; if light, use dark text
  // But check actual contrast to ensure readability
  if (lightContrast > darkContrast) {
    return colors.text;
  }
  return '#000000';
}

/**
 * Theme transition duration (in milliseconds)
 */
export const THEME_TRANSITION_DURATION = 300;

/**
 * Get transition style for theme changes
 * Use this for smooth color transitions when theme changes
 */
export function getThemeTransitionStyle(): { transition?: string } {
  // React Native doesn't support CSS transitions, but we can use Animated API
  // For web, we can use CSS transitions
  if (typeof window !== 'undefined') {
    return {
      transition: `background-color ${THEME_TRANSITION_DURATION}ms ease-in-out, color ${THEME_TRANSITION_DURATION}ms ease-in-out, border-color ${THEME_TRANSITION_DURATION}ms ease-in-out`,
    };
  }
  return {};
}

