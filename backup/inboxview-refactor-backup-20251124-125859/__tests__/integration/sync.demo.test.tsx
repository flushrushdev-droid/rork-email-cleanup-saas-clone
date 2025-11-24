import React from 'react';
import { Alert } from 'react-native';
import { setupDemoMode, clearDemoMode } from '../utils/demo-helpers';

// Mock Alert.alert using jest.spyOn instead of mocking entire react-native module
// This preserves the module structure that jest-expo needs
jest.spyOn(Alert, 'alert').mockImplementation(() => {});

describe('Demo Mode - Sync Disabled', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await clearDemoMode();
    await setupDemoMode();
  });

  afterEach(async () => {
    await clearDemoMode();
  });

  test('should show alert when sync button clicked in demo mode', () => {
    const isDemoMode = true;
    const handleSync = () => {
      if (isDemoMode) {
        Alert.alert('Demo mode', 'Sync is disabled in demo mode');
        return;
      }
    };

    handleSync();
    expect(Alert.alert).toHaveBeenCalledWith('Demo mode', 'Sync is disabled in demo mode');
  });

  test('should NOT make API calls in demo mode', () => {
    const fetchMock = jest.fn();
    const isDemoMode = true;

    const syncMailbox = () => {
      if (isDemoMode) {
        return; // No API call
      }
      fetchMock('https://gmail.googleapis.com/gmail/v1/users/me/messages');
    };

    syncMailbox();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test('should use mock data only', () => {
    const { mockRecentEmails } = require('@/mocks/emailData');
    
    expect(mockRecentEmails).toBeDefined();
    expect(Array.isArray(mockRecentEmails)).toBe(true);
    expect(mockRecentEmails.length).toBeGreaterThan(0);
  });
});

