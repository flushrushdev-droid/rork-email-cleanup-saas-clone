import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { OptimizedImage } from './OptimizedImage';
import { useTheme } from '@/contexts/ThemeContext';
import { AppText } from './AppText';

export interface AvatarProps {
  /** Profile picture URL */
  picture?: string | null;
  /** User name or email for fallback initials */
  name?: string;
  /** User email for fallback initials */
  email?: string;
  /** Size of the avatar */
  size?: number;
  /** Custom style */
  style?: ViewStyle | ViewStyle[];
  /** Background color for fallback (defaults to theme primary) */
  backgroundColor?: string;
  /** Text color for initials (defaults to theme surface) */
  textColor?: string;
  /** Accessibility label */
  accessibilityLabel?: string;
}

/**
 * Avatar - A reusable avatar component with optimized image loading
 * 
 * Features:
 * - Uses OptimizedImage for profile pictures
 * - Falls back to colored initials avatar if no picture
 * - Consistent sizing and styling
 * - Theme-aware colors
 * 
 * @example
 * // With profile picture
 * <Avatar
 *   picture={user.picture}
 *   name={user.name}
 *   email={user.email}
 *   size={40}
 * />
 * 
 * @example
 * // Without picture (shows initials)
 * <Avatar
 *   name="John Doe"
 *   email="john@example.com"
 *   size={40}
 * />
 */
export function Avatar({
  picture,
  name,
  email,
  size = 40,
  style,
  backgroundColor,
  textColor,
  accessibilityLabel,
}: AvatarProps) {
  const { colors } = useTheme();
  
  const bgColor = backgroundColor || colors.primary;
  const txtColor = textColor || colors.surface;
  
  // Generate initials from name or email
  const getInitials = (): string => {
    if (name) {
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return name[0]?.toUpperCase() || '';
    }
    if (email) {
      return email[0]?.toUpperCase() || '';
    }
    return '?';
  };

  const initials = getInitials();
  
  // Generate accessibility label
  const a11yLabel = accessibilityLabel || (name ? `${name}'s avatar` : email ? `${email}'s avatar` : 'User avatar');

  const avatarStyle = [
    styles.avatar,
    {
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: bgColor,
    },
    style,
  ];

  // If we have a picture URL, use OptimizedImage with fallback
  if (picture) {
    return (
      <OptimizedImage
        source={{ uri: picture }}
        style={avatarStyle}
        contentFit="cover"
        cachePolicy="memory-disk"
        transition={200}
        showPlaceholder={true}
        fallback={
          <View style={avatarStyle} accessible={true} accessibilityLabel={a11yLabel}>
            <AppText 
              allowFontScaling={false}
              style={[styles.initials, { color: txtColor, fontSize: size * 0.4 }]}
            >
              {initials}
            </AppText>
          </View>
        }
        accessible={true}
        accessibilityLabel={a11yLabel}
      />
    );
  }

  // Fallback to colored initials avatar
  return (
    <View style={avatarStyle} accessible={true} accessibilityLabel={a11yLabel}>
      <AppText 
        allowFontScaling={false}
        style={[styles.initials, { color: txtColor, fontSize: size * 0.4 }]}
      >
        {initials}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  initials: {
    fontWeight: '600',
    textAlign: 'center',
  },
});

