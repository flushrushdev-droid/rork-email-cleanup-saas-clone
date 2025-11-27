import { StyleSheet } from 'react-native';
import type { ThemeColors } from '@/constants/colors';

export function createAuthCallbackStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background || '#FAFAFA',
      gap: 16,
    },
    text: {
      fontSize: 16,
      color: colors.textSecondary || '#6B7280',
    },
  });
}

