import { StyleSheet } from 'react-native';
import type { ThemeColors } from '@/constants/colors';

export function createNotFoundStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      backgroundColor: colors.background,
    },
    iconContainer: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 24,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 32,
    },
    link: {
      backgroundColor: colors.primary,
      paddingHorizontal: 32,
      paddingVertical: 14,
      borderRadius: 12,
    },
    linkText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
    },
  });
}

