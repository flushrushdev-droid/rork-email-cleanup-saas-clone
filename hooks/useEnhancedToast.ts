import { useCallback } from 'react';
import { useToastContext } from '@/contexts/ToastContext';
import type { ToastType, ToastAction } from '@/contexts/ToastContext';
import { triggerSuccessHaptic, triggerErrorHaptic, triggerWarningHaptic } from '@/utils/haptics';

interface ShowToastOptions {
  duration?: number;
  action?: ToastAction;
  onUndo?: () => void;
  onDismiss?: () => void;
  haptic?: boolean; // Whether to trigger haptic feedback
}

/**
 * useEnhancedToast - Convenience hook for showing toast notifications with haptic feedback
 * 
 * @example
 * const { showSuccess, showError, showWarning, showInfo } = useEnhancedToast();
 * showSuccess('Email sent successfully!');
 * showError('Failed to send email', { action: { label: 'Retry', onPress: handleRetry } });
 */
export function useEnhancedToast() {
  const { showToast, hideToast, hideAllToasts } = useToastContext();

  const showSuccess = useCallback(
    (message: string, options?: ShowToastOptions) => {
      if (options?.haptic !== false) {
        triggerSuccessHaptic();
      }
      return showToast(message, 'success', options);
    },
    [showToast]
  );

  const showError = useCallback(
    (message: string, options?: ShowToastOptions) => {
      if (options?.haptic !== false) {
        triggerErrorHaptic();
      }
      return showToast(message, 'error', options);
    },
    [showToast]
  );

  const showWarning = useCallback(
    (message: string, options?: ShowToastOptions) => {
      if (options?.haptic !== false) {
        triggerWarningHaptic();
      }
      return showToast(message, 'warning', options);
    },
    [showToast]
  );

  const showInfo = useCallback(
    (message: string, options?: ShowToastOptions) => {
      return showToast(message, 'info', options);
    },
    [showToast]
  );

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    hideToast,
    hideAllToasts,
  };
}

