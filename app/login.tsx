import React, { useEffect } from 'react';
import { View, useWindowDimensions } from 'react-native';
import { Mail, Shield, Zap, Lock } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { AppText } from '@/components/common/AppText';
import { rowText } from '@/styles/layout';
import { Screen } from '@/components/layout/Screen';
import { AccessibleButton } from '@/components/common/AccessibleButton';
import { ErrorDisplay } from '@/components/common/ErrorDisplay';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { createLoginStyles } from '@/styles/app/login';
import { createScopedLogger } from '@/utils/logger';

const loginLogger = createScopedLogger('Login');

export default function LoginScreen() {
  const { signIn, signInDemo, isLoading, error: authError, isAuthenticated } = useAuth();
  const { colors } = useTheme();
  useSafeAreaInsets();
  const { height, fontScale } = useWindowDimensions();
  const router = useRouter();
  const { handleAsync, error, clearError } = useErrorHandler({ showAlert: false });

  // Responsive tweaks so the screen fits without needing to scroll on smaller devices
  const effectiveHeight = height / Math.min(fontScale || 1, 1.4);
  const isSmall = effectiveHeight < 760;
  
  const handleSignIn = async () => {
    clearError();
    await handleAsync(async () => {
      await signIn();
    }, { showAlert: false });
  };

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      loginLogger.debug('Authenticated, navigating to home');
      router.replace('/');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleTryDemo = async () => {
    clearError();
    await handleAsync(async () => {
      await signInDemo();
    }, { showAlert: false });
  };

  // Use auth error if available, otherwise use error handler error
  const displayError = authError || error;
  const styles = React.useMemo(() => createLoginStyles(colors), [colors]);

  return (
    <Screen
      scroll={false}
      topPadding={isSmall ? 8 : 16}
      style={{ paddingHorizontal: isSmall ? 16 : 24 }}
      footer={(
        <>
          {displayError && (
            <ErrorDisplay
              error={displayError}
              variant="alert"
              onDismiss={clearError}
            />
          )}

          <View style={[styles.buttonContainer, { gap: isSmall ? 8 : 10 }]}>
            <AccessibleButton
              accessibilityLabel="Continue with Google"
              accessibilityHint="Signs in to your Google account to access Gmail"
              style={[
                styles.signInButton,
                {
                  backgroundColor: colors.primary,
                  paddingVertical: isSmall ? 12 : 14,
                },
              ]}
              onPress={handleSignIn}
              disabled={isLoading}
              loading={isLoading}
            >
              <View style={[styles.googleIcon, { width: isSmall ? 20 : 22, height: isSmall ? 20 : 22, borderRadius: isSmall ? 10 : 11 }]}>
                <AppText style={[styles.googleIconText, { fontSize: isSmall ? 14 : 15 }]}>G</AppText>
              </View>
              <AppText style={[styles.signInText, { fontSize: isSmall ? 15 : 16 }]}>
                Continue with Google
              </AppText>
            </AccessibleButton>

            <AccessibleButton
              accessibilityLabel="Try Demo"
              accessibilityHint="Enters demo mode with sample data to explore the app"
              style={[
                styles.demoButton,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.primary,
                  paddingVertical: isSmall ? 12 : 14,
                },
              ]}
              onPress={handleTryDemo}
              disabled={isLoading}
            >
              <AppText style={[styles.demoButtonText, { color: colors.primary, fontSize: isSmall ? 15 : 16 }]}>
                Try Demo
              </AppText>
            </AccessibleButton>
          </View>

          <AppText style={[styles.disclaimer, { color: colors.textSecondary, fontSize: isSmall ? 10 : 11, lineHeight: isSmall ? 13 : 14, paddingHorizontal: isSmall ? 8 : 12, marginTop: isSmall ? 6 : 8 }]}>
            By continuing, you agree to grant read and modify access to your Gmail account
          </AppText>
        </>
      )}
    >
        <View style={[styles.header, { width: '100%', marginTop: 0 }]}>
            <View style={[
              styles.iconContainer,
              { backgroundColor: colors.surface, width: isSmall ? 52 : 72, height: isSmall ? 52 : 72, borderRadius: isSmall ? 26 : 36, marginBottom: isSmall ? 8 : 12 }
            ]}>
              <Mail size={isSmall ? 26 : 36} color={colors.primary} strokeWidth={2} />
            </View>
            <AppText maxFontSizeMultiplier={1.15} style={[styles.title, { color: colors.text, fontSize: isSmall ? 22 : 28, marginBottom: isSmall ? 4 : 6 }]}>
              Email Cleanup
            </AppText>
            <AppText maxFontSizeMultiplier={1.15} style={[styles.subtitle, { color: colors.textSecondary, fontSize: isSmall ? 12 : 14, lineHeight: isSmall ? 17 : 19, paddingHorizontal: isSmall ? 8 : 12 }]}>
              Take control of your inbox with AI-powered email management
            </AppText>
          </View>

          <View style={[styles.features, { gap: isSmall ? 10 : 12, marginTop: isSmall ? 12 : 16 }]}>
            <View style={[styles.feature, { backgroundColor: colors.surface, padding: isSmall ? 10 : 14 }]}>
              <View style={[styles.featureIcon, { backgroundColor: colors.surfaceSecondary, width: isSmall ? 40 : 48, height: isSmall ? 40 : 48, borderRadius: isSmall ? 20 : 24 }]}>
                <Zap size={isSmall ? 20 : 22} color={colors.primary} />
              </View>
              <View style={styles.featureContent}>
                <AppText maxFontSizeMultiplier={1.15} style={[rowText, styles.featureTitle, { color: colors.text, fontSize: isSmall ? 14 : 15 }]}>
                  Smart Cleanup
                </AppText>
                <AppText maxFontSizeMultiplier={1.15} style={[rowText, styles.featureText, { color: colors.textSecondary, fontSize: isSmall ? 12 : 13, lineHeight: isSmall ? 17 : 18 }]}>
                  AI identifies and removes email noise automatically
                </AppText>
              </View>
            </View>

            <View style={[styles.feature, { backgroundColor: colors.surface, padding: isSmall ? 10 : 14 }]}>
              <View style={[styles.featureIcon, { backgroundColor: colors.surfaceSecondary, width: isSmall ? 40 : 48, height: isSmall ? 40 : 48, borderRadius: isSmall ? 20 : 24 }]}>
                <Shield size={isSmall ? 20 : 22} color={colors.success} />
              </View>
              <View style={styles.featureContent}>
                <AppText maxFontSizeMultiplier={1.15} style={[rowText, styles.featureTitle, { color: colors.text, fontSize: isSmall ? 14 : 15 }]}>
                  Secure & Private
                </AppText>
                <AppText maxFontSizeMultiplier={1.15} style={[rowText, styles.featureText, { color: colors.textSecondary, fontSize: isSmall ? 12 : 13, lineHeight: isSmall ? 17 : 18 }]}>
                  Your data stays encrypted and under your control
                </AppText>
              </View>
            </View>

            <View style={[styles.feature, { backgroundColor: colors.surface, padding: isSmall ? 10 : 14 }]}>
              <View style={[styles.featureIcon, { backgroundColor: colors.surfaceSecondary, width: isSmall ? 40 : 48, height: isSmall ? 40 : 48, borderRadius: isSmall ? 20 : 24 }]}>
                <Lock size={isSmall ? 20 : 22} color={colors.warning} />
              </View>
              <View style={styles.featureContent}>
                <AppText maxFontSizeMultiplier={1.15} style={[rowText, styles.featureTitle, { color: colors.text, fontSize: isSmall ? 14 : 15 }]}>
                  OAuth Protected
                </AppText>
                <AppText maxFontSizeMultiplier={1.15} style={[rowText, styles.featureText, { color: colors.textSecondary, fontSize: isSmall ? 12 : 13, lineHeight: isSmall ? 17 : 18 }]}>
                  Industry-standard authentication via Google
                </AppText>
              </View>
      </View>
      </View>
    </Screen>
  );
}
