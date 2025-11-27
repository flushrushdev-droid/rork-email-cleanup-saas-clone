import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { AccessibleButton } from './AccessibleButton';
import { useTheme } from '@/contexts/ThemeContext';
import { formatAccessibilityLabel } from '@/utils/accessibility';

interface StatCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  onPress?: () => void;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  iconColor?: string;
  valueColor?: string;
  labelColor?: string;
  style?: StyleProp<ViewStyle>;
  variant?: 'default' | 'compact';
}

export function StatCard({
  icon: Icon,
  value,
  label,
  onPress,
  testID,
  accessibilityLabel,
  accessibilityHint,
  iconColor,
  valueColor,
  labelColor,
  style,
  variant = 'default',
}: StatCardProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors, variant);

  const finalIconColor = iconColor || (variant === 'default' ? colors.surface + 'CC' : colors.text);
  const finalValueColor = valueColor || (variant === 'default' ? colors.surface : colors.text);
  const finalLabelColor = labelColor || (variant === 'default' ? colors.surface + 'CC' : colors.textSecondary);

  const defaultAccessibilityLabel = accessibilityLabel || formatAccessibilityLabel('{label}: {value}', { label, value: String(value) });

  const content = (
    <>
      {variant === 'compact' ? (
        <>
          <View style={styles.compactIconContainer}>
            <Icon size={18} color={finalIconColor} />
          </View>
          <View style={styles.compactContent}>
            <Text style={[styles.compactValue, { color: finalValueColor }]} numberOfLines={1}>
              {String(value)}
            </Text>
            <Text style={[styles.compactLabel, { color: finalLabelColor }]} numberOfLines={2} adjustsFontSizeToFit={true} minimumFontScale={0.8}>
              {label}
            </Text>
          </View>
        </>
      ) : (
        <>
          <Icon size={20} color={finalIconColor} />
          <Text style={[styles.value, { color: finalValueColor }]}>{value}</Text>
          <Text style={[styles.label, { color: finalLabelColor }]}>{label}</Text>
        </>
      )}
    </>
  );

  if (onPress) {
    return (
      <AccessibleButton
        testID={testID}
        style={[styles.container, style]}
        onPress={onPress}
        accessibilityLabel={defaultAccessibilityLabel}
        accessibilityHint={accessibilityHint}
      >
        {content}
      </AccessibleButton>
    );
  }

  return (
    <View testID={testID} style={[styles.container, style]} accessible={true} accessibilityLabel={defaultAccessibilityLabel}>
      {content}
    </View>
  );
}

function createStyles(colors: any, variant: 'default' | 'compact') {
  return StyleSheet.create({
    container: {
      alignItems: variant === 'compact' ? 'flex-start' : 'center',
      gap: variant === 'compact' ? 8 : 8,
      ...(variant === 'compact' && {
        flexDirection: 'row',
        padding: 10,
        borderRadius: 8,
        gap: 10,
        minWidth: 0, // Allow flex shrinking
        justifyContent: 'flex-start',
        alignItems: 'center',
      }),
    },
    value: {
      fontSize: 18,
      fontWeight: '700',
    },
    label: {
      fontSize: 12,
      fontWeight: '500',
    },
    compactIconContainer: {
      flexShrink: 0,
      alignItems: 'center',
      justifyContent: 'center',
    },
    compactContent: {
      flex: 1,
      minWidth: 0, // Allow flex shrinking
      justifyContent: 'center',
    },
    compactValue: {
      fontSize: 18,
      fontWeight: '700',
      marginBottom: 2,
    },
    compactLabel: {
      fontSize: 11,
      fontWeight: '500',
      lineHeight: 13,
    },
  });
}

