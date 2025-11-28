/**
 * Environment Configuration
 * 
 * Centralized configuration management using expo-constants and environment variables.
 * Supports:
 * - Rork development environment
 * - Vercel/Render/Supabase production deployments
 * - Local development
 * - Backend and frontend
 */

import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Get environment variable with fallback
 * Priority: expo-constants extra > process.env > fallback
 */
export function getEnvVar(key: string, fallback?: string): string | undefined {
  // Try expo-constants extra first (for Expo/React Native)
  const expoExtra = Constants.expoConfig?.extra?.[key];
  if (expoExtra) return expoExtra;

  // Try process.env (for web/backend)
  // Access process.env through a type-safe helper
  if (typeof process !== 'undefined' && process.env) {
    // Create a record type for environment variables
    const envRecord: Record<string, string | undefined> = process.env;
    const processEnv = envRecord[key];
    if (processEnv) return processEnv;
  }

  // Return fallback if provided
  return fallback;
}

/**
 * App Configuration
 */
export const AppConfig = {
  /**
   * Environment (development, staging, production)
   */
  env: getEnvVar('EXPO_PUBLIC_APP_ENV', 'development') as 'development' | 'staging' | 'production',

  /**
   * App scheme for deep linking (e.g., 'rork-app')
   */
  appScheme: getEnvVar('EXPO_PUBLIC_APP_SCHEME', 'rork-app'),

  /**
   * Base URL for redirects (used for OAuth callbacks)
   * For local dev: Uses localhost if available, otherwise falls back to configured URL
   * For Rork: Uses https://rork.com
   * For production: Uses configured production URL
   */
  redirectBaseUrl: (() => {
    const configured = getEnvVar('EXPO_PUBLIC_REDIRECT_BASE_URL');
    if (configured) {
      return configured;
    }
    
    // For web platform: detect localhost from window.location
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const origin = window.location.origin;
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return origin;
      }
    }
    
    // For native platforms: detect local development server IP
    // Mobile devices can't access localhost, so we need the network IP
    if (Platform.OS !== 'web') {
      // Check if we're in development mode
      const isDev = typeof __DEV__ !== 'undefined' ? __DEV__ : false;
      const env = getEnvVar('EXPO_PUBLIC_APP_ENV', 'development');
      const isDevelopmentEnv = env === 'development';
      
      if (isDev || isDevelopmentEnv) {
        // Try to get the Metro bundler URL from Constants
        // This contains the IP address the mobile device uses to connect
        const hostUri = Constants.expoConfig?.hostUri;
        
        if (hostUri) {
          // hostUri format: "192.168.1.100:8081" or "localhost:8081"
          const [host, port] = hostUri.split(':');
          if (host && port) {
            // If it's not localhost, use the network IP (mobile can access this)
            if (host !== 'localhost' && host !== '127.0.0.1') {
              return `http://${host}:${port}`;
            }
            // If it's localhost, we need the network IP - check for environment variable
            const networkIp = getEnvVar('EXPO_PUBLIC_LOCAL_DEV_IP');
            if (networkIp) {
              return `http://${networkIp}:${port}`;
            }
          }
        }
        
        // Fallback: try to use environment variable for local dev IP
        const networkIp = getEnvVar('EXPO_PUBLIC_LOCAL_DEV_IP');
        if (networkIp) {
          return `http://${networkIp}:8081`;
        }
      }
      
      // For production or when not in dev mode, use Rork URL
      return 'https://rork.com';
    }
    
    // Default fallback for production
    return 'https://rork.com';
  })(),

  /**
   * API Configuration
   */
  api: {
    /**
     * Base URL for API requests
     * Priority: EXPO_PUBLIC_API_BASE_URL > EXPO_PUBLIC_RORK_API_BASE_URL > auto-detect
     */
    baseUrl: (() => {
      // Check for explicit API base URL
      const explicitUrl = getEnvVar('EXPO_PUBLIC_API_BASE_URL') || 
                         getEnvVar('EXPO_PUBLIC_RORK_API_BASE_URL');
      if (explicitUrl) return explicitUrl;

      // Auto-detect for web
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        return window.location.origin;
      }

      // Default fallback for local development
      return 'http://localhost:3000';
    })(),

    /**
     * tRPC endpoint path
     */
    trpcPath: '/api/trpc',
  },

  /**
   * Google OAuth Configuration
   */
  google: {
    /**
     * Google OAuth Client ID
     */
    clientId: getEnvVar(
      'EXPO_PUBLIC_GOOGLE_CLIENT_ID',
      'your-google-oauth-client-id.apps.googleusercontent.com'
    ),

    /**
     * Google OAuth Client Secret
     * WARNING: For web OAuth, Google requires client_secret even with PKCE.
     * This should be moved to a backend endpoint in production for better security.
     * For native apps (Android/iOS), this is not needed with PKCE.
     */
    clientSecret: getEnvVar(
      'EXPO_PUBLIC_GOOGLE_CLIENT_SECRET',
      'your-google-oauth-client-secret'
    ),

    /**
     * OAuth discovery endpoints (typically don't need to change)
     */
    oauth: {
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenEndpoint: 'https://oauth2.googleapis.com/token',
      revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
    },
  },

  /**
   * Gmail API Configuration
   */
  gmail: {
    /**
     * Gmail API base URL (typically doesn't need to change)
     */
    apiBase: 'https://gmail.googleapis.com/gmail/v1/users/me',
  },

  /**
   * Feature Flags
   */
  features: {
    /**
     * Enable demo mode
     */
    enableDemoMode: getEnvVar('EXPO_PUBLIC_ENABLE_DEMO_MODE', 'true') === 'true',

    /**
     * Enable debug logging
     */
    enableDebugLogging: getEnvVar('EXPO_PUBLIC_ENABLE_DEBUG_LOGGING', 'false') === 'true',
  },
} as const;

