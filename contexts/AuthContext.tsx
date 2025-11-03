import createContextHook from '@nkzw/create-context-hook';
import { useEffect, useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import * as Crypto from 'expo-crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import type { AuthTokens, User } from '@/constants/types';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CLIENT_ID = '663983319983-0bi4j8a26tqf0ef9emcphp2srdbprli9.apps.googleusercontent.com';

function getRedirectUri() {
  if (Platform.OS === 'web') {
    const url = typeof window !== 'undefined' ? window.location.origin : 'https://rork.com';
    return `${url}/auth/callback`;
  }
  return AuthSession.makeRedirectUri({
    scheme: 'rork-app',
  });
}

const REDIRECT_URI = getRedirectUri();

console.log('OAuth Redirect URI:', REDIRECT_URI);
console.log('OAuth Client ID:', GOOGLE_CLIENT_ID);
console.log('Platform:', Platform.OS);

const STORAGE_KEYS = {
  TOKENS: '@auth_tokens',
  USER: '@auth_user',
};

const discovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};



export const [AuthProvider, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: GOOGLE_CLIENT_ID,
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
  }, []);

  useEffect(() => {
    if (!isDemoMode && response?.type === 'success') {
      const { code } = response.params;
      exchangeCodeForTokens(code, request?.codeVerifier);
    } else if (!isDemoMode && response?.type === 'error') {
      setError(response.error?.message || 'Authentication failed');
      setIsLoading(false);
    }
  }, [response, isDemoMode]);

  const loadStoredAuth = async () => {
    try {
      const [storedTokens, storedUser, storedDemoMode] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.TOKENS),
        AsyncStorage.getItem(STORAGE_KEYS.USER),
        AsyncStorage.getItem('@demo_mode'),
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
      console.error('Error loading stored auth:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const exchangeCodeForTokens = async (code: string, codeVerifier?: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      });

      if (codeVerifier) {
        params.append('code_verifier', codeVerifier);
      }

      const response = await fetch(discovery.tokenEndpoint, {
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
      await AsyncStorage.setItem(STORAGE_KEYS.TOKENS, JSON.stringify(newTokens));
    } catch (err) {
      console.error('Error exchanging code for tokens:', err);
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
      console.error('Error fetching user info:', err);
      throw err;
    }
  };

  const refreshAccessToken = async (refreshToken: string) => {
    try {
      const params = new URLSearchParams({
        refresh_token: refreshToken,
        client_id: GOOGLE_CLIENT_ID,
        grant_type: 'refresh_token',
      });

      const response = await fetch(discovery.tokenEndpoint, {
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
      await AsyncStorage.setItem(STORAGE_KEYS.TOKENS, JSON.stringify(newTokens));
      
      return newTokens.accessToken;
    } catch (err) {
      console.error('Error refreshing token:', err);
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
      console.error('Error signing in:', err);
      setError(err instanceof Error ? err.message : 'Sign in failed');
      setIsLoading(false);
    }
  };

  const signInDemo = async (): Promise<boolean> => {
    try {
      console.log('[Demo] Starting demo sign in...');
      setIsLoading(true);
      setError(null);
      
      console.log('[Demo] Setting AsyncStorage...');
      await AsyncStorage.setItem('@demo_mode', 'true');
      
      console.log('[Demo] Setting demo mode and user...');
      setIsDemoMode(true);
      setUser({
        id: 'demo',
        email: 'demo@example.com',
        name: 'Demo User',
        provider: 'google',
      });
      
      console.log('[Demo] Demo sign in complete');
      setIsLoading(false);
      return true;
    } catch (err) {
      console.error('[Demo] Error signing in to demo:', err);
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
      console.error('Error revoking token:', err);
    } finally {
      await clearAuth();
    }
  };

  const clearAuth = async () => {
    setUser(null);
    setTokens(null);
    setIsDemoMode(false);
    await AsyncStorage.multiRemove([STORAGE_KEYS.TOKENS, STORAGE_KEYS.USER, '@demo_mode']);
  };

  const getValidAccessToken = async (): Promise<string | null> => {
    if (!tokens) return null;

    if (tokens.expiresAt > Date.now() + 60000) {
      return tokens.accessToken;
    }

    if (tokens.refreshToken) {
      try {
        return await refreshAccessToken(tokens.refreshToken);
      } catch (err) {
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
