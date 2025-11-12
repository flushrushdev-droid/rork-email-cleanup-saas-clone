import { useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import Colors from '@/constants/colors';

const THEME_STORAGE_KEY = 'app_theme';

export type ThemeMode = 'light' | 'dark';

export const [ThemeProvider, useTheme] = createContextHook(() => {
  const [theme, setTheme] = useState<ThemeMode>('light');
  const [isLoading, setIsLoading] = useState(true);

  const loadTheme = useCallback(async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme === 'light' || savedTheme === 'dark') {
        setTheme(savedTheme);
      }
    } catch (error) {
      console.error('Failed to load theme:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTheme();
  }, [loadTheme]);

  const toggleTheme = useCallback(async () => {
    const newTheme: ThemeMode = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  }, [theme]);

  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    setTheme(mode);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  }, []);

  const colors = useMemo(() => theme === 'light' ? Colors.light : Colors.dark, [theme]);

  return useMemo(() => ({
    theme,
    colors,
    toggleTheme,
    setThemeMode,
    isLoading,
  }), [theme, colors, toggleTheme, setThemeMode, isLoading]);
});
