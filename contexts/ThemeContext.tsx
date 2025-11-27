import { useCallback, useEffect, useMemo, useState } from 'react';
import { useColorScheme, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import Colors from '@/constants/colors';
import { createScopedLogger } from '@/utils/logger';

const THEME_STORAGE_KEY = 'app_theme';
const THEME_OVERRIDE_KEY = 'app_theme_override';
const themeLogger = createScopedLogger('Theme');

export type ThemeMode = 'light' | 'dark';

// Helper to get initial theme synchronously on web using localStorage
const getInitialTheme = (systemColorScheme: 'light' | 'dark' | null | undefined): { theme: ThemeMode; hasOverride: boolean } => {
  // On web, try to read from localStorage synchronously to prevent flash
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
    try {
      const override = window.localStorage.getItem(THEME_OVERRIDE_KEY);
      if (override === 'true') {
        const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme === 'light' || savedTheme === 'dark') {
          return { theme: savedTheme as ThemeMode, hasOverride: true };
        }
      }
    } catch (error) {
      themeLogger.warn('Failed to read theme from localStorage', undefined, { error });
    }
  }
  // Fallback to system theme
  return { theme: systemColorScheme || 'light', hasOverride: false };
};

export const [ThemeProvider, useTheme] = createContextHook(() => {
  const systemColorScheme = useColorScheme();
  // Get initial theme synchronously on web, or use system theme
  const initialThemeState = useMemo(() => getInitialTheme(systemColorScheme || null), [systemColorScheme]);
  const [theme, setTheme] = useState<ThemeMode>(initialThemeState.theme);
  const [isLoading, setIsLoading] = useState(true);
  const [hasUserOverride, setHasUserOverride] = useState(initialThemeState.hasOverride);

  const loadTheme = useCallback(async () => {
    try {
      // On web, we already read from localStorage synchronously, but we still need to sync with AsyncStorage
      // On native, read from AsyncStorage
      const userOverride = await AsyncStorage.getItem(THEME_OVERRIDE_KEY);
      
      if (userOverride === 'true') {
        // User has manually chosen a theme - use their choice
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme === 'light' || savedTheme === 'dark') {
          // Only update if it's different from what we already have (prevents unnecessary re-render)
          if (theme !== savedTheme) {
            setTheme(savedTheme);
          }
          setHasUserOverride(true);
        }
      } else {
        // No manual choice - use system theme
        const systemTheme = systemColorScheme || 'light';
        // Only update if it's different and we don't already have it set
        if (theme !== systemTheme) {
          setTheme(systemTheme);
        }
        setHasUserOverride(false);
      }
    } catch (error) {
      themeLogger.error('Failed to load theme', error);
    } finally {
      setIsLoading(false);
    }
  }, [systemColorScheme, theme]);

  // Listen to system theme changes (only if user hasn't overridden)
  useEffect(() => {
    if (!hasUserOverride && systemColorScheme) {
      setTheme(systemColorScheme);
    }
  }, [systemColorScheme, hasUserOverride]);

  useEffect(() => {
    loadTheme();
  }, [loadTheme]);

  const toggleTheme = useCallback(async () => {
    const newTheme: ThemeMode = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    setHasUserOverride(true);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
      await AsyncStorage.setItem(THEME_OVERRIDE_KEY, 'true');
      // Also update localStorage on web for next time
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(THEME_STORAGE_KEY, newTheme);
        window.localStorage.setItem(THEME_OVERRIDE_KEY, 'true');
      }
    } catch (error) {
      themeLogger.error('Failed to save theme', error);
    }
  }, [theme]);

  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    setTheme(mode);
    setHasUserOverride(true);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      await AsyncStorage.setItem(THEME_OVERRIDE_KEY, 'true');
      // Also update localStorage on web for next time
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(THEME_STORAGE_KEY, mode);
        window.localStorage.setItem(THEME_OVERRIDE_KEY, 'true');
      }
    } catch (error) {
      themeLogger.error('Failed to save theme', error);
    }
  }, []);

  const useSystemTheme = useCallback(async () => {
    setHasUserOverride(false);
    const systemTheme = systemColorScheme || 'light';
    setTheme(systemTheme);
    try {
      await AsyncStorage.removeItem(THEME_OVERRIDE_KEY);
      await AsyncStorage.removeItem(THEME_STORAGE_KEY);
      // Also clear localStorage on web
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(THEME_OVERRIDE_KEY);
        window.localStorage.removeItem(THEME_STORAGE_KEY);
      }
    } catch (error) {
      themeLogger.error('Failed to reset theme', error);
    }
  }, [systemColorScheme]);

  const colors = useMemo(() => {
    // Smooth transition: return colors based on current theme
    // Note: For React Native, we rely on the component re-render for color changes
    // For web, CSS transitions can be added via style props
    return theme === 'light' ? Colors.light : Colors.dark;
  }, [theme]);

  return useMemo(() => ({
    theme,
    colors,
    toggleTheme,
    setThemeMode,
    useSystemTheme,
    hasUserOverride,
    systemTheme: systemColorScheme || 'light',
    isLoading,
  }), [theme, colors, toggleTheme, setThemeMode, useSystemTheme, hasUserOverride, systemColorScheme, isLoading]);
});
