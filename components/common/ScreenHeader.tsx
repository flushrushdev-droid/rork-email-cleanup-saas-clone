import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { ChevronLeft, LucideIcon } from 'lucide-react-native';
import { EdgeInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { AccessibleButton } from './AccessibleButton';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightAction?: {
    icon: LucideIcon;
    onPress: () => void;
    label: string;
  };
  backgroundColor?: string;
  titleColor?: string;
  subtitleColor?: string;
  backButtonColor?: string;
  insets: EdgeInsets;
  style?: StyleProp<ViewStyle>;
}

export function ScreenHeader({
  title,
  subtitle,
  onBack,
  rightAction,
  backgroundColor,
  titleColor,
  subtitleColor,
  backButtonColor,
  insets,
  style,
}: ScreenHeaderProps) {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      try {
        // @ts-ignore - canGoBack is available in expo-router
        if (typeof router.canGoBack === 'function' ? router.canGoBack() : true) {
          router.back();
        } else {
          router.replace('/');
        }
      } catch {
        router.replace('/');
      }
    }
  };

  const finalBackgroundColor = backgroundColor || colors.surface;
  const finalTitleColor = titleColor || colors.text;
  const finalSubtitleColor = subtitleColor || colors.textSecondary;
  const finalBackButtonColor = backButtonColor || colors.text;

  const RightIcon = rightAction?.icon;

  return (
    <View style={[styles.container, { backgroundColor: finalBackgroundColor, paddingTop: insets.top + 16 }, style]}>
      <View style={styles.content}>
        {onBack !== null && (
          <AccessibleButton
            style={styles.backButton}
            onPress={handleBack}
            accessibilityLabel="Go back"
            accessibilityHint="Returns to the previous screen"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ChevronLeft size={28} color={finalBackButtonColor} />
          </AccessibleButton>
        )}
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: finalTitleColor }]}>{title}</Text>
          {subtitle && <Text style={[styles.subtitle, { color: finalSubtitleColor }]}>{subtitle}</Text>}
        </View>
        {rightAction && RightIcon && (
          <AccessibleButton
            style={styles.rightAction}
            onPress={rightAction.onPress}
            accessibilityLabel={rightAction.label}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <RightIcon size={24} color={finalTitleColor} />
          </AccessibleButton>
        )}
        {!rightAction && onBack !== null && <View style={{ width: 40 }} />}
      </View>
    </View>
  );
}

function createStyles(colors: any) {
  return StyleSheet.create({
    container: {
      paddingBottom: 16,
      paddingHorizontal: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    backButton: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    titleContainer: {
      flex: 1,
      marginLeft: 12,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
    },
    subtitle: {
      fontSize: 14,
      marginTop: 4,
    },
    rightAction: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}


