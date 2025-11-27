import { useState, useCallback, useRef } from 'react';
import { useErrorHandler, type UseErrorHandlerOptions } from './useErrorHandler';

export interface UseAsyncOperationOptions extends UseErrorHandlerOptions {
  /**
   * Disable the operation while loading
   */
  disableOnLoading?: boolean;
  /**
   * Minimum loading time in ms (prevents flash of content)
   */
  minLoadingTime?: number;
  /**
   * Callback when operation starts
   */
  onStart?: () => void;
  /**
   * Callback when operation succeeds
   */
  onSuccess?: () => void;
  /**
   * Callback when operation fails
   */
  onError?: (error: unknown) => void;
}

export interface UseAsyncOperationReturn<T> {
  /**
   * Execute the async operation
   */
  execute: (operation: () => Promise<T>) => Promise<T | null>;
  /**
   * Current loading state
   */
  isLoading: boolean;
  /**
   * Error state (if any)
   */
  error: Error | null;
  /**
   * Clear error state
   */
  clearError: () => void;
}

/**
 * Unified hook for managing async operations with loading states
 * 
 * Provides consistent loading state management, error handling, and optional
 * minimum loading time to prevent content flash.
 * 
 * @example
 * const { execute, isLoading } = useAsyncOperation({
 *   minLoadingTime: 500,
 *   disableOnLoading: true,
 * });
 * 
 * const handleSync = async () => {
 *   await execute(async () => {
 *     return await syncMailbox();
 *   });
 * };
 * 
 * return (
 *   <Button
 *     onPress={handleSync}
 *     disabled={isLoading}
 *     loading={isLoading}
 *   />
 * );
 */
export function useAsyncOperation<T = void>(
  options: UseAsyncOperationOptions = {}
): UseAsyncOperationReturn<T> {
  const {
    minLoadingTime = 0,
    disableOnLoading = true,
    onStart,
    onSuccess,
    onError,
    ...errorHandlerOptions
  } = options;

  const { handleAsync, error, clearError: clearErrorHandler } = useErrorHandler(errorHandlerOptions);
  const [isLoading, setIsLoading] = useState(false);
  const startTimeRef = useRef<number | null>(null);

  const execute = useCallback(
    async (operation: () => Promise<T>): Promise<T | null> => {
      if (disableOnLoading && isLoading) {
        return null;
      }

      // Call onStart callback
      if (onStart) {
        onStart();
      }

      setIsLoading(true);
      startTimeRef.current = Date.now();

      try {
        const result = await handleAsync(operation, errorHandlerOptions);

        // Enforce minimum loading time to prevent flash
        if (minLoadingTime > 0 && startTimeRef.current) {
          const elapsed = Date.now() - startTimeRef.current;
          const remaining = minLoadingTime - elapsed;
          if (remaining > 0) {
            await new Promise((resolve) => setTimeout(resolve, remaining));
          }
        }

        if (onSuccess) {
          onSuccess();
        }

        return result;
      } catch (err) {
        if (onError) {
          onError(err);
        }
        return null;
      } finally {
        setIsLoading(false);
        startTimeRef.current = null;
      }
    },
    [isLoading, disableOnLoading, minLoadingTime, handleAsync, errorHandlerOptions, onStart, onSuccess, onError]
  );

  return {
    execute,
    isLoading,
    error: error || null,
    clearError: clearErrorHandler,
  };
}


