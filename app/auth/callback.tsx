import { useEffect } from 'react';
import { Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { AppConfig } from '@/config/env';
import { isValidOAuthCode, isValidOAuthState } from '@/utils/security';

export default function AuthCallback() {
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    // Check if we're in a web browser
    const isWebBrowser = Platform.OS === 'web' || (typeof window !== 'undefined' && typeof document !== 'undefined');
    
    if (isWebBrowser) {
      // We're in a web browser
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const error = urlParams.get('error');
      const errorDescription = urlParams.get('error_description');
      
      // Detect if we're in a mobile browser
      const isMobileBrowser = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        typeof navigator !== 'undefined' ? navigator.userAgent : ''
      );
      
      if (code && isMobileBrowser) {
        // Validate OAuth code
        if (!isValidOAuthCode(code)) {
          router.replace('/login?error=invalid_code');
          return;
        }
        
        // Mobile browser: redirect to app via deep link
        const appScheme = AppConfig.appScheme;
        const state = urlParams.get('state') || '';
        
        // Validate state parameter if present
        if (state && !isValidOAuthState(state)) {
          router.replace('/login?error=invalid_state');
          return;
        }
        
        const deepLink = `${appScheme}://auth/callback?code=${encodeURIComponent(code)}${state ? `&state=${encodeURIComponent(state)}` : ''}`;
        window.location.href = deepLink;
      } else if (code) {
        // Validate OAuth code
        if (!isValidOAuthCode(code)) {
          router.replace('/login?error=invalid_code');
          return;
        }
        
        // Desktop web: Check if we're in a popup window
        const isPopup = window.opener !== null;
        
        if (isPopup) {
          // Popup - expo-auth-session will handle closing it
          setTimeout(() => {
            if (window.opener) {
              window.close();
            } else {
              router.replace('/');
            }
          }, 500);
        } else {
          // Not in a popup - redirect normally
          router.replace('/');
        }
      } else if (error && isMobileBrowser) {
        // Mobile browser with error
        const appScheme = AppConfig.appScheme;
        const deepLink = `${appScheme}://login?error=${encodeURIComponent(error)}${errorDescription ? `&error_description=${encodeURIComponent(errorDescription)}` : ''}`;
        window.location.href = deepLink;
      } else if (error) {
        // Desktop web with error
        router.replace('/login');
      } else {
        // No code or error
        router.replace('/');
      }
    } else {
      // Native app: Deep link received with OAuth code
      if (params.code) {
        // Validate OAuth code
        if (!isValidOAuthCode(params.code as string)) {
          router.replace('/login?error=invalid_code');
          return;
        }
        
        // Validate state parameter if present
        if (params.state && !isValidOAuthState(params.state as string)) {
          router.replace('/login?error=invalid_state');
          return;
        }
        
        // AuthContext will handle the code in background
        // Redirect instantly to syncing screen (no intermediate loading)
        router.replace('/syncing');
      } else if (params.error) {
        // Error received via deep link
        router.replace(`/login?error=${params.error}`);
      } else {
        // No params - just go home
        router.replace('/');
      }
    }
  }, [params, router]);

  // Return null - no UI shown, processing happens in background
  return null;
}
