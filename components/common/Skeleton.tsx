import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface SkeletonProps {
  /**
   * Width of the skeleton (number, percentage string, or '100%')
   */
  width?: number | string;
  /**
   * Height of the skeleton
   */
  height?: number;
  /**
   * Border radius
   */
  borderRadius?: number;
  /**
   * Custom style
   */
  style?: StyleProp<ViewStyle>;
  /**
   * Whether to show shimmer animation (default: true)
   */
  animated?: boolean;
}

/**
 * Base Skeleton component with shimmer animation
 * 
 * @example
 * <Skeleton width={100} height={20} />
 * <Skeleton width="100%" height={50} borderRadius={8} />
 */
export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
  animated = true,
}: SkeletonProps) {
  const { colors } = useTheme();
  const shimmerAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animated) return;

    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnimation, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    shimmer.start();
    return () => shimmer.stop();
  }, [animated, shimmerAnimation]);

  const shimmerOpacity = shimmerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.6],
  });

  const baseColor = colors.surfaceSecondary || colors.border || '#E5E5E5';
  const shimmerColor = colors.surface || '#F5F5F5';

  return (
    <View
      style={[
        styles.container,
        {
          width,
          height,
          borderRadius,
          backgroundColor: baseColor,
        },
        style,
      ]}
      accessible={false}
      accessibilityElementsHidden={true}
    >
      {animated && (
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: shimmerColor,
              opacity: shimmerOpacity,
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
});





