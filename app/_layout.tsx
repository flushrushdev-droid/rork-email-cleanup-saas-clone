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
import { trpc, trpcClient } from '@/lib/trpc';

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

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <GmailSyncProvider>
              <HistoryProvider>
                <GestureHandlerWrapper>
                  <StatusBar style="auto" />
                  <CalendarProvider>
                    <RootLayoutNav />
                  </CalendarProvider>
                </GestureHandlerWrapper>
              </HistoryProvider>
            </GmailSyncProvider>
          </AuthProvider>
        </ThemeProvider>
      </trpc.Provider>
    </QueryClientProvider>
  );
}
