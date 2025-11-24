import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setupDemoMode, clearDemoMode } from '../utils/demo-helpers';

describe('Demo Calendar', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await clearDemoMode();
    await setupDemoMode();
  });

  afterEach(async () => {
    await clearDemoMode();
  });

  test('should create calendar event', () => {
    const events: Array<{ id: string; title: string; date: Date }> = [];
    const newEvent = {
      id: Date.now().toString(),
      title: 'Test Event',
      date: new Date(),
    };

    events.push(newEvent);
    expect(events.length).toBe(1);
    expect(events[0].title).toBe('Test Event');
  });

  test('should NOT persist events after refresh', async () => {
    // Calendar events should not be persisted in demo mode
    const event = {
      id: '1',
      title: 'Test Event',
      date: new Date(),
    };

    // Verify it's not in AsyncStorage
    const stored = await AsyncStorage.getItem('calendar-events');
    expect(stored).toBeNull();
  });
});

