import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { AccessibleButton } from './AccessibleButton';

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
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.description, { color: colors.textSecondary }]}>{description}</Text>
      {actionLabel && onAction && (
        <AccessibleButton
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={onAction}
          accessibilityLabel={actionLabel}
        >
          <Text style={styles.actionButtonText}>{actionLabel}</Text>
        </AccessibleButton>
      )}
    </View>
  );
}

function createStyles(colors: any) {
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
      fontSize: 20,
      fontWeight: '700',
      marginTop: 16,
      marginBottom: 8,
      textAlign: 'center',
    },
    description: {
      fontSize: 16,
      textAlign: 'center',
      marginBottom: 20,
      lineHeight: 22,
    },
    actionButton: {
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
      marginTop: 8,
    },
    actionButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
  });
}


