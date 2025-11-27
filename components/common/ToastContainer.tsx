import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useToastContext } from '@/contexts/ToastContext';
import { EnhancedToast } from './EnhancedToast';

export interface ToastContainerProps {
  position?: 'top' | 'bottom';
  maxToasts?: number;
}

/**
 * ToastContainer - Global container for displaying toast notifications
 * Should be placed at the root of the app, typically in _layout.tsx
 * 
 * @example
 * <ToastProvider>
 *   <ToastContainer position="top" />
 *   Your app content here
 * </ToastProvider>
 */
export function ToastContainer({ position = 'top', maxToasts = 3 }: ToastContainerProps) {
  const { toasts, hideToast } = useToastContext();

  // Limit the number of visible toasts
  const visibleToasts = toasts.slice(0, maxToasts);

  return (
    <View style={styles.container} pointerEvents="box-none">
      {visibleToasts.map((toast, index) => (
        <EnhancedToast
          key={toast.id}
          toast={toast}
          onDismiss={() => hideToast(toast.id)}
          index={index}
          position={position}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10000,
    pointerEvents: 'box-none',
  },
});

