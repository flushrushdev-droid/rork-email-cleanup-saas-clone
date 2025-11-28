/**
 * Email Type Guards and Utilities
 * 
 * Provides type guards and utilities for working with Email and EmailMessage types
 * to improve type safety throughout the codebase.
 */

import type { Email, EmailMessage } from '@/constants/types';

/**
 * Type guard to check if an object has EmailMessage structure
 * (has Date object for date, size property, etc.)
 */
export function isEmailMessage(email: Email | EmailMessage | unknown): email is EmailMessage {
  if (!email || typeof email !== 'object') return false;
  const e = email as Record<string, unknown>;
  
  // EmailMessage has Date object for date
  if ('date' in e && e.date instanceof Date) {
    // EmailMessage has 'size' property (not 'sizeBytes')
    if ('size' in e && typeof e.size === 'number') {
      return true;
    }
  }
  
  return false;
}

/**
 * Type guard to check if an object has Email structure
 * (has string for date, sizeBytes property, etc.)
 */
export function isEmail(email: Email | EmailMessage | unknown): email is Email {
  if (!email || typeof email !== 'object') return false;
  const e = email as Record<string, unknown>;
  
  // Email has string for date
  if ('date' in e && typeof e.date === 'string') {
    // Email has 'sizeBytes' property (not 'size')
    if ('sizeBytes' in e && typeof e.sizeBytes === 'number') {
      return true;
    }
  }
  
  return false;
}

/**
 * Type guard to check if email has size information
 * Works with both Email and EmailMessage types
 */
export function hasSizeInfo(email: Email | EmailMessage | unknown): boolean {
  if (!email || typeof email !== 'object') return false;
  const e = email as Record<string, unknown>;
  return ('sizeBytes' in e && typeof e.sizeBytes === 'number') ||
         ('size' in e && typeof e.size === 'number');
}

/**
 * Type guard to check if email has attachments
 * Works with both Email and EmailMessage types
 */
export function hasAttachments(email: Email | EmailMessage | unknown): boolean {
  if (!email || typeof email !== 'object') return false;
  const e = email as Record<string, unknown>;
  
  // Check hasAttachments boolean
  if ('hasAttachments' in e && typeof e.hasAttachments === 'boolean' && e.hasAttachments) {
    return true;
  }
  
  // Check attachmentCount
  if ('attachmentCount' in e) {
    if (typeof e.attachmentCount === 'number' && e.attachmentCount > 0) {
      return true;
    }
    if (typeof e.attachmentCount === 'string' && e.attachmentCount !== '0' && e.attachmentCount !== '') {
      return true;
    }
  }
  
  // Check attachments array
  if ('attachments' in e && Array.isArray(e.attachments) && e.attachments.length > 0) {
    return true;
  }
  
  return false;
}

/**
 * Get size in bytes from either Email or EmailMessage
 * Type-safe version of extractSizeBytes
 */
export function getSizeBytes(email: Email | EmailMessage): number {
  if (isEmail(email)) {
    return email.sizeBytes;
  }
  if (isEmailMessage(email)) {
    return email.size;
  }
  // Fallback for unknown types
  const e = email as Record<string, unknown>;
  if ('sizeBytes' in e && typeof e.sizeBytes === 'number') {
    return e.sizeBytes;
  }
  if ('size' in e && typeof e.size === 'number') {
    return e.size;
  }
  return 0;
}

/**
 * Get attachment count from either Email or EmailMessage
 */
export function getAttachmentCount(email: Email | EmailMessage): number {
  const e = email as Record<string, unknown>;
  
  if ('attachmentCount' in e) {
    if (typeof e.attachmentCount === 'number') {
      return e.attachmentCount;
    }
    if (typeof e.attachmentCount === 'string') {
      const parsed = parseInt(e.attachmentCount, 10);
      return isNaN(parsed) ? 0 : parsed;
    }
  }
  
  if ('attachments' in e && Array.isArray(e.attachments)) {
    return e.attachments.length;
  }
  
  return 0;
}

/**
 * Check if email is unread
 * Works with both Email and EmailMessage types
 */
export function isUnread(email: Email | EmailMessage | unknown): boolean {
  if (!email || typeof email !== 'object') return false;
  const e = email as Record<string, unknown>;
  
  if ('isRead' in e && typeof e.isRead === 'boolean') {
    return !e.isRead;
  }
  
  return false;
}

/**
 * Check if email is starred
 * Works with both Email and EmailMessage types
 */
export function isStarred(email: Email | EmailMessage | unknown): boolean {
  if (!email || typeof email !== 'object') return false;
  const e = email as Record<string, unknown>;
  
  if ('isStarred' in e && typeof e.isStarred === 'boolean') {
    return e.isStarred;
  }
  
  return false;
}

