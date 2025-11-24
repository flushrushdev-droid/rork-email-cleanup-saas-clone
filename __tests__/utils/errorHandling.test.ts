import {
  normalizeError,
  formatErrorMessage,
  isRetryableError,
  getErrorCode,
  isErrorType,
  NetworkError,
  AuthError,
  ValidationError,
  APIError,
  UnknownError,
  ErrorCode,
} from '@/utils/errorHandling';

describe('errorHandling utilities', () => {
  describe('normalizeError', () => {
    it('normalizes network-related errors', () => {
      const error = new Error('ECONNREFUSED');
      const normalized = normalizeError(error);
      expect(normalized.code).toBe(ErrorCode.NETWORK_ERROR);
      expect(normalized.retryable).toBe(true);
    });

    it('normalizes auth-related errors', () => {
      const error = new Error('unauthorized');
      const normalized = normalizeError(error);
      expect(normalized.code).toBe(ErrorCode.AUTH_ERROR);
      expect(normalized.retryable).toBe(false);
    });

    it('preserves existing AppError types', () => {
      const networkError = new NetworkError('Failed');
      const normalized = normalizeError(networkError);
      expect(normalized).toBe(networkError);
      expect(normalized.code).toBe(ErrorCode.NETWORK_ERROR);
    });

    it('handles unknown errors', () => {
      const error = { something: 'weird' };
      const normalized = normalizeError(error);
      expect(normalized.code).toBe(ErrorCode.UNKNOWN_ERROR);
    });
  });

  describe('formatErrorMessage', () => {
    it('formats network errors with user-friendly message', () => {
      const error = new NetworkError('Connection failed');
      const message = formatErrorMessage(error);
      expect(message).toContain('connect');
      expect(message).toContain('internet');
    });

    it('formats auth errors', () => {
      const error = new AuthError('Token expired');
      const message = formatErrorMessage(error);
      expect(message).toContain('session');
      expect(message).toContain('sign in');
    });

    it('formats validation errors', () => {
      const error = new ValidationError('Email is required');
      const message = formatErrorMessage(error);
      expect(message).toBe('Email is required');
    });

    it('formats API errors with status codes', () => {
      const error = new APIError('Too many requests', 429);
      const message = formatErrorMessage(error);
      expect(message).toContain('wait');
    });

    it('formats 5xx server errors', () => {
      const error = new APIError('Server error', 500);
      const message = formatErrorMessage(error);
      expect(message.toLowerCase()).toContain('server');
      expect(message).toContain('later');
    });
  });

  describe('isRetryableError', () => {
    it('returns true for network errors', () => {
      const error = new NetworkError('Failed');
      expect(isRetryableError(error)).toBe(true);
    });

    it('returns false for auth errors', () => {
      const error = new AuthError('Unauthorized');
      expect(isRetryableError(error)).toBe(false);
    });

    it('returns false for validation errors', () => {
      const error = new ValidationError('Invalid input');
      expect(isRetryableError(error)).toBe(false);
    });

    it('returns true for retryable API errors', () => {
      const error = new APIError('Server error', 500, true);
      expect(isRetryableError(error)).toBe(true);
    });

    it('returns false for non-retryable API errors', () => {
      const error = new APIError('Bad request', 400, false);
      expect(isRetryableError(error)).toBe(false);
    });
  });

  describe('getErrorCode', () => {
    it('extracts error code from error', () => {
      const error = new NetworkError('Failed');
      expect(getErrorCode(error)).toBe(ErrorCode.NETWORK_ERROR);
    });

    it('extracts code from normalized error', () => {
      const error = new Error('ECONNREFUSED');
      expect(getErrorCode(error)).toBe(ErrorCode.NETWORK_ERROR);
    });
  });

  describe('isErrorType', () => {
    it('checks if error is specific type', () => {
      const error = new NetworkError('Failed');
      expect(isErrorType(error, ErrorCode.NETWORK_ERROR)).toBe(true);
      expect(isErrorType(error, ErrorCode.AUTH_ERROR)).toBe(false);
    });
  });

  describe('Error classes', () => {
    it('NetworkError has correct properties', () => {
      const error = new NetworkError('Connection failed', new Error('original'));
      expect(error.code).toBe(ErrorCode.NETWORK_ERROR);
      expect(error.retryable).toBe(true);
      expect(error.originalError).toBeDefined();
    });

    it('AuthError has correct properties', () => {
      const error = new AuthError('Unauthorized');
      expect(error.code).toBe(ErrorCode.AUTH_ERROR);
      expect(error.retryable).toBe(false);
    });

    it('ValidationError includes field', () => {
      const error = new ValidationError('Required', 'email');
      expect(error.code).toBe(ErrorCode.VALIDATION_ERROR);
      expect(error.field).toBe('email');
    });

    it('APIError includes status code', () => {
      const error = new APIError('Server error', 500, true);
      expect(error.code).toBe(ErrorCode.API_ERROR);
      expect(error.statusCode).toBe(500);
      expect(error.retryable).toBe(true);
    });
  });
});

