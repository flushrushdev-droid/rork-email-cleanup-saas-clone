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
import { setSentryUser, addBreadcrumb } from '@/lib/sentry';
import { trpcClient } from '@/lib/trpc';
import Constants from 'expo-constants';

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
  const [refreshFailureCount, setRefreshFailureCount] = useState(0);
  const [tokenExpirationWarning, setTokenExpirationWarning] = useState<string | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  
  // Maximum number of consecutive refresh failures before logout
  const MAX_REFRESH_FAILURES = 3;
  
  // Token expiration warning thresholds (in milliseconds)
  const EXPIRATION_WARNING_THRESHOLD = 5 * 60 * 1000; // 5 minutes before expiration
  const EXPIRATION_IMMINENT_THRESHOLD = 1 * 60 * 1000; // 1 minute before expiration
  
  // Session timeout (30 minutes of inactivity)
  const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

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
    if (response) {
      authLogger.debug('OAuth response received', {
        type: response.type,
        error: response.type === 'error' ? response.error : undefined,
        params: response.type === 'success' ? Object.keys(response.params || {}) : undefined,
      });
    }

    if (!isDemoMode && response?.type === 'success') {
      const { code } = response.params;
      // Validate OAuth code before processing
      if (!code || !isValidOAuthCode(code)) {
        authLogger.error('Invalid authorization code', { code: code ? `${code.substring(0, 10)}...` : 'missing' });
        setError('Invalid authorization code');
        setIsLoading(false);
        return;
      }
      authLogger.debug('Exchanging code for tokens', { codeLength: code.length });
      exchangeCodeForTokens(code, request?.codeVerifier);
    } else if (!isDemoMode && response?.type === 'error') {
      const errorMessage = response.error?.message || response.error?.code || 'Authentication failed';
      authLogger.error('OAuth error response', {
        error: response.error,
        errorMessage,
      });
      setError(errorMessage);
      setIsLoading(false);
    } else if (!isDemoMode && response?.type === 'dismiss') {
      authLogger.debug('OAuth popup dismissed by user');
      setError('Sign in cancelled');
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

  // Verify user exists in database
  const verifyUserInDatabase = async (userId: string): Promise<boolean> => {
    try {
      const userData = await trpcClient.users.getById.query({ id: userId });
      return !!userData;
    } catch (err) {
      // Log the error for debugging
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      authLogger.debug('User verification failed', err, {
        userId,
        errorMessage,
        // Check if it's a 404 (route not found) vs user not found
        is404: errorMessage.includes('404') || errorMessage.includes('Not Found'),
      });
      
      // If it's a 404, the route might not be deployed yet - allow login anyway for now
      // This is a temporary workaround until the backend is fully deployed
      if (errorMessage.includes('404') || errorMessage.includes('Not Found')) {
        authLogger.warn('Backend route not found - allowing login (backend may not be deployed yet)');
        return true; // Allow login if route doesn't exist yet
      }
      
      return false; // User doesn't exist
    }
  };

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

      // Load sensitive tokens from SecureStore (native) or localStorage (web)
      let storedTokens: string | null = null;
      if (Platform.OS === 'web') {
        // On web, use localStorage (SecureStore doesn't work on web)
        storedTokens = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEYS.TOKENS) : null;
      } else {
        // On native, use SecureStore
        storedTokens = await SecureStore.getItemAsync(STORAGE_KEYS.TOKENS);
      }

      if (storedTokens && storedUser) {
        const parsedTokens: AuthTokens = JSON.parse(storedTokens);
        const parsedUser: User = JSON.parse(storedUser);

        // Check if tokens are expired
        if (parsedTokens.expiresAt <= Date.now()) {
          // Tokens expired - try to refresh
          if (parsedTokens.refreshToken) {
            try {
              await refreshAccessToken(parsedTokens.refreshToken);
              // After refresh, verify user exists in database
              const userExists = await verifyUserInDatabase(parsedUser.id);
              if (!userExists) {
                authLogger.info('User not found in database after token refresh, clearing auth');
                await clearAuth();
                setIsLoading(false);
                return;
              }
              // Check session timeout
              const lastActivity = lastActivityRef.current;
              const now = Date.now();
              if (now - lastActivity > SESSION_TIMEOUT_MS) {
                authLogger.info('Session timed out, clearing auth');
                await clearAuth();
                setIsLoading(false);
                return;
              }
              lastActivityRef.current = now;
              return;
            } catch (err) {
              authLogger.error('Failed to refresh token on load', err);
              await clearAuth();
              setIsLoading(false);
              return;
            }
          } else {
            // No refresh token - clear auth
            await clearAuth();
            setIsLoading(false);
            return;
          }
        }

        // Tokens are valid - verify user exists in database before auto-login
        const userExists = await verifyUserInDatabase(parsedUser.id);
        
        if (!userExists) {
          authLogger.info('User not found in database, clearing stored auth');
          await clearAuth();
          setIsLoading(false);
          return;
        }

        // Check session timeout (30 minutes of inactivity)
        const lastActivity = lastActivityRef.current;
        const now = Date.now();
        if (now - lastActivity > SESSION_TIMEOUT_MS) {
          authLogger.info('Session timed out, clearing auth');
          await clearAuth();
          setIsLoading(false);
          return;
        }

        // User exists and session is valid - restore auth
        setTokens(parsedTokens);
        setUser(parsedUser);
        lastActivityRef.current = now; // Update last activity
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
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        const errorMessage = errorData.error_description || errorData.error || 'Token exchange failed';
        authLogger.error('Token exchange failed', {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
          redirectUri: REDIRECT_URI,
          clientId: GOOGLE_CLIENT_ID ? `${GOOGLE_CLIENT_ID.substring(0, 10)}...` : 'not set',
        });
        throw new Error(errorMessage);
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
      // Store tokens securely in SecureStore (native) or localStorage (web)
      if (Platform.OS === 'web') {
        // On web, use localStorage (SecureStore doesn't work on web)
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(STORAGE_KEYS.TOKENS, JSON.stringify(newTokens));
        }
      } else {
        // On native, use SecureStore
        await SecureStore.setItemAsync(STORAGE_KEYS.TOKENS, JSON.stringify(newTokens));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
      authLogger.error('Error exchanging code for tokens', err, {
        errorMessage,
        redirectUri: REDIRECT_URI,
        platform: Platform.OS,
      });
      setError(errorMessage);
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
      
      // Create or update user in database
      try {
        const result = await trpcClient.users.upsert.mutate({
          id: newUser.id,
          email: newUser.email,
          name: newUser.name || null,
          picture: newUser.picture || null,
          provider: 'google',
        });
        authLogger.info('User created/updated in database', { userId: newUser.id, email: newUser.email });
      } catch (err) {
        // Log detailed error information
        const errorDetails = err instanceof Error ? {
          message: err.message,
          name: err.name,
          stack: err.stack,
        } : err;
        authLogger.error('Failed to create/update user in database', err, {
          userId: newUser.id,
          email: newUser.email,
          errorDetails,
        });
        // Don't throw - user creation failure shouldn't block login
        // But we should still show a warning in development
        if (__DEV__) {
          console.warn('[Auth] User creation failed - this may be because:');
          console.warn('1. The users table doesn\'t exist in Supabase (run database/users-schema.sql)');
          console.warn('2. The backend route isn\'t deployed yet');
          console.warn('3. There\'s a network/connection issue');
        }
      }

      // Track login action
      try {
        const appVersion = Constants.expoConfig?.version || 'unknown';
        await trpcClient.users.trackAction.mutate({
          user_id: newUser.id,
          action_type: 'login',
          action_category: 'auth',
          action_data: {},
          screen_name: null,
          device_type: Platform.OS === 'web' ? 'web' : Platform.OS === 'ios' ? 'ios' : 'android',
          app_version: appVersion,
        });
      } catch (err) {
        authLogger.error('Failed to track login action', err);
        // Don't throw - tracking failure shouldn't block login
      }
      
      // Update Sentry user context
      setSentryUser({
        id: newUser.id,
        email: newUser.email,
        username: newUser.name,
      });
      addBreadcrumb('User signed in', 'auth', { userId: newUser.id, email: newUser.email });
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
        const newFailureCount = refreshFailureCount + 1;
        setRefreshFailureCount(newFailureCount);
        
        // Logout after multiple consecutive failures
        if (newFailureCount >= MAX_REFRESH_FAILURES) {
          authLogger.warn(`Token refresh failed ${newFailureCount} times. Logging out.`);
          await clearAuth();
          setError('Session expired. Please sign in again.');
          throw new Error('Token refresh failed multiple times');
        }
        
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      
      const newTokens: AuthTokens = {
        accessToken: data.access_token,
        refreshToken: refreshToken,
        expiresAt: Date.now() + data.expires_in * 1000,
      };

      setTokens(newTokens);
      // Reset failure count on successful refresh
      setRefreshFailureCount(0);
      // Clear expiration warning
      setTokenExpirationWarning(null);
      
      // Store tokens securely in SecureStore
      await SecureStore.setItemAsync(STORAGE_KEYS.TOKENS, JSON.stringify(newTokens));
      
      return newTokens.accessToken;
    } catch (err) {
      authLogger.error('Error refreshing token', err);
      
      // Only clear auth if we've exceeded max failures
      if (refreshFailureCount >= MAX_REFRESH_FAILURES - 1) {
        await clearAuth();
      }
      
      throw err;
    }
  };

  const signIn = async () => {
    try {
      setError(null);
      setIsLoading(true);
      
      // First, try to use stored refresh token for seamless login
      let storedTokens: string | null = null;
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined') {
          storedTokens = window.localStorage.getItem(STORAGE_KEYS.TOKENS);
        }
      } else {
        storedTokens = await SecureStore.getItemAsync(STORAGE_KEYS.TOKENS);
      }
      
      if (storedTokens) {
        try {
          const parsedTokens: AuthTokens = JSON.parse(storedTokens);
          if (parsedTokens.refreshToken && validateToken(parsedTokens)) {
            authLogger.debug('Attempting seamless login with refresh token');
            // Try to refresh the token silently
            await refreshAccessToken(parsedTokens.refreshToken);
            // If refresh succeeds, we're logged in - no need for OAuth flow
            const storedUser = await AsyncStorage.getItem(STORAGE_KEYS.USER);
            if (storedUser) {
              const parsedUser: User = JSON.parse(storedUser);
              const userExists = await verifyUserInDatabase(parsedUser.id);
              if (userExists) {
                authLogger.info('Seamless login successful with refresh token');
                setUser(parsedUser);
                setIsLoading(false);
                return; // Success! No need to show OAuth consent screen
              }
            }
          }
        } catch (err) {
          authLogger.debug('Silent refresh failed, proceeding with OAuth flow', err);
          // Refresh failed, continue with normal OAuth flow
        }
      }
      
      // If no stored tokens or refresh failed, proceed with OAuth flow
      authLogger.debug('Starting OAuth flow', {
        redirectUri: REDIRECT_URI,
        clientId: GOOGLE_CLIENT_ID ? `${GOOGLE_CLIENT_ID.substring(0, 10)}...` : 'not set',
      });
      const result = await promptAsync();
      authLogger.debug('OAuth prompt completed', {
        type: result?.type,
        error: result?.type === 'error' ? result.error : undefined,
      });
      // Note: The response will be handled by the useEffect hook above
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
      const demoUser = {
        id: 'demo',
        email: 'demo@example.com',
        name: 'Demo User',
        provider: 'google' as const,
      };
      setUser(demoUser);
      
      // Update Sentry user context for demo mode
      setSentryUser({
        id: demoUser.id,
        email: demoUser.email,
        username: demoUser.name,
      });
      addBreadcrumb('User signed in (demo mode)', 'auth', { userId: demoUser.id });
      
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
    // Start clearing auth immediately (don't wait for token revocation)
    // Token revocation is best-effort and shouldn't block logout
    const clearAuthPromise = clearAuth();
    
    // Try to revoke token in parallel (non-blocking)
    if (tokens?.accessToken) {
      try {
        // Use POST with proper form data for token revocation
        const params = new URLSearchParams();
        params.append('token', tokens.accessToken);
        
        await fetch(discovery.revocationEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params.toString(),
        });
      } catch (err) {
        // Silently fail - token revocation is best-effort
        authLogger.debug('Token revocation failed (non-critical)', err);
      }
    }
    
    // Wait for auth clearing to complete
    await clearAuthPromise;
  };

  const clearAuth = async () => {
    // Store user ID before clearing (for tracking)
    const userIdToTrack = user?.id;
    const isDemo = isDemoMode;
    
    // Clear auth state immediately (don't wait for tracking)
    setSentryUser(null);
    addBreadcrumb('User signed out', 'auth');
    
    setUser(null);
    setTokens(null);
    setIsDemoMode(false);
    
    // Clear tokens from SecureStore (native) or localStorage (web)
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(STORAGE_KEYS.TOKENS);
      }
    } else {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.TOKENS).catch(() => {
        // Ignore errors if item doesn't exist
      });
    }
    // Remove non-sensitive data from AsyncStorage
    await AsyncStorage.multiRemove([STORAGE_KEYS.USER, STORAGE_KEYS.DEMO_MODE]);
    
    // Track logout action in background (non-blocking, fire-and-forget)
    if (userIdToTrack && !isDemo) {
      // Don't await - let it run in background
      Promise.all([
        trpcClient.users.update.mutate({
          id: userIdToTrack,
          last_logout_at: new Date().toISOString(),
        }).catch((err) => {
          // Silently fail - tracking is best-effort
          authLogger.debug('Failed to update last_logout_at (non-critical)', err);
        }),
        trpcClient.users.trackAction.mutate({
          user_id: userIdToTrack,
          action_type: 'logout',
          action_category: 'auth',
          action_data: {},
          screen_name: null,
          device_type: Platform.OS === 'web' ? 'web' : Platform.OS === 'ios' ? 'ios' : 'android',
          app_version: Constants.expoConfig?.version || 'unknown',
        }).catch((err) => {
          // Silently fail - tracking is best-effort
          authLogger.debug('Failed to track logout action (non-critical)', err);
        }),
      ]).catch(() => {
        // Ignore all tracking errors
      });
    }
  };


  // Validate token structure
  const validateToken = (tokens: AuthTokens | null): tokens is AuthTokens => {
    if (!tokens) return false;
    if (!tokens.accessToken || typeof tokens.accessToken !== 'string') return false;
    if (!tokens.expiresAt || typeof tokens.expiresAt !== 'number') return false;
    if (tokens.refreshToken && typeof tokens.refreshToken !== 'string') return false;
    if (tokens.idToken && typeof tokens.idToken !== 'string') return false;
    return true;
  };

  const getValidAccessToken = async (): Promise<string | null> => {
    if (!tokens) return null;

    // Validate token structure
    if (!validateToken(tokens)) {
      authLogger.warn('Invalid token structure. Clearing auth.');
      await clearAuth();
      return null;
    }

    const now = Date.now();
    const timeUntilExpiration = tokens.expiresAt - now;

    // If token expires in more than 1 minute, return it
    if (timeUntilExpiration > 60000) {
      return tokens.accessToken;
    }

    // Token is expiring soon or expired, try to refresh
    if (tokens.refreshToken) {
      try {
        return await refreshAccessToken(tokens.refreshToken);
      } catch (err) {
        authLogger.error('Failed to refresh token', err);
        return null;
      }
    }

    // No refresh token available
    authLogger.warn('Token expired and no refresh token available. Clearing auth.');
    await clearAuth();
    return null;
  };

  return {
    user,
    tokens,
    isLoading,
    error,
    isAuthenticated: !!user && (!!tokens || isDemoMode),
    isDemoMode,
    tokenExpirationWarning,
    signIn,
    signInDemo,
    signOut,
    getValidAccessToken,
  };
});
