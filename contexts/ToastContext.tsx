import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastAction {
  label: string;
  onPress: () => void;
  style?: 'default' | 'destructive';
}

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  action?: ToastAction;
  onUndo?: () => void;
  onDismiss?: () => void;
}

interface ToastContextValue {
  toasts: ToastMessage[];
  showToast: (
    message: string,
    type?: ToastType,
    options?: {
      duration?: number;
      action?: ToastAction;
      onUndo?: () => void;
      onDismiss?: () => void;
    }
  ) => string;
  hideToast: (id: string) => void;
  hideAllToasts: () => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function useToastContext(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within ToastProvider');
  }
  return context;
}

const MAX_TOASTS = 3;
const DEFAULT_DURATION = 3000;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const timersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => {
      const toast = prev.find((t) => t.id === id);
      if (toast?.onDismiss) {
        toast.onDismiss();
      }
      
      // Clear timer
      const timer = timersRef.current.get(id);
      if (timer) {
        clearTimeout(timer);
        timersRef.current.delete(id);
      }
      
      return prev.filter((t) => t.id !== id);
    });
  }, []);

  const showToast = useCallback(
    (
      message: string,
      type: ToastType = 'info',
      options?: {
        duration?: number;
        action?: ToastAction;
        onUndo?: () => void;
        onDismiss?: () => void;
      }
    ): string => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const duration = options?.duration ?? DEFAULT_DURATION;

      const newToast: ToastMessage = {
        id,
        message,
        type,
        duration,
        action: options?.action,
        onUndo: options?.onUndo,
        onDismiss: options?.onDismiss,
      };

      setToasts((prev) => {
        // Remove oldest toast if we're at max
        const updated = [...prev, newToast];
        if (updated.length > MAX_TOASTS) {
          const removed = updated.shift()!;
          // Clear timer for removed toast
          const timer = timersRef.current.get(removed.id);
          if (timer) {
            clearTimeout(timer);
            timersRef.current.delete(removed.id);
          }
          if (removed.onDismiss) {
            removed.onDismiss();
          }
        }
        return updated;
      });

      // Auto-hide toast after duration (unless it has an action or undo)
      if (duration > 0 && !options?.action && !options?.onUndo) {
        const timer = setTimeout(() => {
          hideToast(id);
        }, duration);
        timersRef.current.set(id, timer);
      }

      return id;
    },
    [hideToast]
  );

  const hideAllToasts = useCallback(() => {
    toasts.forEach((toast) => {
      const timer = timersRef.current.get(toast.id);
      if (timer) {
        clearTimeout(timer);
        timersRef.current.delete(timer);
      }
      if (toast.onDismiss) {
        toast.onDismiss();
      }
    });
    timersRef.current.clear();
    setToasts([]);
  }, [toasts]);

  return (
    <ToastContext.Provider
      value={{
        toasts,
        showToast,
        hideToast,
        hideAllToasts,
      }}
    >
      {children}
    </ToastContext.Provider>
  );
}

