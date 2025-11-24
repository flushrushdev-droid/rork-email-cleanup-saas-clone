import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, ActivityIndicator, View, StyleSheet } from 'react-native';
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
  ...props
}: AccessibleButtonProps) {
  const accessibilityProps = getButtonAccessibilityProps(accessibilityLabel, {
    hint: accessibilityHint,
    disabled: disabled || loading,
    busy: loading,
  });

  return (
    <TouchableOpacity
      {...props}
      {...accessibilityProps}
      disabled={disabled || loading}
      style={[style, (disabled || loading) && styles.disabled]}
      activeOpacity={0.7}
    >
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="currentColor" />
        </View>
      ) : (
        children
      )}
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


