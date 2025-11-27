import React, { useState } from 'react';
import { View, StyleSheet, ViewStyle, ImageStyle } from 'react-native';
import { Image, ImageProps as ExpoImageProps, ImageContentFit } from 'expo-image';
import { useTheme } from '@/contexts/ThemeContext';
import { Skeleton } from './Skeleton';

export interface OptimizedImageProps extends Omit<ExpoImageProps, 'source' | 'style'> {
  /** Image source URI or require() */
  source: string | number | { uri: string };
  /** Custom style */
  style?: ViewStyle | ImageStyle | (ViewStyle | ImageStyle)[];
  /** Image fit mode */
  contentFit?: ImageContentFit;
  /** Show placeholder/skeleton while loading */
  showPlaceholder?: boolean;
  /** Fallback component to show if image fails to load */
  fallback?: React.ReactNode;
  /** Custom placeholder component */
  placeholder?: React.ReactNode;
  /** Cache policy */
  cachePolicy?: 'none' | 'disk' | 'memory' | 'memory-disk';
  /** Transition duration in milliseconds */
  transition?: number;
  /** Accessibility label */
  accessibilityLabel?: string;
  /** Whether image is accessible */
  accessible?: boolean;
}

/**
 * OptimizedImage - A high-performance image component using expo-image
 * 
 * Features:
 * - Progressive image loading
 * - Built-in caching (memory + disk)
 * - Smooth transitions
 * - Loading placeholders
 * - Error fallbacks
 * - Automatic optimization
 * 
 * @example
 * // Basic usage
 * <OptimizedImage
 *   source={{ uri: 'https://example.com/image.jpg' }}
 *   style={{ width: 100, height: 100 }}
 *   contentFit="cover"
 * />
 * 
 * @example
 * // With placeholder and fallback
 * <OptimizedImage
 *   source={{ uri: user.picture }}
 *   style={styles.avatar}
 *   contentFit="cover"
 *   showPlaceholder={true}
 *   fallback={<AvatarFallback />}
 * />
 */
export function OptimizedImage({
  source,
  style,
  contentFit = 'cover',
  showPlaceholder = false,
  fallback,
  placeholder,
  cachePolicy = 'memory-disk',
  transition = 200,
  accessibilityLabel,
  accessible = true,
  onLoad,
  onError,
  ...props
}: OptimizedImageProps) {
  const { colors } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Convert source to expo-image format
  const imageSource = typeof source === 'string' 
    ? { uri: source }
    : typeof source === 'number'
    ? source
    : source;

  const handleLoad = (event: any) => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.(event);
  };

  const handleError = (error: any) => {
    setIsLoading(false);
    setHasError(true);
    onError?.(error);
  };

  // Show error fallback if provided
  if (hasError && fallback) {
    return <>{fallback}</>;
  }

  // Show custom placeholder or skeleton while loading
  const showLoadingState = isLoading && showPlaceholder;

  // Extract border radius from style for circular placeholders
  const borderRadius = Array.isArray(style)
    ? style.find((s) => s?.borderRadius)?.borderRadius
    : (style as ViewStyle)?.borderRadius;

  return (
    <View style={style} accessible={accessible} accessibilityLabel={accessibilityLabel}>
      {showLoadingState && (
        <View style={[StyleSheet.absoluteFill, { zIndex: 1 }]}>
          {placeholder || (
            <Skeleton
              width="100%"
              height="100%"
              borderRadius={typeof borderRadius === 'number' ? borderRadius : 0}
              style={StyleSheet.absoluteFill}
            />
          )}
        </View>
      )}
      <Image
        {...props}
        source={imageSource}
        style={style}
        contentFit={contentFit}
        cachePolicy={cachePolicy}
        transition={transition}
        onLoad={handleLoad}
        onError={handleError}
        accessible={accessible}
        accessibilityLabel={accessibilityLabel}
      />
    </View>
  );
}

