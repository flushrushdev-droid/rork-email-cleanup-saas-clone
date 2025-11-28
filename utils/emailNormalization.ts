/**
 * Email Normalization Utilities
 * 
 * Provides functions to normalize email data from various sources
 * (EmailMessage, GmailMessage, etc.) into a consistent Email type.
 * 
 * Handles:
 * - Date normalization (Date objects, strings, ISO strings)
 * - Size extraction (sizeBytes vs size property)
 * - Type safety improvements
 */

import type { Email, EmailMessage } from '@/constants/types';
import { isEmailMessage, isEmail } from './emailTypeGuards';

/**
 * Extract size in bytes from an email object
 * Handles both `sizeBytes` and `size` properties
 */
export function extractSizeBytes(email: { sizeBytes?: number; size?: number }): number {
  if ('sizeBytes' in email && typeof email.sizeBytes === 'number') {
    return email.sizeBytes;
  }
  if ('size' in email && typeof email.size === 'number') {
    return email.size;
  }
  return 0;
}

/**
 * Normalize date to ISO string
 * Handles Date objects, ISO strings, and other date strings
 */
export function normalizeDate(date: Date | string | undefined): string {
  if (!date) {
    return new Date().toISOString();
  }
  
  if (date instanceof Date) {
    return date.toISOString();
  }
  
  if (typeof date === 'string') {
    // If it's already an ISO string, return as-is
    // Otherwise, try to parse it
    try {
      const parsed = new Date(date);
      if (!isNaN(parsed.getTime())) {
        return parsed.toISOString();
      }
    } catch {
      // If parsing fails, return the original string
      // This handles edge cases where date might be in a different format
    }
    return date;
  }
  
  return new Date().toISOString();
}

/**
 * Normalize the 'to' field to an array
 * Handles both string and string[] formats
 */
export function normalizeToField(to: string | string[] | undefined): string[] {
  if (!to) {
    return [];
  }
  if (Array.isArray(to)) {
    return to;
  }
  return [to];
}

/**
 * Check if an email has size information
 */
export function hasSizeInfo(email: { sizeBytes?: number; size?: number }): boolean {
  return ('sizeBytes' in email && typeof email.sizeBytes === 'number') ||
         ('size' in email && typeof email.size === 'number');
}

/**
 * Normalize an email-like object to the Email type
 * 
 * @param email - Email-like object (EmailMessage, partial Email, etc.)
 * @returns Normalized Email object
 */
export function normalizeEmail(email: {
  id: string;
  threadId: string;
  from: string;
  to?: string | string[];
  subject: string;
  snippet: string;
  date?: Date | string;
  isRead?: boolean;
  hasAttachments?: boolean;
  labels?: string[];
  priority?: 'action' | 'later' | 'fyi' | 'low';
  sizeBytes?: number;
  size?: number;
}): Email {
  const sizeBytes = extractSizeBytes(email);
  const dateStr = normalizeDate(email.date);
  const toArray = normalizeToField(email.to);

  return {
    id: email.id,
    threadId: email.threadId,
    from: email.from,
    to: toArray,
    subject: email.subject,
    snippet: email.snippet,
    date: dateStr,
    isRead: email.isRead ?? false,
    hasAttachments: email.hasAttachments ?? false,
    labels: email.labels ?? [],
    priority: email.priority,
    sizeBytes,
  };
}

/**
 * Normalize an array of email-like objects to Email[]
 * 
 * @param emails - Array of email-like objects
 * @returns Array of normalized Email objects
 */
export function normalizeEmails<T extends {
  id: string;
  threadId: string;
  from: string;
  to?: string | string[];
  subject: string;
  snippet: string;
  date?: Date | string;
  isRead?: boolean;
  hasAttachments?: boolean;
  labels?: string[];
  priority?: 'action' | 'later' | 'fyi' | 'low';
  sizeBytes?: number;
  size?: number;
}>(emails: T[]): Email[] {
  return emails.map(normalizeEmail);
}

/**
 * Filter out trashed emails from an array
 * 
 * @param emails - Array of emails
 * @param trashedEmailIds - Set of trashed email IDs
 * @returns Filtered array without trashed emails
 */
export function filterTrashedEmails<T extends { id: string }>(
  emails: T[],
  trashedEmailIds: Set<string>
): T[] {
  return emails.filter(email => !trashedEmailIds.has(email.id));
}

/**
 * Filter and normalize emails in one operation
 * 
 * @param emails - Array of email-like objects
 * @param trashedEmailIds - Set of trashed email IDs (optional)
 * @param requireSizeInfo - Whether to require size information (default: false)
 * @returns Filtered and normalized Email array
 */
export function filterAndNormalizeEmails<T extends {
  id: string;
  threadId: string;
  from: string;
  to?: string | string[];
  subject: string;
  snippet: string;
  date?: Date | string;
  isRead?: boolean;
  hasAttachments?: boolean;
  labels?: string[];
  priority?: 'action' | 'later' | 'fyi' | 'low';
  sizeBytes?: number;
  size?: number;
}>(
  emails: T[],
  options?: {
    trashedEmailIds?: Set<string>;
    requireSizeInfo?: boolean;
  }
): Email[] {
  const { trashedEmailIds, requireSizeInfo = false } = options || {};
  
  let filtered = emails;
  
  // Filter out trashed emails
  if (trashedEmailIds) {
    filtered = filterTrashedEmails(filtered, trashedEmailIds);
  }
  
  // Filter by size info requirement
  if (requireSizeInfo) {
    filtered = filtered.filter(hasSizeInfo);
  }
  
  // Normalize all emails
  return normalizeEmails(filtered);
}

