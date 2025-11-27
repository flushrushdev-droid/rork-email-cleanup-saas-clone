import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Haptic feedback utility functions
 * 
 * Provides consistent haptic feedback across the app with error handling.
 * Automatically handles platform differences and gracefully fails on unsupported devices.
 */

/**
 * Trigger light haptic feedback (for subtle interactions)
 * @example
 * triggerHaptic('light');
 * // Use for: button taps, tab switches, light interactions
 */
export async function triggerHaptic(type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'light') {
  // Haptics only work on native platforms
  if (Platform.OS === 'web') {
    return;
  }

  try {
    switch (type) {
      case 'light':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'medium':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'heavy':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      case 'success':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'warning':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;
      case 'error':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
    }
  } catch (error) {
    // Silently fail - haptics may not be available on all devices
    // Don't log errors as this is expected behavior on some platforms
  }
}

/**
 * Trigger haptic feedback for button press
 * Use for general button interactions
 */
export async function triggerButtonHaptic() {
  await triggerHaptic('light');
}

/**
 * Trigger haptic feedback for action (archive, delete, etc.)
 * Use for important actions that change state
 */
export async function triggerActionHaptic() {
  await triggerHaptic('medium');
}

/**
 * Trigger haptic feedback for destructive action (delete, remove)
 * Use for actions that permanently remove data
 */
export async function triggerDestructiveHaptic() {
  await triggerHaptic('medium');
}

/**
 * Trigger haptic feedback for success action
 * Use for successful operations
 */
export async function triggerSuccessHaptic() {
  await triggerHaptic('success');
}

/**
 * Trigger haptic feedback for error
 * Use for error states
 */
export async function triggerErrorHaptic() {
  await triggerHaptic('error');
}

/**
 * Trigger haptic feedback for warning
 * Use for warning states
 */
export async function triggerWarningHaptic() {
  await triggerHaptic('warning');
}

/**
 * Trigger haptic feedback for pull-to-refresh
 * Subtle feedback when refresh starts
 */
export async function triggerRefreshHaptic() {
  await triggerHaptic('light');
}


