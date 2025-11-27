import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, ActivityIndicator, View, StyleSheet, Animated } from 'react-native';
import { getButtonAccessibilityProps, type AccessibilityProps } from '@/utils/accessibility';

export interface AccessibleButtonProps extends Omit<TouchableOpacityProps, 'accessibilityRole' | 'accessibilityLabel' | 'accessibilityHint' | 'accessibilityState'> {
  /**
   * Accessibility label for the button (required for screen readers)
   */
  accessibilityLabel: string;
  /**
   * Optional hint to provide additional context
   */
  accessibilityHint?: string;
  /**
   * Show loading state
   */
  loading?: boolean;
  /**
   * Children to render inside the button
   */
  children: React.ReactNode;
}

/**
 * AccessibleButton - A TouchableOpacity wrapper with built-in accessibility support
 * 
 * @example
 * <AccessibleButton
 *   accessibilityLabel="Sync mailbox"
 *   accessibilityHint="Synchronizes your Gmail inbox with the app"
 *   onPress={handleSync}
 *   disabled={isSyncing}
 *   loading={isSyncing}
 * >
 *   <Text>Sync</Text>
 * </AccessibleButton>
 */
export function AccessibleButton({
  accessibilityLabel,
  accessibilityHint,
  disabled,
  loading,
  children,
  style,
  onPress,
  ...props
}: AccessibleButtonProps) {
  const accessibilityProps = getButtonAccessibilityProps(accessibilityLabel, {
    hint: accessibilityHint,
    disabled: disabled || loading,
    busy: loading,
  });
  
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled || loading) return;
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      tension: 300,
      friction: 20,
    }).start();
  };

  const handlePressOut = () => {
    if (disabled || loading) return;
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 20,
    }).start();
  };

  return (
    <TouchableOpacity
      {...props}
      {...accessibilityProps}
      disabled={disabled || loading}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[style, (disabled || loading) && styles.disabled]}
      activeOpacity={1}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="currentColor" />
          </View>
        ) : (
          children
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  disabled: {
    opacity: 0.5,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});


