import React from 'react';
import { View, StyleSheet, Platform, Text } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { createScopedLogger } from '@/utils/logger';
import { isDevelopmentMode } from '@/utils/debugDetection';

export default function StorybookScreen() {
  const { colors } = useTheme();

  // Storybook is only available on native platforms (iOS/Android)
  // It doesn't work with Expo's web bundler due to incompatible dependencies
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.messageContainer, { backgroundColor: colors.surface }]}>
          <Text style={[styles.message, { color: colors.text }]}>
            Storybook is only available on native platforms (iOS/Android).
          </Text>
          <Text style={[styles.subMessage, { color: colors.textSecondary }]}>
            Please use Expo Go or a development build to view Storybook.
          </Text>
        </View>
      </View>
    );
  }

  // Dynamically import Storybook only on native platforms
  // This prevents web bundler from trying to resolve Storybook dependencies
  const [StorybookComponent, setStorybookComponent] = React.useState<React.ComponentType | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (Platform.OS !== 'web') {
      // Use dynamic import - Metro will automatically use .native.js on native platforms
      import('../.storybook')
        .then((module) => {
          setStorybookComponent(() => module.default);
        })
        .catch((err) => {
          // Only log in development (Storybook is dev-only anyway)
          if (isDevelopmentMode()) {
            const storybookLogger = createScopedLogger('Storybook');
            storybookLogger.warn('Failed to load Storybook', err);
          }
          setError('Failed to load Storybook. Make sure all dependencies are installed.');
        });
    }
  }, []);

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.messageContainer, { backgroundColor: colors.surface }]}>
          <Text style={[styles.message, { color: colors.text }]}>{error}</Text>
        </View>
      </View>
    );
  }

  if (!StorybookComponent) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.messageContainer, { backgroundColor: colors.surface }]}>
          <Text style={[styles.message, { color: colors.text }]}>Loading Storybook...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StorybookComponent />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  message: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  subMessage: {
    fontSize: 14,
    textAlign: 'center',
  },
});

