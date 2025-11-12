import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '@/contexts/AuthContext';
import { GmailSyncProvider } from '@/contexts/GmailSyncContext';
import { HistoryProvider } from '@/contexts/HistoryContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { trpc, trpcClient } from '@/lib/trpc';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
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
                <GestureHandlerRootView>
                  <StatusBar style="auto" />
                  <RootLayoutNav />
                </GestureHandlerRootView>
              </HistoryProvider>
            </GmailSyncProvider>
          </AuthProvider>
        </ThemeProvider>
      </trpc.Provider>
    </QueryClientProvider>
  );
}
