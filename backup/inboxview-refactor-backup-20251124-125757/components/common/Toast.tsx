import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { ToastMessage, ToastType } from '@/hooks/useToast';

export interface ToastProps {
  toast: ToastMessage | null;
  onDismiss: () => void;
  position?: 'top' | 'bottom';
}

/**
 * Toast - Non-blocking notification component
 * 
 * @example
 * <Toast toast={toast} onDismiss={hideToast} />
 */
export function Toast({ toast, onDismiss, position = 'top' }: ToastProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [fadeAnim] = React.useState(new Animated.Value(0));
  const [slideAnim] = React.useState(new Animated.Value(position === 'top' ? -100 : 100));

  useEffect(() => {
    if (toast) {
      // Show animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 65,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Hide animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: position === 'top' ? -100 : 100,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [toast, fadeAnim, slideAnim, position]);

  if (!toast) return null;

  const getIcon = () => {
    const iconProps = { size: 20, color: '#FFFFFF' };
    switch (toast.type) {
      case 'success':
        return <CheckCircle {...iconProps} />;
      case 'error':
        return <AlertCircle {...iconProps} />;
      case 'warning':
        return <AlertCircle {...iconProps} />;
      case 'info':
      default:
        return <Info {...iconProps} />;
    }
  };

  const getBackgroundColor = () => {
    switch (toast.type) {
      case 'success':
        return colors.success || '#34C759';
      case 'error':
        return colors.danger || '#FF3B30';
      case 'warning':
        return colors.warning || '#FF9500';
      case 'info':
      default:
        return colors.primary || '#007AFF';
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          top: position === 'top' ? insets.top + 16 : undefined,
          bottom: position === 'bottom' ? insets.bottom + 16 : undefined,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
      pointerEvents="box-none"
    >
      <View
        style={[
          styles.toast,
          { backgroundColor: getBackgroundColor() },
        ]}
        accessible={true}
        accessibilityRole="alert"
        accessibilityLabel={`${toast.type} notification: ${toast.message}`}
      >
        {getIcon()}
        <Text style={styles.message} numberOfLines={2}>
          {toast.message}
        </Text>
        <TouchableOpacity
          onPress={onDismiss}
          accessibilityLabel="Dismiss notification"
          accessibilityRole="button"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <X size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  message: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
});

