import { useCallback, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import Colors from '@/constants/colors';

const THEME_STORAGE_KEY = 'app_theme';
const THEME_OVERRIDE_KEY = 'app_theme_override';

export type ThemeMode = 'light' | 'dark';

export const [ThemeProvider, useTheme] = createContextHook(() => {
  const systemColorScheme = useColorScheme();
  const [theme, setTheme] = useState<ThemeMode>('light');
  const [isLoading, setIsLoading] = useState(true);
  const [hasUserOverride, setHasUserOverride] = useState(false);

  const loadTheme = useCallback(async () => {
    try {
      // Check if user has manually set a preference
      const userOverride = await AsyncStorage.getItem(THEME_OVERRIDE_KEY);
      
      if (userOverride === 'true') {
        // User has manually chosen a theme - use their choice
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme === 'light' || savedTheme === 'dark') {
          setTheme(savedTheme);
          setHasUserOverride(true);
        }
      } else {
        // No manual choice - use system theme
        const systemTheme = systemColorScheme || 'light';
        setTheme(systemTheme);
        setHasUserOverride(false);
      }
    } catch (error) {
      console.error('Failed to load theme:', error);
    } finally {
      setIsLoading(false);
    }
  }, [systemColorScheme]);

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
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  }, [theme]);

  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    setTheme(mode);
    setHasUserOverride(true);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      await AsyncStorage.setItem(THEME_OVERRIDE_KEY, 'true');
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  }, []);

  const useSystemTheme = useCallback(async () => {
    setHasUserOverride(false);
    const systemTheme = systemColorScheme || 'light';
    setTheme(systemTheme);
    try {
      await AsyncStorage.removeItem(THEME_OVERRIDE_KEY);
      await AsyncStorage.removeItem(THEME_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to reset theme:', error);
    }
  }, [systemColorScheme]);

  const colors = useMemo(() => theme === 'light' ? Colors.light : Colors.dark, [theme]);

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
