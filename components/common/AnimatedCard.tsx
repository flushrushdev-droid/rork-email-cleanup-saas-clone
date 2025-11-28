import React, { useRef } from 'react';
import { TouchableOpacity, Animated, ViewStyle, TouchableOpacityProps } from 'react-native';

export interface AnimatedCardProps extends TouchableOpacityProps {
  children: React.ReactNode;
  scaleValue?: number;
  duration?: number;
  style?: ViewStyle;
  onPress?: () => void;
}

/**
 * AnimatedCard - Card component with subtle press animations
 * 
 * Provides gentle scale feedback on card press for better interactivity
 * 
 * @example
 * <AnimatedCard
 *   onPress={handlePress}
 *   style={cardStyles}
 * >
 *   <CardContent />
 * </AnimatedCard>
 */
export function AnimatedCard({
  children,
  scaleValue = 0.98,
  duration = 150,
  style,
  onPress,
  disabled,
  ...props
}: AnimatedCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled || !onPress) return;
    
    Animated.spring(scaleAnim, {
      toValue: scaleValue,
      useNativeDriver: true,
      tension: 300,
      friction: 20,
    }).start();
  };

  const handlePressOut = () => {
    if (disabled || !onPress) return;
    
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
      disabled={disabled}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
}




