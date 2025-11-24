import React from 'react';
import { Link, Stack } from 'expo-router';
import { View, Text } from 'react-native';
import { AlertCircle } from 'lucide-react-native';

import { useTheme } from '@/contexts/ThemeContext';
import { createNotFoundStyles } from '@/styles/app/not-found';

export default function NotFoundScreen() {
  const { colors } = useTheme();
  const styles = React.useMemo(() => createNotFoundStyles(colors), [colors]);

  return (
    <>
      <Stack.Screen options={{ title: 'Page Not Found' }} />
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <AlertCircle size={64} color={colors.textSecondary} />
        </View>
        <Text style={styles.title}>Page Not Found</Text>
        <Text style={styles.subtitle}>The page you&apos;re looking for doesn&apos;t exist.</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Go to Home</Text>
        </Link>
      </View>
    </>
  );
}
