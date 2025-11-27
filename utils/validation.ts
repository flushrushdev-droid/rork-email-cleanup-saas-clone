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


