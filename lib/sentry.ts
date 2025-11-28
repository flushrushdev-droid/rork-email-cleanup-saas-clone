/**
 * Sentry Error Logging Service Configuration
 * 
 * Frontend error logging integration with Sentry.
 * Captures errors, exceptions, and performance data from the React Native app.
 * 
 * NOTE: For backend error logging, we will use self-hosted GlitchTip (Sentry-compatible)
 * instead of Sentry. GlitchTip provides the same API as Sentry, so this frontend
 * implementation can easily be adapted to work with GlitchTip if needed.
 */

import * as Sentry from '@sentry/react-native';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { AppConfig, getEnvVar } from '@/config/env';
import { isDevelopmentMode } from '@/utils/debugDetection';

/**
 * Initialize Sentry for error tracking
 * Should be called once at app startup
 */
export function initSentry(): void {
  // Get DSN from environment (or use placeholder for development)
  const dsn = getEnvVar('EXPO_PUBLIC_SENTRY_DSN', '');
  
  // Only initialize if DSN is provided and not in development mode
  // In development, we can still initialize with a test DSN for testing
  if (!dsn && !isDevelopmentMode()) {
    console.warn('[Sentry] DSN not configured. Error logging disabled.');
    return;
  }

  // Don't initialize in development unless explicitly enabled
  if (isDevelopmentMode() && getEnvVar('EXPO_PUBLIC_SENTRY_ENABLE_IN_DEV', 'false') !== 'true') {
    console.log('[Sentry] Skipping initialization in development mode');
    return;
  }

  try {
    Sentry.init({
      dsn: dsn || undefined, // Use undefined if no DSN (Sentry will be a no-op)
      
      // Environment
      environment: AppConfig.env,
      debug: isDevelopmentMode(),
      
      // Performance monitoring
      enableAutoSessionTracking: true,
      enableTracing: true,
      
      // Error filtering
      beforeSend(event, hint) {
        // Filter out known non-critical errors in development
        if (isDevelopmentMode()) {
          // Don't send errors in development unless explicitly enabled
          return null;
        }
        
        // Filter out network errors that are expected (offline, etc.)
        if (event.exception) {
          const error = hint.originalException;
          if (error instanceof Error) {
            // Don't send network errors that are handled gracefully
            if (error.message.includes('Network request failed') && 
                error.message.includes('offline')) {
              return null;
            }
          }
        }
        
        return event;
      },
      
      // Sample rate for performance monitoring (0.0 to 1.0)
      tracesSampleRate: AppConfig.env === 'production' ? 0.1 : 1.0,
      
      // Release tracking
      release: Constants.expoConfig?.version || '1.0.0',
      dist: Constants.expoConfig?.ios?.buildNumber || Constants.expoConfig?.android?.versionCode?.toString() || undefined,
      
      // Platform-specific options
      ...(Platform.OS === 'web' && {
        integrations: [],
      }),
    });

    // Set user context (will be updated when user logs in)
    setSentryUser(null);
    
    console.log('[Sentry] Initialized successfully');
  } catch (error) {
    console.error('[Sentry] Failed to initialize:', error);
  }
}

/**
 * Set user context for Sentry
 * Call this when user logs in/out
 */
export function setSentryUser(user: { id: string; email?: string; username?: string } | null): void {
  if (!user) {
    Sentry.setUser(null);
    return;
  }

  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username || user.email,
  });
}

/**
 * Add breadcrumb for user actions
 * Helps track what user was doing before an error
 */
export function addBreadcrumb(message: string, category?: string, data?: Record<string, unknown>): void {
  Sentry.addBreadcrumb({
    message,
    category: category || 'user',
    level: 'info',
    data,
    timestamp: Date.now() / 1000,
  });
}

/**
 * Capture exception manually
 * Use this for caught errors that you want to log
 */
export function captureException(error: Error, context?: Record<string, unknown>): void {
  Sentry.captureException(error, {
    contexts: {
      custom: context || {},
    },
  });
}

/**
 * Capture message manually
 * Use this for important events that aren't errors
 */
export function captureMessage(message: string, level: 'fatal' | 'error' | 'warning' | 'log' | 'info' | 'debug' = 'info', context?: Record<string, unknown>): void {
  Sentry.captureMessage(message, {
    level,
    contexts: {
      custom: context || {},
    },
  });
}

/**
 * Set additional context
 * Use this to add app state, device info, etc.
 */
export function setContext(key: string, context: Record<string, unknown>): void {
  Sentry.setContext(key, context);
}

/**
 * Clear all context
 */
export function clearContext(): void {
  Sentry.setContext('app', {});
  Sentry.setContext('device', {});
}

