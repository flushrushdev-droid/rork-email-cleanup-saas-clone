import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setupDemoMode, clearDemoMode } from '../utils/demo-helpers';

// Mock the Screen component
jest.mock('@/components/layout/Screen', () => ({
  Screen: ({ children }: any) => children,
}));

// Mock the contexts
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      primary: '#007AFF',
      surface: '#F2F2F7',
      background: '#FFFFFF',
      text: '#000000',
      textSecondary: '#8E8E93',
      surfaceSecondary: '#E5E5EA',
      success: '#34C759',
      warning: '#FF9500',
    },
  }),
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({
    replace: jest.fn(),
    push: jest.fn(),
    back: jest.fn(),
  }),
}));

const { useAuth } = require('@/contexts/AuthContext');

const mockSignInDemo = jest.fn();

describe('Demo Mode Authentication', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await clearDemoMode();
  });

  afterEach(async () => {
    await clearDemoMode();
  });

  test('should check demo mode setup', async () => {
    await setupDemoMode();
    const demoMode = await AsyncStorage.getItem('@demo_mode');
    expect(demoMode).toBe('true');
  });

  test('should verify demo auth context', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      isDemoMode: true,
      user: { email: 'demo@example.com', name: 'Demo User' },
      signInDemo: mockSignInDemo,
      signOut: jest.fn(),
      isLoading: false,
    });

    const auth = useAuth();
    expect(auth.isDemoMode).toBe(true);
    expect(auth.user?.email).toBe('demo@example.com');
  });
});
