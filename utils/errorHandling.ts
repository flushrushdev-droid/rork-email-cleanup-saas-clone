/**
 * Error handling utilities and types
 */

export enum ErrorCode {
  NETWORK_ERROR = 'NETWORK_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  API_ERROR = 'API_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  PERMISSION_ERROR = 'PERMISSION_ERROR',
}

export interface AppError {
  code: ErrorCode;
  message: string;
  originalError?: Error | unknown;
  retryable?: boolean;
  statusCode?: number;
}

/**
 * Network error - connection issues, timeouts
 */
export class NetworkError extends Error implements AppError {
  code = ErrorCode.NETWORK_ERROR;
  retryable = true;
  originalError?: Error;

  constructor(message: string, originalError?: Error) {
    super(message);
    this.name = 'NetworkError';
    this.originalError = originalError;
  }
}

/**
 * Authentication error - token expired, unauthorized
 */
export class AuthError extends Error implements AppError {
  code = ErrorCode.AUTH_ERROR;
  retryable = false;
  originalError?: Error;

  constructor(message: string, originalError?: Error) {
    super(message);
    this.name = 'AuthError';
    this.originalError = originalError;
  }
}

/**
 * Validation error - invalid input, missing required fields
 */
export class ValidationError extends Error implements AppError {
  code = ErrorCode.VALIDATION_ERROR;
  retryable = false;
  field?: string;

  constructor(message: string, field?: string) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

/**
 * API error - server errors, bad requests
 */
export class APIError extends Error implements AppError {
  code = ErrorCode.API_ERROR;
  retryable: boolean;
  statusCode?: number;
  originalError?: Error;

  constructor(message: string, statusCode?: number, retryable = false, originalError?: Error) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.retryable = retryable;
    this.originalError = originalError;
  }
}

/**
 * Unknown error - catch-all for unexpected errors
 */
export class UnknownError extends Error implements AppError {
  code = ErrorCode.UNKNOWN_ERROR;
  retryable = false;
  originalError?: Error;

  constructor(message: string, originalError?: Error) {
    super(message);
    this.name = 'UnknownError';
    this.originalError = originalError;
  }
}

/**
 * Convert any error to AppError
 */
export function normalizeError(error: unknown): AppError {
  if (error instanceof NetworkError) return error;
  if (error instanceof AuthError) return error;
  if (error instanceof ValidationError) return error;
  if (error instanceof APIError) return error;
  if (error instanceof UnknownError) return error;

  if (error instanceof Error) {
    // Check for network-related errors
    if (
      error.message.includes('network') ||
      error.message.includes('fetch') ||
      error.message.includes('timeout') ||
      error.message.includes('ECONNREFUSED') ||
      error.message.includes('ENOTFOUND')
    ) {
      return new NetworkError('Network connection failed. Please check your internet connection.', error);
    }

    // Check for auth-related errors
    if (
      error.message.includes('unauthorized') ||
      error.message.includes('authentication') ||
      error.message.includes('token') ||
      error.message.includes('401') ||
      error.message.includes('403')
    ) {
      return new AuthError('Authentication failed. Please sign in again.', error);
    }

    return new UnknownError(error.message || 'An unexpected error occurred', error);
  }

  return new UnknownError('An unexpected error occurred', error);
}

/**
 * Sanitize error message to prevent information disclosure
 * Removes sensitive information like API endpoints, tokens, internal paths
 */
