import React, { useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Mail, Shield, Zap, Lock } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const { signIn, signInDemo, isLoading, error, isAuthenticated } = useAuth();
  const insets = useSafeAreaInsets();
  const router = useRouter();
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
    <View style={styles.container}>
      <View style={[styles.content, { paddingTop: 60 + insets.top, paddingBottom: 40 + insets.bottom }]}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Mail size={48} color="#007AFF" strokeWidth={2} />
            </View>
            <Text style={styles.title}>Email Cleanup</Text>
            <Text style={styles.subtitle}>
              Take control of your inbox with AI-powered email management
            </Text>
          </View>

          <View style={styles.features}>
            <View style={styles.feature}>
              <View style={styles.featureIcon}>
                <Zap size={24} color="#007AFF" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Smart Cleanup</Text>
                <Text style={styles.featureText}>
                  AI identifies and removes email noise automatically
                </Text>
              </View>
            </View>

            <View style={styles.feature}>
              <View style={styles.featureIcon}>
                <Shield size={24} color="#34C759" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Secure & Private</Text>
                <Text style={styles.featureText}>
                  Your data stays encrypted and under your control
                </Text>
              </View>
            </View>

            <View style={styles.feature}>
              <View style={styles.featureIcon}>
                <Lock size={24} color="#FF9500" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>OAuth Protected</Text>
                <Text style={styles.featureText}>
                  Industry-standard authentication via Google
                </Text>
              </View>
            </View>
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.signInButton}
              onPress={handleSignIn}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <View style={styles.googleIcon}>
                    <Text style={styles.googleIconText}>G</Text>
                  </View>
                  <Text style={styles.signInText}>Continue with Google</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.demoButton}
              onPress={handleTryDemo}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <Text style={styles.demoButtonText}>Try Demo</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.disclaimer}>
            By continuing, you agree to grant read and modify access to your Gmail account
          </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#FFFFFF',
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
    color: '#000000',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 17,
    color: '#6B7280',
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
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  featureText: {
    fontSize: 14,
    color: '#6B7280',
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
    backgroundColor: '#007AFF',
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
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#007AFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  demoButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#007AFF',
  },
  disclaimer: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 20,
  },
});
