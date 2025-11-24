import { StyleSheet } from 'react-native';

export function createToolsStyles(colors: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      paddingHorizontal: 16,
      paddingBottom: 8,
    },
    title: {
      fontSize: 32,
      fontWeight: '700',
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 16,
    },
    scrollContent: {
      padding: 16,
    },
    toolCard: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 16,
      padding: 20,
      marginBottom: 12,
      gap: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    iconContainer: {
      width: 56,
      height: 56,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    toolContent: {
      flex: 1,
    },
    toolTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 4,
    },
    toolDescription: {
      fontSize: 14,
      lineHeight: 20,
    },
  });
}

