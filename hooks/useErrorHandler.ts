import { useState, useCallback } from 'react';
import {
  normalizeError,
  formatErrorMessage,
  isRetryableError,
  type AppError,
  ErrorCode,
} from '@/utils/errorHandling';
import { createScopedLogger } from '@/utils/logger';
import { useEnhancedToast } from '@/hooks/useEnhancedToast';

const errorHandlerLogger = createScopedLogger('ErrorHandler');

export interface UseErrorHandlerOptions {
  /**
   * Show error as Alert dialog
   */
  showAlert?: boolean;
  /**
   * Show retry option in alert
   */
  showRetryInAlert?: boolean;
  /**
   * Custom error formatter
   */
  formatError?: (error: AppError) => string;
  /**
   * Callback when error occurs
   */
  onError?: (error: AppError) => void;
  /**
   * Log errors to console
   */
  logErrors?: boolean;
}

export interface UseErrorHandlerReturn {
  /**
   * Current error state
   */
  error: AppError | null;
  /**
   * Clear error state
   */
  clearError: () => void;
  /**
   * Handle an error
   */
  handleError: (error: unknown, options?: UseErrorHandlerOptions) => AppError;
  /**
   * Handle async operation with error handling
   */
  handleAsync: <T>(
    asyncFn: () => Promise<T>,
    options?: UseErrorHandlerOptions
  ) => Promise<T | null>;
  /**
   * Show error as alert
   */
  showError: (error: unknown, options?: UseErrorHandlerOptions) => void;
}

/**
 * useErrorHandler - Centralized error handling hook
 * 
 * @example
 * const { handleError, handleAsync, error } = useErrorHandler();
 * 
 * // Handle async operation
 * const result = await handleAsync(async () => {
 *   return await syncMailbox();
 * });
 * 
 * // Handle error manually
 * try {
 *   await someOperation();
 * } catch (err) {
 *   handleError(err, { showAlert: true });
 * }
 */
export function useErrorHandler(
  defaultOptions?: UseErrorHandlerOptions
): UseErrorHandlerReturn {
  const [error, setError] = useState<AppError | null>(null);
  const { showError: showErrorToast } = useEnhancedToast();

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleError = useCallback(
    (error: unknown, options?: UseErrorHandlerOptions): AppError => {
      const appError = normalizeError(error);
      const opts = { ...defaultOptions, ...options };

      // Log error if enabled
      if (opts.logErrors !== false) {
        errorHandlerLogger.error('Error handled', appError.originalError || appError, {
          errorCode: appError.code,
          isRetryable: isRetryableError(appError),
        });
      }

      // Set error state
      setError(appError);

      // Call custom error handler
      if (opts.onError) {
        opts.onError(appError);
      }

      // Show toast if requested
      if (opts.showAlert) {
        const message = opts.formatError
          ? opts.formatError(appError)
          : formatErrorMessage(appError);

        if (opts.showRetryInAlert && isRetryableError(appError)) {
          // For retryable errors, show toast with retry action
          // Note: Retry logic should be handled by caller via onError callback
          showErrorToast(message, {
            action: {
              label: 'Retry',
              onPress: () => {
                // Retry logic should be handled by caller
              },
            },
            duration: 0, // Don't auto-dismiss if retry is available
          });
        } else {
          showErrorToast(message);
        }
      }

      return appError;
    },
    [defaultOptions, showErrorToast]
  );

  const handleAsync = useCallback(
    async <T,>(
      asyncFn: () => Promise<T>,
      options?: UseErrorHandlerOptions
    ): Promise<T | null> => {
      try {
        clearError();
        const result = await asyncFn();
        return result;
      } catch (err) {
        handleError(err, options);
        return null;
      }
    },
    [clearError, handleError]
  );

  const showError = useCallback(
    (error: unknown, options?: UseErrorHandlerOptions) => {
      handleError(error, { ...options, showAlert: true });
    },
    [handleError]
  );

  return {
    error,
    clearError,
    handleError,
    handleAsync,
    showError,
  };
}

/**
 * Helper hook for async operations with retry
 */
export function useAsyncWithRetry<T>(
  asyncFn: () => Promise<T>,
  options?: UseErrorHandlerOptions & {
    maxRetries?: number;
    retryDelay?: number;
  }
) {
  const { handleError, handleAsync } = useErrorHandler(options);
  const [isLoading, setIsLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const execute = useCallback(
    async (): Promise<T | null> => {
      setIsLoading(true);
      setRetryCount(0);

      const maxRetries = options?.maxRetries || 3;
      const retryDelay = options?.retryDelay || 1000;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          const result = await asyncFn();
          setIsLoading(false);
          setRetryCount(0);
          return result;
        } catch (err) {
          const appError = normalizeError(err);
          
          if (attempt < maxRetries && isRetryableError(appError)) {
            setRetryCount(attempt + 1);
            // Wait before retry
            await new Promise((resolve) => setTimeout(resolve, retryDelay * (attempt + 1)));
            continue;
          }

          // Max retries reached or non-retryable error
          setIsLoading(false);
          handleError(err, options);
          return null;
        }
      }

      setIsLoading(false);
      return null;
    },
    [asyncFn, options, handleError]
  );

  return {
    execute,
    isLoading,
    retryCount,
  };
}


