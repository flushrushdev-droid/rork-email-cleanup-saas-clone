import createContextHook from '@nkzw/create-context-hook';
import { useEffect, useState, useRef } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import * as Linking from 'expo-linking';
// import * as Crypto from 'expo-crypto'; // Unused for now
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import type { AuthTokens, User } from '@/constants/types';
import { createScopedLogger } from '@/utils/logger';
import { AppConfig, getRedirectUri, validateSecureUrl } from '@/config/env';
import { isValidOAuthCode } from '@/utils/security';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CLIENT_ID = AppConfig.google.clientId;

/**
 * Get redirect URI based on platform:
 * - Web: Uses configured redirect base URL (auto-detects localhost or production)
 * - Android/iOS: Uses web-based redirect URI (Google doesn't accept exp:// or custom schemes)
 *   The web callback page will redirect back to the app using deep linking
 */
function getPlatformRedirectUri(): string {
  if (Platform.OS === 'web') {
    // For web, auto-detect the current origin
    return getRedirectUri();
  }
  
  // For native platforms (Android & iOS), use web-based redirect URI
  // This works because:
  // 1. Google accepts web URIs (https://rork.com/auth/callback or http://localhost:8081/auth/callback)
  // 2. The web callback page will detect mobile and redirect back to app via deep link
  // 3. The app will receive the deep link and process the OAuth code
  return `${AppConfig.redirectBaseUrl}/auth/callback`;
}

const REDIRECT_URI = getPlatformRedirectUri();

// Initialize scoped logger for auth context
const authLogger = createScopedLogger('Auth');

// Log OAuth configuration in development only
authLogger.debug('OAuth configuration', {
  redirectUri: REDIRECT_URI,
  clientId: GOOGLE_CLIENT_ID ? `${GOOGLE_CLIENT_ID.substring(0, 10)}...` : 'not set',
  platform: Platform.OS,
});

const STORAGE_KEYS = {
  TOKENS: 'auth_tokens', // Used with SecureStore (no @ prefix needed)
  USER: '@auth_user', // Used with AsyncStorage (non-sensitive)
  DEMO_MODE: '@demo_mode', // Used with AsyncStorage (non-sensitive)
};

const discovery = {
  authorizationEndpoint: AppConfig.google.oauth.authorizationEndpoint,
  tokenEndpoint: AppConfig.google.oauth.tokenEndpoint,
  revocationEndpoint: AppConfig.google.oauth.revocationEndpoint,
};



