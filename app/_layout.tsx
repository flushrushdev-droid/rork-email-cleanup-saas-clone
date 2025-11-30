import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '@/contexts/AuthContext';
import { GmailSyncProvider } from '@/contexts/GmailSyncContext';
import { HistoryProvider } from '@/contexts/HistoryContext';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { CalendarProvider } from '@/contexts/CalendarContext';
import { EmailStateProvider } from '@/contexts/EmailStateContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { NetworkProvider } from '@/contexts/NetworkContext';
import { ToastContainer } from '@/components/common/ToastContainer';
import { OfflineIndicator } from '@/components/common/OfflineIndicator';
import { trpc, trpcClient } from '@/lib/trpc';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { createScopedLogger } from '@/utils/logger';
import { logConfig } from '@/config/env';
import { queryClientConfig, queryPersister } from '@/lib/queryCache';
import { useIOSShortcuts } from '@/hooks/useIOSShortcuts';
import { useAndroidIntents } from '@/hooks/useAndroidIntents';
import { applyCSP } from '@/utils/csp';
import { validateProductionBuild } from '@/utils/debugDetection';
import { initSentry } from '@/lib/sentry';

const appLogger = createScopedLogger('App');

// Initialize Sentry for error tracking (must be called before any other imports that might throw)
initSentry();

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Log configuration on app startup (development only)
logConfig();

// Validate production build (warns if debug features are enabled in production)
validateProductionBuild();

// Create QueryClient with optimized cache configuration
// Messages will persist to disk and never be garbage collected
const queryClient = new QueryClient({
  ...queryClientConfig,
  defaultOptions: {
    ...queryClientConfig.defaultOptions,
    queries: {
      ...queryClientConfig.defaultOptions?.queries,
      // Override gcTime for messages to Infinity (handled in getCacheTTL)
    },
  },
});

function RootLayoutNav() {
  const { colors } = useTheme();
  
  return (
    <Stack 
      screenOptions={{ 
        headerBackTitle: "Back",
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.primary,
        headerTitleStyle: {
          color: colors.text,
        },
        // Prevent white flash during transitions
        // Smooth theme transitions are handled by React re-renders
        contentStyle: {
          backgroundColor: colors.background,
        },
        // Root-level swipe-to-go-back gesture is enabled by default (gestureEnabled defaults to true)
      }}
    >
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="syncing" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="storybook" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
    </Stack>
  );
}

function GestureHandlerWrapper({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      {children}
    </GestureHandlerRootView>
  );
}

function AppContent() {
  const { isLoading: isThemeLoading } = useTheme();
  
  // Initialize platform-specific intent/shortcut handlers
  useIOSShortcuts();
  useAndroidIntents();

  useEffect(() => {
    // Wait for theme to load before hiding splash screen to prevent flash
    if (!isThemeLoading) {
      SplashScreen.hideAsync();
    }
  }, [isThemeLoading]);

  // Don't render app content until theme is loaded (prevents flash)
  if (isThemeLoading) {
    return null;
  }

  return (
    <NetworkProvider>
      <AuthProvider>
        <GmailSyncProvider>
          <HistoryProvider>
            <ToastProvider>
              <GestureHandlerWrapper>
                <ErrorBoundary
                  onError={(error, errorInfo) => {
                    appLogger.error('App error caught by ErrorBoundary', error, { errorInfo });
                  }}
                >
                  <StatusBar style="auto" />
                  <OfflineIndicator />
                  <CalendarProvider>
                    <EmailStateProvider>
                      <RootLayoutNav />
                      <ToastContainer position="top" />
                    </EmailStateProvider>
                  </CalendarProvider>
                </ErrorBoundary>
              </GestureHandlerWrapper>
            </ToastProvider>
          </HistoryProvider>
        </GmailSyncProvider>
      </AuthProvider>
    </NetworkProvider>
  );
}

export default function RootLayout() {
  // Apply Content Security Policy for web platform
  useEffect(() => {
    applyCSP();
  }, []);

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: queryPersister,
        // Only persist Gmail messages and senders (most important data)
        dehydrateOptions: {
          shouldDehydrateQuery: (query) => {
            const key = query.queryKey[0];
            const subKey = query.queryKey[1];
            // Persist Gmail messages and senders
            if (key === 'gmail' && (subKey === 'messages' || subKey === 'senders')) {
              return true;
            }
            // Don't persist other queries (they can be refetched)
            return false;
          },
        },
      }}
    >
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </trpc.Provider>
    </PersistQueryClientProvider>
  );
}
