import { useState, useCallback, useEffect } from 'react';
import { Toast } from '@/components/common/Toast';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface UseToastReturn {
  toast: ToastMessage | null;
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  hideToast: () => void;
}

/**
 * useToast - Hook for showing toast notifications
 * 
 * @example
 * const { showToast } = useToast();
 * showToast('Email archived successfully', 'success');
 */
export function useToast(): UseToastReturn {
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', duration = 3000) => {
      const id = Date.now().toString();
      setToast({ id, message, type, duration });
    },
    []
  );

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  // Auto-hide toast after duration
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        hideToast();
      }, toast.duration || 3000);

      return () => clearTimeout(timer);
    }
  }, [toast, hideToast]);

  return {
    toast,
    showToast,
    hideToast,
  };
}

