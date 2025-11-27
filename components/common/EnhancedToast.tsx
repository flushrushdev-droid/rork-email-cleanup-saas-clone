import React, { useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, Animated, TouchableOpacity, Dimensions, InteractionManager } from 'react-native';
import { AppText } from './AppText';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { CheckCircle, AlertCircle, Info, X, AlertTriangle } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { ToastMessage } from '@/contexts/ToastContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = 100;

export interface EnhancedToastProps {
  toast: ToastMessage;
  onDismiss: () => void;
  index: number;
  position?: 'top' | 'bottom';
}

/**
 * EnhancedToast - Advanced toast notification component with swipe-to-dismiss, animations, and action buttons
 * 
 * @example
 * <EnhancedToast toast={toast} onDismiss={handleDismiss} index={0} position="top" />
 */
export function EnhancedToast({ toast, onDismiss, index, position = 'top' }: EnhancedToastProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    // Animate in
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 8,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 65,
        friction: 8,
      }),
    ]).start();
  }, []);

  const dismissToast = useCallback((direction: 'left' | 'right' = 'right') => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 0.95,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  }, [translateX, opacity, scale, onDismiss]);

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((e) => {
      translateX.setValue(e.translationX);
      // Fade out as we swipe
      const opacityValue = Math.max(0.3, 1 - Math.abs(e.translationX) / SCREEN_WIDTH);
      opacity.setValue(opacityValue);
    })
    .onEnd((e) => {
      if (Math.abs(e.translationX) > SWIPE_THRESHOLD) {
        dismissToast(e.translationX > 0 ? 'right' : 'left');
      } else {
        // Snap back
        Animated.parallel([
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            tension: 65,
            friction: 8,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      }
    })
    .shouldCancelWhenOutside(true);

  const getIcon = () => {
    const iconProps = { size: 20, color: colors.surface };
    switch (toast.type) {
      case 'success':
        return <CheckCircle {...iconProps} />;
      case 'error':
        return <AlertCircle {...iconProps} />;
      case 'warning':
        return <AlertTriangle {...iconProps} />;
      case 'info':
      default:
        return <Info {...iconProps} />;
    }
  };

  const getBackgroundColor = () => {
    switch (toast.type) {
      case 'success':
        return colors.success;
      case 'error':
        return colors.danger;
      case 'warning':
        return colors.warning;
      case 'info':
      default:
        return colors.primary;
    }
  };

  // Calculate vertical offset based on index and position
  const verticalOffset = index * (60 + 8); // Toast height + gap

  return (
    <Animated.View
      style={[
        styles.container,
        {
          top: position === 'top' ? insets.top + 16 + verticalOffset : undefined,
          bottom: position === 'bottom' ? insets.bottom + 16 + verticalOffset : undefined,
          opacity,
          transform: [
            { translateX },
            { translateY },
            { scale },
          ],
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
        <GestureDetector gesture={panGesture}>
          <View style={styles.content}>
            {getIcon()}
            <AppText style={[styles.message, { color: colors.surface }]} numberOfLines={3} dynamicTypeStyle="body">
              {String(toast.message || '')}
            </AppText>
          </View>
        </GestureDetector>

        <View style={styles.actions}>
            {toast.onUndo && (
              <TouchableOpacity
                onPress={(e) => {
                  // Prevent gesture handler from interfering
                  e.stopPropagation();
                  
                  // Capture undo handler before dismissing
                  const undoHandler = toast.onUndo;
                  
                  // Dismiss toast FIRST to avoid state update conflicts
                  dismissToast();
                  
                  // Then call the undo handler after toast is dismissed
                  setTimeout(() => {
                    try {
                      if (undoHandler) {
                        undoHandler();
                      }
                    } catch (error) {
                      console.error('Error in toast undo handler:', error);
                    }
                  }, 300);
                }}
                style={styles.actionButton}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Undo action"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                activeOpacity={0.7}
              >
                <AppText style={[styles.actionText, { color: colors.surface }]} dynamicTypeStyle="caption">Undo</AppText>
              </TouchableOpacity>
            )}

            {toast.action && (() => {
              // Capture the action handler and properties before rendering to avoid stale references
              const actionHandler = toast.action.onPress;
              const actionLabel = toast.action.label;
              const actionStyle = toast.action.style;
              
              return (
                <TouchableOpacity
                  key={`action-${toast.id}`}
                  onPress={(e) => {
                    // Prevent gesture handler from interfering
                    e.stopPropagation();
                    
                    // Capture handler in closure to ensure we have the right reference
                    const handler = actionHandler;
                    
                    // Dismiss toast FIRST to avoid state update conflicts
                    dismissToast();
                    
                    // Then call the action handler after toast is dismissed
                    // Use a longer delay to ensure toast is fully unmounted on Android
                    setTimeout(() => {
                      try {
                        if (handler) {
                          handler();
                        }
                      } catch (error) {
                        console.error('Error in toast action handler:', error);
                      }
                    }, 300);
                  }}
                  style={styles.actionButton}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={actionLabel}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  activeOpacity={0.7}
                >
                  <AppText
                    style={[
                      styles.actionText,
                      {
                        color: actionStyle === 'destructive' 
                          ? colors.danger 
                          : colors.surface,
                        fontWeight: '600',
                      },
                    ]}
                    dynamicTypeStyle="caption"
                  >
                    {actionLabel}
                  </AppText>
                </TouchableOpacity>
              );
            })()}

            <TouchableOpacity
              onPress={() => dismissToast()}
              style={styles.dismissButton}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Dismiss notification"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={18} color={colors.surface} />
            </TouchableOpacity>
          </View>
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
    padding: 14,
    borderRadius: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    minHeight: 60,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '500',
  },
  dismissButton: {
    padding: 4,
  },
});