export const [AuthProvider, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: GOOGLE_CLIENT_ID || '',
      scopes: [
        'openid',
        'profile',
        'email',
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.modify',
        'https://www.googleapis.com/auth/gmail.labels',
      ],
      redirectUri: REDIRECT_URI,
      responseType: AuthSession.ResponseType.Code,
      usePKCE: true,
      extraParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
    discovery
  );

  useEffect(() => {
    loadStoredAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Track if we've processed a deep link to avoid duplicate processing
  const deepLinkProcessedRef = useRef(false);

  useEffect(() => {
    if (!isDemoMode && response?.type === 'success') {
      const { code } = response.params;
      // Validate OAuth code before processing
      if (!code || !isValidOAuthCode(code)) {
        setError('Invalid authorization code');
        setIsLoading(false);
        return;
      }
      exchangeCodeForTokens(code, request?.codeVerifier);
    } else if (!isDemoMode && response?.type === 'error') {
      setError(response.error?.message || 'Authentication failed');
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response, isDemoMode]);

  // Handle deep links from web callback redirect (for native apps using web redirect URI)
  useEffect(() => {
    if (Platform.OS === 'web' || isDemoMode) return;

    const handleDeepLink = async (event: { url: string }) => {
      const url = event.url;
      
      // Check if this is an OAuth callback deep link
      if (url.includes('/auth/callback')) {
        try {
          const parsedUrl = Linking.parse(url);
          const code = parsedUrl.queryParams?.code as string | undefined;
          const error = parsedUrl.queryParams?.error as string | undefined;
          
          if (code && !deepLinkProcessedRef.current) {
            deepLinkProcessedRef.current = true;
            authLogger.debug('Received OAuth code via deep link', { code: code.substring(0, 10) + '...' });
            // Use the code_verifier from the original request if available
            await exchangeCodeForTokens(code, request?.codeVerifier);
          } else if (error) {
            authLogger.error('OAuth error from deep link', { error });
            setError(error);
            setIsLoading(false);
          }
        } catch (err) {
          authLogger.error('Error processing deep link', err);
        }
      }
    };

    // Listen for deep links
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Check if app was opened via deep link (initial URL)
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    return () => {
      subscription.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDemoMode, request]);

  const loadStoredAuth = async () => {
    try {
      // Load non-sensitive data from AsyncStorage
      const [storedUser, storedDemoMode] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.USER),
        AsyncStorage.getItem(STORAGE_KEYS.DEMO_MODE),
      ]);

      if (storedDemoMode === 'true') {
        setIsDemoMode(true);
        setUser({
          id: 'demo',
          email: 'demo@example.com',
          name: 'Demo User',
          provider: 'google',
        });
        setIsLoading(false);
        return;
      }

      // Load sensitive tokens from SecureStore
      const storedTokens = await SecureStore.getItemAsync(STORAGE_KEYS.TOKENS);

      if (storedTokens && storedUser) {
        const parsedTokens: AuthTokens = JSON.parse(storedTokens);
        const parsedUser: User = JSON.parse(storedUser);

        if (parsedTokens.expiresAt > Date.now()) {
          setTokens(parsedTokens);
          setUser(parsedUser);
        } else if (parsedTokens.refreshToken) {
          await refreshAccessToken(parsedTokens.refreshToken);
        } else {
          await clearAuth();
        }
      }
    } catch (err) {
      authLogger.error('Error loading stored auth', err);
    } finally {
      setIsLoading(false);
    }
  };

  const exchangeCodeForTokens = async (code: string, codeVerifier?: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.append('code', code);
      if (GOOGLE_CLIENT_ID) {
        params.append('client_id', GOOGLE_CLIENT_ID);
      }
      params.append('redirect_uri', REDIRECT_URI);
      params.append('grant_type', 'authorization_code');

      // For web OAuth, Google requires client_secret even with PKCE
      // For native apps (Android/iOS), PKCE alone is sufficient
      if (Platform.OS === 'web' && AppConfig.google.clientSecret) {
        params.append('client_secret', AppConfig.google.clientSecret);
      }

      // Add PKCE code_verifier if available (for additional security)
      if (codeVerifier) {
        params.append('code_verifier', codeVerifier);
      }

      // Validate token endpoint is HTTPS in production
      const validatedTokenEndpoint = validateSecureUrl(discovery.tokenEndpoint);
      
      const response = await fetch(validatedTokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error_description || 'Token exchange failed');
      }

      const data = await response.json();
      
      const newTokens: AuthTokens = {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: Date.now() + data.expires_in * 1000,
        idToken: data.id_token,
      };

      await fetchUserInfo(newTokens.accessToken);
      setTokens(newTokens);
      // Store tokens securely in SecureStore
      await SecureStore.setItemAsync(STORAGE_KEYS.TOKENS, JSON.stringify(newTokens));
    } catch (err) {
      authLogger.error('Error exchanging code for tokens', err);
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserInfo = async (accessToken: string) => {
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user info');
      }

      const data = await response.json();
      
      const newUser: User = {
        id: data.id,
        email: data.email,
        name: data.name,
        picture: data.picture,
        provider: 'google',
      };

      setUser(newUser);
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
    } catch (err) {
      authLogger.error('Error fetching user info', err);
      throw err;
    }
  };

  const refreshAccessToken = async (refreshToken: string) => {
    try {
      const params = new URLSearchParams();
      params.append('refresh_token', refreshToken);
      if (GOOGLE_CLIENT_ID) {
        params.append('client_id', GOOGLE_CLIENT_ID);
      }
      params.append('grant_type', 'refresh_token');

      // Validate token endpoint is HTTPS in production
      const validatedTokenEndpoint = validateSecureUrl(discovery.tokenEndpoint);
      
      const response = await fetch(validatedTokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      
      const newTokens: AuthTokens = {
        accessToken: data.access_token,
        refreshToken: refreshToken,
        expiresAt: Date.now() + data.expires_in * 1000,
      };

      setTokens(newTokens);
      // Store tokens securely in SecureStore
      await SecureStore.setItemAsync(STORAGE_KEYS.TOKENS, JSON.stringify(newTokens));
      
      return newTokens.accessToken;
    } catch (err) {
      authLogger.error('Error refreshing token', err);
      await clearAuth();
      throw err;
    }
  };

  const signIn = async () => {
    try {
      setError(null);
      setIsLoading(true);
      await promptAsync();
    } catch (err) {
      authLogger.error('Error signing in', err);
      setError(err instanceof Error ? err.message : 'Sign in failed');
      setIsLoading(false);
    }
  };

  const signInDemo = async (): Promise<boolean> => {
    try {
      authLogger.info('Starting demo sign in');
      setIsLoading(true);
      setError(null);
      
      await AsyncStorage.setItem(STORAGE_KEYS.DEMO_MODE, 'true');
      
      setIsDemoMode(true);
      setUser({
        id: 'demo',
        email: 'demo@example.com',
        name: 'Demo User',
        provider: 'google',
      });
      
      authLogger.info('Demo sign in complete');
      setIsLoading(false);
      return true;
    } catch (err) {
      authLogger.error('Error signing in to demo', err);
      setError('Failed to enter demo mode');
      setIsLoading(false);
      return false;
    }
  };

  const signOut = async () => {
    try {
      if (tokens?.accessToken) {
        await fetch(`${discovery.revocationEndpoint}?token=${tokens.accessToken}`, {
          method: 'POST',
        });
      }
    } catch (err) {
      authLogger.error('Error revoking token', err);
    } finally {
      await clearAuth();
    }
  };

  const clearAuth = async () => {
    setUser(null);
    setTokens(null);
    setIsDemoMode(false);
    // Remove tokens from SecureStore
    await SecureStore.deleteItemAsync(STORAGE_KEYS.TOKENS).catch(() => {
      // Ignore errors if item doesn't exist
    });
    // Remove non-sensitive data from AsyncStorage
    await AsyncStorage.multiRemove([STORAGE_KEYS.USER, STORAGE_KEYS.DEMO_MODE]);
  };

  const getValidAccessToken = async (): Promise<string | null> => {
    if (!tokens) return null;

    if (tokens.expiresAt > Date.now() + 60000) {
      return tokens.accessToken;
    }

    if (tokens.refreshToken) {
      try {
        return await refreshAccessToken(tokens.refreshToken);
      } catch {
        return null;
      }
    }

    return null;
  };

  return {
    user,
    tokens,
    isLoading,
    error,
    isAuthenticated: !!user && (!!tokens || isDemoMode),
    isDemoMode,
    signIn,
    signInDemo,
    signOut,
    getValidAccessToken,
  };
});