/**
 * Validate and enforce HTTPS in production
 * 
 * @param url - URL to validate
 * @returns The validated URL
 * @throws Error if URL is not HTTPS in production or contains localhost in production
 */
export function validateSecureUrl(url: string): string {
  if (AppConfig.env === 'production') {
    if (!url.startsWith('https://')) {
      throw new Error(`HTTPS required in production environment. URL: ${url}`);
    }
    // Reject localhost in production
    if (url.includes('localhost') || url.includes('127.0.0.1')) {
      throw new Error(`Localhost URLs not allowed in production. URL: ${url}`);
    }
  }
  return url;
}

/**
 * Get full API URL with HTTPS validation
 */
export function getApiUrl(path: string = ''): string {
  const baseUrl = AppConfig.api.baseUrl;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const fullUrl = `${baseUrl}${cleanPath}`;
  return validateSecureUrl(fullUrl);
}

/**
 * Get tRPC URL with HTTPS validation
 */
export function getTrpcUrl(): string {
  const url = `${AppConfig.api.baseUrl}${AppConfig.api.trpcPath}`;
  return validateSecureUrl(url);
}

/**
 * Get OAuth redirect URI
 * Handles platform-specific redirect URIs:
 * - Web: Auto-detects origin for local dev, uses redirectBaseUrl for production
 * - Android/iOS: Uses web-based redirect URI (Google doesn't accept exp:// or custom schemes)
 *   The web callback page will redirect back to the app using deep linking
 */
export function getRedirectUri(): string {
  if (Platform.OS === 'web') {
    // For web, auto-detect the current origin (works for localhost and production)
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/auth/callback`;
    }
    // Fallback to configured redirect base URL if window is not available
    return `${AppConfig.redirectBaseUrl}/auth/callback`;
  }
  
  // For native platforms (Android & iOS), use web-based redirect URI
  // This works because Google doesn't accept exp:// or custom scheme URIs
  // The web callback will redirect back to the app via deep link
  return `${AppConfig.redirectBaseUrl}/auth/callback`;
}

/**
 * Check if running in production
 */
export function isProduction(): boolean {
  return AppConfig.env === 'production';
}

/**
 * Check if running in development
 */
export function isDevelopment(): boolean {
  return AppConfig.env === 'development';
}

/**
 * Log configuration (safe for development, excludes sensitive data)
 */
export function logConfig(): void {
  if (isDevelopment() || AppConfig.features.enableDebugLogging) {
    const isDev = typeof __DEV__ !== 'undefined' ? __DEV__ : false;
    const hostUri = Constants.expoConfig?.hostUri;
    const localDevIp = AppConfig.redirectBaseUrl.includes('localhost') ? 
      (getEnvVar('EXPO_PUBLIC_LOCAL_DEV_IP') || 'not set') : 
      'not needed';
    
    console.log('[Config] Environment:', AppConfig.env);
    console.log('[Config] Platform:', Platform.OS);
    console.log('[Config] __DEV__:', isDev);
    console.log('[Config] Host URI:', hostUri || 'not available');
    if (Platform.OS !== 'web') {
      console.log('[Config] Local Dev IP (from env):', localDevIp);
    }
    console.log('[Config] API Base URL:', AppConfig.api.baseUrl);
    console.log('[Config] App Scheme:', AppConfig.appScheme);
    console.log('[Config] Redirect Base URL:', AppConfig.redirectBaseUrl);
    console.log('[Config] Google Client ID:', AppConfig.google.clientId ? `${AppConfig.google.clientId.substring(0, 10)}...` : 'not set');
    console.log('[Config] Demo Mode:', AppConfig.features.enableDemoMode);
  }
}

