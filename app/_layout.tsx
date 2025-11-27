import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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

const appLogger = createScopedLogger('App');

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

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
        contentStyle: {
          backgroundColor: colors.background,
        },
        // Rork's root-level swipe-to-go-back gesture is enabled by default (gestureEnabled defaults to true)
      }}
    >
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
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
  return (
    <QueryClientProvider client={queryClient}>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </trpc.Provider>
    </QueryClientProvider>
  );
}
