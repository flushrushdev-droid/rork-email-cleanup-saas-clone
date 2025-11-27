import React, { useEffect, useRef } from 'react';
import { Modal, View, StyleSheet, Animated, TouchableOpacity, Platform, KeyboardAvoidingView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';

export interface AnimatedModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  animationType?: 'fade' | 'slide' | 'scale';
  presentationStyle?: 'fullScreen' | 'pageSheet' | 'formSheet' | 'overFullScreen';
  position?: 'center' | 'bottom';
  onBackdropPress?: boolean | (() => void);
  disableBackdropPress?: boolean;
}

/**
 * AnimatedModal - Reusable modal component with smooth animations
 * 
 * Supports fade, slide, and scale animations with backdrop fade
 * 
 * @example
 * <AnimatedModal
 *   visible={isVisible}
 *   onClose={handleClose}
 *   animationType="scale"
 * >
 *   <YourModalContent />
 * </AnimatedModal>
 */
export function AnimatedModal({
  visible,
  onClose,
  children,
  animationType = 'scale',
  presentationStyle = 'overFullScreen',
  position = 'center',
  onBackdropPress,
  disableBackdropPress = false,
}: AnimatedModalProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;
  const translateY = useRef(new Animated.Value(position === 'bottom' ? 300 : 50)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Animate in
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        animationType === 'scale' && Animated.spring(scale, {
          toValue: 1,
          tension: 65,
          friction: 10,
          useNativeDriver: true,
        }),
        animationType === 'fade' && Animated.timing(opacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        animationType === 'slide' && Animated.spring(translateY, {
          toValue: 0,
          tension: 65,
          friction: 10,
          useNativeDriver: true,
        }),
        animationType === 'scale' && position === 'bottom' && Animated.spring(translateY, {
          toValue: 0,
          tension: 65,
          friction: 10,
          useNativeDriver: true,
        }),
      ].filter(Boolean) as Animated.CompositeAnimation[]).start();
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        animationType === 'scale' && Animated.timing(scale, {
          toValue: 0.9,
          duration: 150,
          useNativeDriver: true,
        }),
        animationType === 'fade' && Animated.timing(opacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        animationType === 'slide' && Animated.timing(translateY, {
          toValue: position === 'bottom' ? 300 : 50,
          duration: 150,
          useNativeDriver: true,
        }),
        animationType === 'scale' && position === 'bottom' && Animated.timing(translateY, {
          toValue: 300,
          duration: 150,
          useNativeDriver: true,
        }),
      ].filter(Boolean) as Animated.CompositeAnimation[]).start();
    }
  }, [visible, animationType, backdropOpacity, scale, opacity, translateY]);

  const handleBackdropPress = () => {
    if (disableBackdropPress) return;
    
    if (onBackdropPress === true || typeof onBackdropPress === 'function') {
      if (typeof onBackdropPress === 'function') {
        onBackdropPress();
      } else {
        onClose();
      }
    }
  };

  const contentStyle = {
    ...(animationType === 'scale' && position === 'center' && { transform: [{ scale }] }),
    ...(animationType === 'scale' && position === 'bottom' && { transform: [{ translateY }] }),
    ...(animationType === 'fade' && { opacity }),
    ...(animationType === 'slide' && { transform: [{ translateY }] }),
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      presentationStyle={presentationStyle}
      onRequestClose={onClose}
      statusBarTranslucent={Platform.OS === 'android'}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.backdrop}
          onPress={handleBackdropPress}
          disabled={disableBackdropPress || !onBackdropPress}
        >
          <Animated.View
            style={[
              styles.backdropAnimated,
              { opacity: backdropOpacity, backgroundColor: 'rgba(0, 0, 0, 0.5)' },
            ]}
          />
        </TouchableOpacity>

        <View style={position === 'bottom' ? styles.contentWrapperBottom : styles.contentWrapper} pointerEvents="box-none">
          <Animated.View
            style={[
              position === 'bottom' ? styles.contentBottom : styles.content,
              contentStyle,
              { backgroundColor: colors.surface },
            ]}
          >
            {children}
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  backdropAnimated: {
    ...StyleSheet.absoluteFillObject,
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '90%',
    maxWidth: 500,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  contentBottom: {
    width: '100%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  contentWrapperBottom: {
    flex: 1,
    justifyContent: 'flex-end',
  },
});

