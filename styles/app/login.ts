import { StyleSheet } from 'react-native';

export function createLoginStyles(colors: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      flexGrow: 1,
    },
    header: {
      alignItems: 'center',
      marginTop: 40,
    },
    iconContainer: {
      width: 96,
      height: 96,
      borderRadius: 48,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 24,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    title: {
      fontSize: 36,
      fontWeight: '800',
      marginBottom: 12,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 17,
      textAlign: 'center',
      lineHeight: 24,
      paddingHorizontal: 20,
    },
    features: {
      gap: 20,
    },
    feature: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      padding: 16,
      borderRadius: 16,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 1,
    },
    featureIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    featureContent: {
      flex: 1,
    },
    featureTitle: {
      fontSize: 16,
      fontWeight: '700',
      marginBottom: 4,
    },
    featureText: {
      fontSize: 14,
      lineHeight: 20,
    },
    errorContainer: {
      backgroundColor: '#FFEBEE',
      padding: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#FFCDD2',
    },
    errorText: {
      color: '#D32F2F',
      fontSize: 14,
      textAlign: 'center',
    },
    buttonContainer: {
      gap: 12,
    },
    signInButton: {
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      shadowColor: '#007AFF',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 5,
    },
    googleIcon: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: '#4285F4',
      alignItems: 'center',
      justifyContent: 'center',
    },
    googleIconText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '700',
    },
    signInText: {
      fontSize: 17,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    demoButton: {
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    demoButtonText: {
      fontSize: 17,
      fontWeight: '600',
    },
    disclaimer: {
      fontSize: 12,
      textAlign: 'center',
      lineHeight: 16,
      paddingHorizontal: 20,
    },
  });
}

