import React, { useRef } from 'react';
import { TouchableOpacity, Animated, StyleSheet, ViewStyle, TouchableOpacityProps } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

export interface AnimatedButtonProps extends TouchableOpacityProps {
  children: React.ReactNode;
  animationType?: 'scale' | 'opacity' | 'both';
  scaleValue?: number;
  duration?: number;
  style?: ViewStyle;
  onPress?: () => void;
}

/**
 * AnimatedButton - Button component with press animations
 * 
 * Provides micro-interaction feedback on button press with scale/opacity animations
 * 
 * @example
 * <AnimatedButton
 *   animationType="scale"
 *   onPress={handlePress}
 *   style={buttonStyles}
 * >
 *   <Text>Press Me</Text>
 * </AnimatedButton>
 */
export function AnimatedButton({
  children,
  animationType = 'scale',
  scaleValue = 0.95,
  duration = 100,
  style,
  onPress,
  disabled,
  ...props
}: AnimatedButtonProps) {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled) return;
    
    if (animationType === 'scale' || animationType === 'both') {
      Animated.spring(scaleAnim, {
        toValue: scaleValue,
        useNativeDriver: true,
        tension: 300,
        friction: 20,
      }).start();
    }
    
    if (animationType === 'opacity' || animationType === 'both') {
      Animated.timing(opacityAnim, {
        toValue: 0.7,
        duration: duration,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (disabled) return;
    
    if (animationType === 'scale' || animationType === 'both') {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 20,
      }).start();
    }
    
    if (animationType === 'opacity' || animationType === 'both') {
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: duration,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePress = () => {
    if (disabled) return;
    onPress?.();
  };

  const animatedStyle = {
    ...(animationType === 'scale' || animationType === 'both' ? { transform: [{ scale: scaleAnim }] } : {}),
    ...(animationType === 'opacity' || animationType === 'both' ? { opacity: opacityAnim } : {}),
  };

  return (
    <TouchableOpacity
      {...props}
      disabled={disabled}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={animationType === 'opacity' || animationType === 'both' ? 1 : 0.9}
    >
      <Animated.View style={[animatedStyle, style]}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
}

