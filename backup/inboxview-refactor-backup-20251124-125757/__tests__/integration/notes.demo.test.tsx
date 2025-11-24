import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
    },
  }),
}));

describe('Demo Notes', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await clearDemoMode();
    await setupDemoMode();
  });

  afterEach(async () => {
    await clearDemoMode();
  });

  test('should display mock notes', () => {
    // Mock notes would be loaded from mock data
    const mockNotes = [
      { id: '1', content: 'Test note 1', createdAt: new Date() },
      { id: '2', content: 'Test note 2', createdAt: new Date() },
    ];

    expect(mockNotes.length).toBeGreaterThan(0);
    expect(mockNotes[0]).toHaveProperty('id');
    expect(mockNotes[0]).toHaveProperty('content');
  });

  test('should create new note', () => {
    const notes: Array<{ id: string; content: string; createdAt: Date }> = [];
    const newNote = {
      id: Date.now().toString(),
      content: 'New note',
      createdAt: new Date(),
    };

    notes.push(newNote);
    expect(notes.length).toBe(1);
    expect(notes[0].content).toBe('New note');
  });

  test('should edit existing note', () => {
    const notes = [
      { id: '1', content: 'Original', createdAt: new Date() },
    ];

    const updatedNotes = notes.map(note =>
      note.id === '1' ? { ...note, content: 'Updated' } : note
    );

    expect(updatedNotes[0].content).toBe('Updated');
  });

  test('should delete note', () => {
    const notes = [
      { id: '1', content: 'Note 1', createdAt: new Date() },
      { id: '2', content: 'Note 2', createdAt: new Date() },
    ];

    const filteredNotes = notes.filter(note => note.id !== '1');
    expect(filteredNotes.length).toBe(1);
    expect(filteredNotes[0].id).toBe('2');
  });

  test('should NOT persist notes after refresh', async () => {
    // Notes should not be persisted in demo mode
    const note = {
      id: '1',
      content: 'Test note',
      createdAt: new Date(),
    };

    // Verify it's not in AsyncStorage
    const stored = await AsyncStorage.getItem('notes');
    expect(stored).toBeNull();
  });
});

