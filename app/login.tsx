import React, { useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, ActivityIndicator, useWindowDimensions } from 'react-native';
import { Mail, Shield, Zap, Lock } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { AppText } from '@/components/common/AppText';
import { rowText } from '@/styles/layout';
import { Screen } from '@/components/layout/Screen';

export default function LoginScreen() {
  const { signIn, signInDemo, isLoading, error, isAuthenticated } = useAuth();
  const { colors } = useTheme();
  useSafeAreaInsets();
  const { height, fontScale } = useWindowDimensions();
  const router = useRouter();

  // Responsive tweaks so the screen fits without needing to scroll on smaller devices
  const effectiveHeight = height / Math.min(fontScale || 1, 1.4);
  const isSmall = effectiveHeight < 760;
  const handleSignIn = async () => {
    try {
      await signIn();
    } catch (err) {
      console.error('Sign in error:', err);
    }
  };

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      console.log('Authenticated, navigating to home');
      router.replace('/');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleTryDemo = async () => {
    console.log('Try Demo button pressed');
    try {
      console.log('Starting demo mode...');
      await signInDemo();
      console.log('Demo mode set successfully');
    } catch (err) {
      console.error('Demo sign in error:', err);
    }
  };

  return (
    <Screen
      scroll={false}
      topPadding={isSmall ? 8 : 16}
      style={{ paddingHorizontal: isSmall ? 16 : 24 }}
      footer={(
        <>
          {error && (
            <View style={styles.errorContainer}>
              <AppText style={styles.errorText}>{error}</AppText>
            </View>
          )}

          <View style={[styles.buttonContainer, { gap: isSmall ? 8 : 10 }]}>
            <TouchableOpacity
              style={[
                styles.signInButton,
                {
                  backgroundColor: colors.primary,
                  paddingVertical: isSmall ? 12 : 14,
                },
              ]}
              onPress={handleSignIn}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <View style={[styles.googleIcon, { width: isSmall ? 20 : 22, height: isSmall ? 20 : 22, borderRadius: isSmall ? 10 : 11 }]}>
                    <AppText style={[styles.googleIconText, { fontSize: isSmall ? 14 : 15 }]}>G</AppText>
                  </View>
                  <AppText style={[styles.signInText, { fontSize: isSmall ? 15 : 16 }]}>
                    Continue with Google
                  </AppText>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
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
              activeOpacity={0.8}
            >
              <AppText style={[styles.demoButtonText, { color: colors.primary, fontSize: isSmall ? 15 : 16 }]}>
                Try Demo
              </AppText>
            </TouchableOpacity>
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

const styles = StyleSheet.create({
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
