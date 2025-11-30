/**
 * Security validation utilities
 * 
 * Provides functions to validate and sanitize user inputs, URL parameters,
 * and other data to prevent injection attacks and security vulnerabilities.
 */

/**
 * Validate OAuth authorization code format
 * OAuth codes can contain alphanumeric characters, dashes, underscores, and forward slashes
 * Google OAuth codes often have the format: "4/0Ab32j91..."
 */
export function isValidOAuthCode(code: string): boolean {
  if (!code || typeof code !== 'string') return false;
  // OAuth codes can contain alphanumeric, dashes, underscores, forward slashes, and dots
  // Google codes often look like: "4/0Ab32j91..." or "4/0AeD2..."
  return /^[A-Za-z0-9_./-]+$/.test(code) && code.length >= 10 && code.length <= 500;
}

/**
 * Validate email ID format
 * Email IDs should be alphanumeric with dashes/underscores
 */
export function isValidEmailId(id: string): boolean {
  if (!id || typeof id !== 'string') return false;
  return /^[A-Za-z0-9_-]+$/.test(id) && id.length > 0 && id.length <= 100;
}

/**
 * Validate stat type parameter
 */
export function isValidStatType(type: string): type is 'unread' | 'noise' | 'files' | 'automated' {
  return ['unread', 'noise', 'files', 'automated'].includes(type);
}

/**
 * Validate and sanitize folder name
 */
export function isValidFolderName(name: string): boolean {
  if (!name || typeof name !== 'string') return false;
  return /^[A-Za-z0-9\s_-]+$/.test(name) && name.length > 0 && name.length <= 50;
}

/**
 * Validate shortcut action parameter
 */
export function isValidShortcutAction(action: string): action is 'showUnread' | 'openInbox' | 'syncEmails' | 'searchEmails' {
  return ['showUnread', 'openInbox', 'syncEmails', 'searchEmails'].includes(action);
}

/**
 * Validate JSON string before parsing
 * Returns parsed value or fallback if parsing fails
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    const parsed = JSON.parse(json);
    return parsed;
  } catch {
    return fallback;
  }
}

/**
 * Validate OAuth state parameter
 */
export function isValidOAuthState(state: string | null | undefined): boolean {
  if (!state || typeof state !== 'string') return false;
  // State parameters are typically alphanumeric with dashes/underscores
  return /^[A-Za-z0-9_-]+$/.test(state) && state.length > 0 && state.length <= 200;
}

