import React from 'react';
import { View, TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { AccessibleButton } from './AccessibleButton';
import { AppText } from './AppText';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  iconSize?: number;
  iconColor?: string;
  showIconContainer?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  iconSize = 64,
  iconColor,
  showIconContainer = false,
  style,
}: EmptyStateProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const finalIconColor = iconColor || colors.textSecondary;

  return (
    <View style={[styles.container, style]} accessible={true} accessibilityRole="text">
      {showIconContainer ? (
        <View style={[styles.iconContainer, { backgroundColor: colors.surface }]}>
          <Icon size={iconSize} color={finalIconColor} />
        </View>
      ) : (
        <Icon size={iconSize} color={finalIconColor} />
      )}
      <AppText 
        dynamicTypeStyle="title3" 
        maxFontSizeMultiplier="heading"
        style={[styles.title, { color: colors.text }]}
      >
        {title}
      </AppText>
      <AppText 
        dynamicTypeStyle="body"
        maxFontSizeMultiplier="body"
        style={[styles.description, { color: colors.textSecondary }]}
      >
        {description}
      </AppText>
      {actionLabel && onAction && (
        <AccessibleButton
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={onAction}
          accessibilityLabel={actionLabel}
        >
          <AppText 
            maxFontSizeMultiplier="button"
            style={[styles.actionButtonText, { color: colors.surface }]}
          >
            {actionLabel}
          </AppText>
        </AccessibleButton>
      )}
    </View>
  );
}

import type { ThemeColors } from '@/constants/colors';

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 40,
      paddingHorizontal: 20,
    },
    iconContainer: {
      width: 120,
      height: 120,
      borderRadius: 60,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
    },
    title: {
      fontWeight: '700',
      marginTop: 16,
      marginBottom: 8,
      textAlign: 'center',
    },
    description: {
      textAlign: 'center',
      marginBottom: 20,
    },
    actionButton: {
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
      marginTop: 8,
    },
    actionButtonText: {
      fontSize: 16,
      fontWeight: '600',
    },
  });
}


