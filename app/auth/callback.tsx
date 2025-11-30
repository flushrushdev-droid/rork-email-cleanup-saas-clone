import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Platform, Linking } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { createAuthCallbackStyles } from '@/styles/app/auth/callback';
import { AppConfig } from '@/config/env';
import { isValidOAuthCode, isValidOAuthState } from '@/utils/security';

export default function AuthCallback() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { colors } = useTheme();
  const styles = createAuthCallbackStyles(colors);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Check if we're in a web browser (either desktop web or mobile browser)
    const isWebBrowser = Platform.OS === 'web' || (typeof window !== 'undefined' && typeof document !== 'undefined');
    
    if (isWebBrowser) {
      // We're in a web browser - check if we need to redirect to app
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const error = urlParams.get('error');
      const errorDescription = urlParams.get('error_description');
      
      // Detect if we're in a mobile browser (user agent check)
      const isMobileBrowser = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        typeof navigator !== 'undefined' ? navigator.userAgent : ''
      );
      
      if (code && isMobileBrowser) {
        // Validate OAuth code before processing
        if (!isValidOAuthCode(code)) {
          router.replace('/login?error=invalid_code');
          return;
        }
        
        // Mobile browser: redirect to app via deep link
        setIsRedirecting(true);
        const appScheme = AppConfig.appScheme;
        const state = urlParams.get('state') || '';
        
        // Validate state parameter if present
        if (state && !isValidOAuthState(state)) {
          router.replace('/login?error=invalid_state');
          return;
        }
        
        const deepLink = `${appScheme}://auth/callback?code=${encodeURIComponent(code)}${state ? `&state=${encodeURIComponent(state)}` : ''}`;
        
        // Try to open the app via deep link
        window.location.href = deepLink;
        
        // Fallback: If deep link doesn't work, show instructions
        setTimeout(() => {
          alert('Please return to the app to complete authentication');
        }, 1000);
      } else if (code) {
        // Validate OAuth code before processing
        if (!isValidOAuthCode(code)) {
          router.replace('/login?error=invalid_code');
          return;
        }
        // Desktop web: Check if we're in a popup window
        // If so, expo-auth-session will handle it via WebBrowser.maybeCompleteAuthSession()
        // We need to wait a bit for the session to complete before redirecting
        const isPopup = window.opener !== null;
        
        if (isPopup) {
          // We're in a popup - expo-auth-session will handle closing it
          // Just wait a moment for the session to complete
          const timer = setTimeout(() => {
            // Close the popup if it's still open
            if (window.opener) {
              window.close();
            } else {
              // If popup was already closed, redirect to home
              router.replace('/');
            }
          }, 1000);
          return () => clearTimeout(timer);
        } else {
          // Not in a popup - redirect normally
          const timer = setTimeout(() => {
            router.replace('/');
          }, 2000);
          return () => clearTimeout(timer);
        }
      } else if (error && isMobileBrowser) {
        // Mobile browser with error: redirect to app
        const appScheme = AppConfig.appScheme;
        const deepLink = `${appScheme}://login?error=${encodeURIComponent(error)}${errorDescription ? `&error_description=${encodeURIComponent(errorDescription)}` : ''}`;
        window.location.href = deepLink;
      } else if (error) {
        // Desktop web with error: just redirect to login
        router.replace('/login');
      } else {
        // No code or error: just redirect to home
        const timer = setTimeout(() => {
          router.replace('/');
        }, 2000);
        return () => clearTimeout(timer);
      }
    } else {
      // Native app: If we got here via deep link, validate parameters
      if (params.code) {
        // Validate OAuth code before processing
        if (!isValidOAuthCode(params.code as string)) {
          router.replace('/login?error=invalid_code');
          return;
        }
        
        // Validate state parameter if present
        if (params.state && !isValidOAuthState(params.state as string)) {
          router.replace('/login?error=invalid_state');
          return;
        }
        
        // AuthContext will handle the code, just show loading and redirect to home
        const timer = setTimeout(() => {
          router.replace('/');
        }, 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [params, router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={[styles.text, { color: colors.textSecondary }]}>
        {isRedirecting ? 'Redirecting to app...' : 'Completing authentication...'}
      </Text>
    </View>
  );
}
