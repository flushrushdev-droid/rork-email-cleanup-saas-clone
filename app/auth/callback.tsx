import { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { createAuthCallbackStyles } from '@/styles/app/auth/callback';

export default function AuthCallback() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = createAuthCallbackStyles(colors);

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/');
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={[styles.text, { color: colors.textSecondary }]}>Completing authentication...</Text>
    </View>
  );
}
