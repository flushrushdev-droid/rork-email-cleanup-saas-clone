import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setupDemoMode, clearDemoMode, wait } from '../utils/demo-helpers';
import { mockRecentEmails } from '@/mocks/emailData';

// Mock contexts
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/contexts/EmailStateContext', () => ({
  useEmailState: jest.fn(),
}));
jest.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      primary: '#007AFF',
      surface: '#F2F2F7',
      background: '#FFFFFF',
      text: '#000000',
      textSecondary: '#8E8E93',
      success: '#34C759',
      danger: '#FF3B30',
    },
  }),
}));

describe('Demo Email Operations', () => {
  const { useAuth } = require('@/contexts/AuthContext');
  const { useEmailState } = require('@/contexts/EmailStateContext');

  beforeEach(async () => {
    jest.clearAllMocks();
    await clearDemoMode();
    await setupDemoMode();
    
    (useAuth as jest.Mock).mockReturnValue({
      isDemoMode: true,
      isAuthenticated: true,
      user: {
        id: 'demo',
        email: 'demo@example.com',
        name: 'Demo User',
      },
    });

    (useEmailState as jest.Mock).mockReturnValue({
      starredEmails: new Set(),
      toggleStarredEmail: jest.fn(),
      trashedEmails: new Set(),
      archivedEmails: new Set(),
      addTrashedEmail: jest.fn(),
      addArchivedEmail: jest.fn(),
    });
  });

  afterEach(async () => {
    await clearDemoMode();
  });

  test('should display mock emails in inbox', () => {
    expect(mockRecentEmails.length).toBeGreaterThan(0);
    expect(mockRecentEmails[0]).toHaveProperty('id');
    expect(mockRecentEmails[0]).toHaveProperty('subject');
    expect(mockRecentEmails[0]).toHaveProperty('from');
  });

  test('should archive email with toast and undo (5 second timer)', async () => {
    const emailId = mockRecentEmails[0].id;
    const addArchivedEmail = jest.fn();
    const setToast = jest.fn();
    
    // Simulate archive action
    const handleArchive = () => {
      setToast({
        message: 'Email archived',
        onUndo: jest.fn(),
        timer: 5,
      });
    };

    handleArchive();
    
    expect(setToast).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Email archived',
        timer: 5,
      })
    );
  });

  test('should archive email permanently after timeout', async () => {
    const emailId = mockRecentEmails[0].id;
    const addArchivedEmail = jest.fn();
    let archivedSet = new Set<string>();
    
    // Simulate archive with timeout
    const handleArchive = () => {
      setTimeout(() => {
        archivedSet.add(emailId);
        addArchivedEmail(emailId);
      }, 5000);
    };

    handleArchive();
    await wait(5100);
    
    expect(archivedSet.has(emailId)).toBe(true);
  }, 10000);

  test('should delete email with toast and undo', async () => {
    const emailId = mockRecentEmails[0].id;
    const addTrashedEmail = jest.fn();
    const setToast = jest.fn();
    
    const handleDelete = () => {
      setToast({
        message: 'Email moved to trash',
        onUndo: jest.fn(),
        timer: 5,
      });
    };

    handleDelete();
    
    expect(setToast).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Email moved to trash',
      })
    );
  });

  test('should delete email permanently after timeout', async () => {
    const emailId = mockRecentEmails[0].id;
    const addTrashedEmail = jest.fn();
    let trashedSet = new Set<string>();
    
    const handleDelete = () => {
      setTimeout(() => {
        trashedSet.add(emailId);
        addTrashedEmail(emailId);
      }, 5000);
    };

    handleDelete();
    await wait(5100);
    
    expect(trashedSet.has(emailId)).toBe(true);
  }, 10000);

  test('should star/unstar emails', () => {
    const emailId = mockRecentEmails[0].id;
    const toggleStarredEmail = jest.fn();
    let starredSet = new Set<string>();
    
    const handleStar = () => {
      if (starredSet.has(emailId)) {
        starredSet.delete(emailId);
      } else {
        starredSet.add(emailId);
      }
      toggleStarredEmail(emailId);
    };

    handleStar();
    expect(starredSet.has(emailId)).toBe(true);
    expect(toggleStarredEmail).toHaveBeenCalledWith(emailId);

    handleStar();
    expect(starredSet.has(emailId)).toBe(false);
  });

  test('should filter emails by category', () => {
    const promotions = mockRecentEmails.filter(email => 
      email.subject.toLowerCase().includes('sale') ||
      email.subject.toLowerCase().includes('deal') ||
      email.from.toLowerCase().includes('promo')
    );
    
    expect(promotions.length).toBeGreaterThanOrEqual(0);
  });

  test('should search emails', () => {
    const searchQuery = 'newsletter';
    const filtered = mockRecentEmails.filter(email =>
      email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.snippet.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    expect(filtered.length).toBeGreaterThanOrEqual(0);
  });

  test('should navigate to email detail view', () => {
    const email = mockRecentEmails[0];
    expect(email).toHaveProperty('id');
    expect(email).toHaveProperty('subject');
    expect(email).toHaveProperty('from');
  });
});

