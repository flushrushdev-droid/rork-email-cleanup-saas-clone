import React, { useEffect } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { AppConfig } from '@/config/env';
import { createScopedLogger } from '@/utils/logger';

WebBrowser.maybeCompleteAuthSession();

const testLogger = createScopedLogger('TestGoogle');

const discovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
};

const GOOGLE_WEB_CLIENT_ID = AppConfig.google.clientId;

export default function TestGoogleScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  
  const redirectUri = AuthSession.makeRedirectUri({ useProxy: true });
  
  testLogger.debug('Test redirect URI', { redirectUri });

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: GOOGLE_WEB_CLIENT_ID || '',
      scopes: ['openid', 'profile', 'email'],
      redirectUri,
      responseType: AuthSession.ResponseType.Code,
      usePKCE: true,
    },
    discovery
  );

  useEffect(() => {
    if (!response) return;
    
    testLogger.info('Test response received', {
      type: response.type,
      error: response.type === 'error' ? response.error : undefined,
      params: response.type === 'success' ? Object.keys(response.params || {}) : undefined,
    });
    
    console.log('TEST response:', JSON.stringify(response, null, 2));
    
    if (response.type === 'success') {
      testLogger.info('✅ Test OAuth flow succeeded!');
    } else if (response.type === 'error') {
      testLogger.error('❌ Test OAuth flow failed', response.error);
    }
  }, [response]);

  const handleLogin = async () => {
    try {
      testLogger.debug('Starting test OAuth flow', {
        redirectUri,
        clientId: GOOGLE_WEB_CLIENT_ID ? `${GOOGLE_WEB_CLIENT_ID.substring(0, 10)}...` : 'not set',
      });
      await promptAsync({ useProxy: true });
    } catch (error) {
      testLogger.error('Error in test OAuth flow', error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>
          Test Google Login (Proxy)
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          This is a minimal test to verify Expo proxy OAuth works
        </Text>
        
        <View style={styles.infoBox}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
            Redirect URI:
          </Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>
            {redirectUri}
          </Text>
        </View>
        
        <View style={styles.infoBox}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
            Client ID:
          </Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>
            {GOOGLE_WEB_CLIENT_ID ? `${GOOGLE_WEB_CLIENT_ID.substring(0, 20)}...` : 'Not set'}
          </Text>
        </View>

        <Button
          title="Login with Google (Test)"
          disabled={!request}
          onPress={handleLogin}
        />
        
        {response && (
          <View style={[styles.responseBox, { backgroundColor: colors.surface }]}>
            <Text style={[styles.responseTitle, { color: colors.text }]}>
              Response:
            </Text>
            <Text style={[styles.responseText, { color: colors.textSecondary }]}>
              {JSON.stringify(response, null, 2)}
            </Text>
          </View>
        )}
        
        <Button
          title="Back to Login"
          onPress={() => router.back()}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
  },
  infoBox: {
    width: '100%',
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  responseBox: {
    width: '100%',
    marginTop: 24,
    padding: 12,
    borderRadius: 8,
    maxHeight: 300,
  },
  responseTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  responseText: {
    fontSize: 10,
    fontFamily: 'monospace',
  },
});

