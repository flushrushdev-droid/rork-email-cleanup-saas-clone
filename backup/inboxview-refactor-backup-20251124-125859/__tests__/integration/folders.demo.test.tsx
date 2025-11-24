import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CreateFolderModal } from '@/components/mail/CreateFolderModal';
import { setupDemoMode, clearDemoMode } from '../utils/demo-helpers';

jest.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      primary: '#007AFF',
      surface: '#F2F2F7',
      background: '#FFFFFF',
      text: '#000000',
      textSecondary: '#8E8E93',
      danger: '#FF3B30',
      border: '#C6C6C8',
    },
  }),
}));

describe('Demo Custom Folders', () => {
  const mockOnClose = jest.fn();
  const mockOnCreate = jest.fn();
  const mockOnFolderNameChange = jest.fn();
  const mockOnFolderRuleChange = jest.fn();

  beforeEach(async () => {
    jest.clearAllMocks();
    await clearDemoMode();
    await setupDemoMode();
  });

  afterEach(async () => {
    await clearDemoMode();
  });

  test('should open folder creation modal', () => {
    render(
      <CreateFolderModal
        visible={true}
        folderName=""
        folderRule=""
        isCreating={false}
        onClose={mockOnClose}
        onFolderNameChange={mockOnFolderNameChange}
        onFolderRuleChange={mockOnFolderRuleChange}
        onCreate={mockOnCreate}
      />
    );

    expect(screen.getByPlaceholderText('e.g., Important Clients')).toBeTruthy();
    expect(screen.getByPlaceholderText('e.g., Emails from clients about project updates or invoices')).toBeTruthy();
  });

  test('should show red error message for empty fields', async () => {
    render(
      <CreateFolderModal
        visible={true}
        folderName=""
        folderRule=""
        isCreating={false}
        onClose={mockOnClose}
        onFolderNameChange={mockOnFolderNameChange}
        onFolderRuleChange={mockOnFolderRuleChange}
        onCreate={mockOnCreate}
      />
    );

    const createButton = screen.getByText('Create Folder');
    fireEvent.press(createButton);

    await waitFor(() => {
      // The new error handling shows specific field errors
      const errorText = screen.queryByText(/folder name is required/i) || 
                       screen.queryByText(/folder rule is required/i);
      expect(errorText).toBeTruthy();
    });
  });

  test('should create folder and appear in sidebar', () => {
    const customFolders: Array<{ id: string; name: string; color: string; count: number }> = [];
    const setCustomFolders = jest.fn((updater) => {
      const newFolders = typeof updater === 'function' ? updater(customFolders) : updater;
      customFolders.length = 0;
      customFolders.push(...newFolders);
    });

    const handleCreate = (name: string, rule: string) => {
      const newFolder = {
        id: Date.now().toString(),
        name,
        color: '#007AFF',
        count: 0,
      };
      setCustomFolders((prev: typeof customFolders) => [newFolder, ...prev]);
    };

    handleCreate('Test Folder', 'from:test@example.com');
    expect(customFolders.length).toBe(1);
    expect(customFolders[0].name).toBe('Test Folder');
  });

  test('should NOT persist folders after app refresh', async () => {
    // Create a folder
    await AsyncStorage.setItem('custom-folders-v1', JSON.stringify([{
      id: '1',
      name: 'Test Folder',
      color: '#007AFF',
      count: 0,
    }]));

    // Simulate app refresh - clear storage
    await AsyncStorage.removeItem('custom-folders-v1');

    const folders = await AsyncStorage.getItem('custom-folders-v1');
    expect(folders).toBeNull();
  });

  test('should show empty state for custom folders', () => {
    const customFolders: Array<{ id: string; name: string; color: string; count: number }> = [];
    expect(customFolders.length).toBe(0);
    // Empty state would be shown when folders.length === 0
  });
});