export function sanitizeErrorMessage(message: string): string {
  if (!message || typeof message !== 'string') {
    return 'An error occurred. Please try again.';
  }

  let sanitized = message;

  // Remove API endpoints and URLs (but keep domain names for user context)
  sanitized = sanitized.replace(/https?:\/\/[^\s]+/gi, '[API endpoint]');
  
  // Remove tokens and secrets (common patterns)
  sanitized = sanitized.replace(/token[=:]\s*[\w-]+/gi, 'token=[REDACTED]');
  sanitized = sanitized.replace(/bearer\s+[\w-]+/gi, 'bearer [REDACTED]');
  sanitized = sanitized.replace(/api[_-]?key[=:]\s*[\w-]+/gi, 'api_key=[REDACTED]');
  sanitized = sanitized.replace(/secret[=:]\s*[\w-]+/gi, 'secret=[REDACTED]');
  
  // Remove file paths and internal structure
  sanitized = sanitized.replace(/[\/\\][\w\-\.]+\.(ts|tsx|js|jsx|json|md)/gi, '[file]');
  sanitized = sanitized.replace(/at\s+[\w\.]+:\d+:\d+/gi, '[location]');
  
  // Remove stack traces
  sanitized = sanitized.replace(/at\s+.*/g, '');
  sanitized = sanitized.replace(/Error:\s*/gi, '');
  
  // Remove internal error codes and IDs
  sanitized = sanitized.replace(/error[_-]?code[=:]\s*[\w-]+/gi, 'error_code=[REDACTED]');
  sanitized = sanitized.replace(/id[=:]\s*[a-f0-9-]{20,}/gi, 'id=[REDACTED]');
  
  // Clean up extra whitespace
  sanitized = sanitized.replace(/\s+/g, ' ').trim();
  
  // Limit message length
  if (sanitized.length > 200) {
    sanitized = sanitized.substring(0, 197) + '...';
  }
  
  return sanitized || 'An error occurred. Please try again.';
}

/**
 * Format error message for user display
 * Sanitizes messages to prevent information disclosure
 */
export function formatErrorMessage(error: AppError | Error | unknown): string {
  const appError = error instanceof Error && 'code' in error 
    ? (error as AppError)
    : normalizeError(error);

  // Get base message and sanitize it
  let message = appError.message || '';
  message = sanitizeErrorMessage(message);

  // Return user-friendly messages based on error code
  switch (appError.code) {
    case ErrorCode.NETWORK_ERROR:
      return 'Unable to connect. Please check your internet connection and try again.';
    
    case ErrorCode.AUTH_ERROR:
      return 'Your session has expired. Please sign in again.';
    
    case ErrorCode.VALIDATION_ERROR:
      // Use sanitized message for validation errors (they're usually safe)
      return message || 'Please check your input and try again.';
    
    case ErrorCode.API_ERROR:
      if (appError.statusCode === 429) {
        return 'Too many requests. Please wait a moment and try again.';
      }
      if (appError.statusCode && appError.statusCode >= 500) {
        return 'Server error. Please try again later.';
      }
      // For client errors, use generic message to avoid exposing details
      return 'An error occurred. Please try again.';
    
    case ErrorCode.TIMEOUT_ERROR:
      return 'Request timed out. Please try again.';
    
    case ErrorCode.PERMISSION_ERROR:
      return 'Permission denied. Please check your settings.';
    
    case ErrorCode.UNKNOWN_ERROR:
    default:
      // Always use generic message for unknown errors
      return 'An unexpected error occurred. Please try again.';
  }
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: AppError | Error | unknown): boolean {
  const appError = error instanceof Error && 'code' in error 
    ? (error as AppError)
    : normalizeError(error);

  if (appError.retryable !== undefined) {
    return appError.retryable;
  }

  // Default retryable errors
  return appError.code === ErrorCode.NETWORK_ERROR || 
         appError.code === ErrorCode.TIMEOUT_ERROR ||
         (appError.code === ErrorCode.API_ERROR && appError.statusCode && appError.statusCode >= 500);
}

/**
 * Extract error code from error
 */
export function getErrorCode(error: unknown): ErrorCode {
  const appError = normalizeError(error);
  return appError.code;
}

/**
 * Check if error is a specific type
 */
export function isErrorType(error: unknown, code: ErrorCode): boolean {
  return getErrorCode(error) === code;
}


