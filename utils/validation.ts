/**
 * Validation utilities and schemas
 */

/**
 * Validates if a string is a valid email address or comma-separated list of emails
 */
export function isValidEmail(email: string): boolean {
  if (!email || !email.trim()) {
    return false;
  }
  
  // Basic email regex pattern
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  // Check if it's a single email or comma-separated list
  const emails = email.split(',').map(e => e.trim()).filter(e => e.length > 0);
  
  // All emails must be valid
  return emails.length > 0 && emails.every(e => emailRegex.test(e));
}

/**
 * Validates if a string contains at least one valid email address
 */
export function hasValidEmail(email: string): boolean {
  if (!email || !email.trim()) {
    return false;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const emails = email.split(',').map(e => e.trim()).filter(e => e.length > 0);
  
  return emails.some(e => emailRegex.test(e));
}

/**
 * Gets validation error message for email field
 */
export function getEmailValidationError(email: string, fieldName: string = 'Email'): string | null {
  if (!email || !email.trim()) {
    return `${fieldName} is required`;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const emails = email.split(',').map(e => e.trim()).filter(e => e.length > 0);
  
  if (emails.length === 0) {
    return `${fieldName} is required`;
  }
  
  const invalidEmails = emails.filter(e => !emailRegex.test(e));
  if (invalidEmails.length > 0) {
    if (invalidEmails.length === 1) {
      return `Invalid email address: ${invalidEmails[0]}`;
    }
    return `Invalid email addresses: ${invalidEmails.join(', ')}`;
  }
  
  return null;
}

/**
 * Sanitize search query to prevent XSS
 */
export function sanitizeSearchQuery(query: string): string {
  if (!query || typeof query !== 'string') return '';
  return query
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .slice(0, 200); // Limit length
}

/**
 * Sanitize folder name
 */
export function sanitizeFolderName(name: string): string {
  if (!name || typeof name !== 'string') return '';
  return name
    .trim()
    .replace(/[<>]/g, '')
    .replace(/[^\w\s-]/g, '') // Only allow alphanumeric, spaces, dashes, underscores
    .slice(0, 50);
}

/**
 * Sanitize email subject for display
 */
export function sanitizeEmailSubject(subject: string): string {
  if (!subject || typeof subject !== 'string') return '';
  return subject
    .replace(/[<>]/g, '')
    .slice(0, 500); // Limit length
}

/**
 * Validate rule condition value
 */
export function isValidRuleConditionValue(value: string): boolean {
  if (!value || typeof value !== 'string') return false;
  // Prevent script injection
  if (/<script|javascript:|on\w+=/gi.test(value)) return false;
  // Limit length
  if (value.length > 1000) return false;
  return true;
}

/**
 * Sanitize rule condition value
 */
export function sanitizeRuleConditionValue(value: string): string {
  if (!value || typeof value !== 'string') return '';
  return value
    .trim()
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .slice(0, 1000);
}

