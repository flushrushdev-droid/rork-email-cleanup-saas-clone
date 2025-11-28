/**
 * Content Security Policy (CSP) Configuration
 * 
 * Generates environment-aware CSP policies for web platform.
 * Supports:
 * - Local development (localhost, 127.0.0.1)
 * - Rork development environment (https://rork.com)
 * - Production deployments (Vercel/Render/Supabase)
 */

import { AppConfig } from '@/config/env';
import { Platform } from 'react-native';

/**
 * Get allowed connect-src domains based on environment
 */
function getConnectSrcDomains(): string[] {
  const domains: string[] = ["'self'"];

  if (AppConfig.env === 'development') {
    // Development: Allow localhost and Rork
    domains.push(
      'http://localhost:8081',
      'http://127.0.0.1:8081',
      'https://rork.com',
      'https://*.rork.com'
    );
    
    // Also allow the API base URL if it's different
    const apiBaseUrl = AppConfig.api.baseUrl;
    if (apiBaseUrl && !domains.includes(apiBaseUrl)) {
      domains.push(apiBaseUrl);
    }
    
    // Allow redirect base URL if different
    const redirectBaseUrl = AppConfig.redirectBaseUrl;
    if (redirectBaseUrl && !domains.includes(redirectBaseUrl)) {
      domains.push(redirectBaseUrl);
    }
  } else {
    // Production: Only allow production domains
    const apiBaseUrl = AppConfig.api.baseUrl;
    if (apiBaseUrl) {
      domains.push(apiBaseUrl);
    }
    
    const redirectBaseUrl = AppConfig.redirectBaseUrl;
    if (redirectBaseUrl && !domains.includes(redirectBaseUrl)) {
      domains.push(redirectBaseUrl);
    }
  }

  // Always allow Google APIs for OAuth and Gmail integration
  domains.push(
    'https://*.googleapis.com',
    'https://*.google.com',
    'https://accounts.google.com',
    'https://oauth2.googleapis.com'
  );

  return domains;
}

/**
 * Generate Content Security Policy string for meta tags
 * (excludes frame-ancestors which is only supported in HTTP headers)
 * 
 * @returns CSP policy string for meta tags
 */
export function generateCSP(): string {
  const connectSrc = getConnectSrcDomains().join(' ');

  // CSP directives
  // Note: 'unsafe-inline' and 'unsafe-eval' are required for React/Expo
  // This is a known limitation and acceptable for React Native Web apps
  // Note: 'frame-ancestors' is not supported in meta tags (only HTTP headers)
  const directives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    `connect-src ${connectSrc}`,
    "frame-src 'self' https://accounts.google.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests"
  ];

  return directives.join('; ');
}

/**
 * Generate full Content Security Policy string for HTTP headers
 * (includes frame-ancestors which is only supported in HTTP headers)
 * 
 * @returns Full CSP policy string for HTTP headers
 */
export function generateFullCSPHeader(): string {
  const metaCSP = generateCSP();
  
  // Add frame-ancestors for HTTP headers
  // 'none' prevents the page from being embedded in frames (clickjacking protection)
  return `${metaCSP}; frame-ancestors 'none'`;
}

/**
 * Apply CSP meta tag to document head (web only)
 * Should be called in a useEffect hook for web platform
 */
export function applyCSP(): void {
  if (Platform.OS !== 'web' || typeof document === 'undefined') {
    return;
  }

  const csp = generateCSP();
  
  // Remove existing CSP meta tag if present
  const existingMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
  if (existingMeta) {
    existingMeta.remove();
  }

  // Create and add new CSP meta tag
  const meta = document.createElement('meta');
  meta.httpEquiv = 'Content-Security-Policy';
  meta.content = csp;
  document.head.appendChild(meta);
}

