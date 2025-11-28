/**
 * Debug Detection Utility
 * 
 * Provides utilities to detect and prevent debug code from running in production.
 * Helps ensure no sensitive information is exposed in production builds.
 */

import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { AppConfig } from '@/config/env';

/**
 * Check if the app is running in development mode
 */
export function isDevelopmentMode(): boolean {
  // Check __DEV__ flag (React Native/Expo)
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    return true;
  }

  // Check NODE_ENV (web/Node.js)
  if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
    return true;
  }

  // Check AppConfig environment
  if (AppConfig.env === 'development') {
    return true;
  }

  return false;
}

/**
 * Check if the app is running in production mode
 */
export function isProductionMode(): boolean {
  return !isDevelopmentMode() && AppConfig.env === 'production';
}

/**
 * Assert that code should only run in development
 * Throws an error in production if called
 */
export function assertDevelopmentOnly(message = 'This code should only run in development'): void {
  if (!isDevelopmentMode()) {
    throw new Error(`[Production Error] ${message}`);
  }
}

/**
 * Execute a function only in development mode
 * Returns undefined in production
 */
export function devOnly<T>(fn: () => T): T | undefined {
  if (isDevelopmentMode()) {
    return fn();
  }
  return undefined;
}

/**
 * Get a value only in development, otherwise return a fallback
 */
export function devValue<T>(devValue: T, prodValue: T): T {
  return isDevelopmentMode() ? devValue : prodValue;
}

/**
 * Check if debug logging is enabled
 * Considers both development mode and explicit debug logging flag
 */
export function isDebugLoggingEnabled(): boolean {
  return isDevelopmentMode() || AppConfig.features.enableDebugLogging;
}

/**
 * Get build information (safe for production)
 */
export function getBuildInfo(): {
  isDev: boolean;
  isProd: boolean;
  platform: string;
  environment: string;
  version: string;
} {
  return {
    isDev: isDevelopmentMode(),
    isProd: isProductionMode(),
    platform: Platform.OS,
    environment: AppConfig.env,
    version: Constants.expoConfig?.version || '1.0.0',
  };
}

/**
 * Warn if running in production with debug features enabled
 * Should be called at app startup
 */
export function validateProductionBuild(): void {
  if (isProductionMode()) {
    // Check for common debug indicators
    const warnings: string[] = [];

    if (AppConfig.features.enableDebugLogging) {
      warnings.push('Debug logging is enabled in production');
    }

    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      warnings.push('__DEV__ flag is true in production build');
    }

    // Log warnings (these will be removed by ProGuard in release builds)
    if (warnings.length > 0) {
      console.warn('[Production Warning] Debug features detected:', warnings);
    }
  }
}

