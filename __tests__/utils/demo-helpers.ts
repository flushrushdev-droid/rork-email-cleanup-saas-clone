import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Sets up demo mode for testing
 */
export async function setupDemoMode(): Promise<void> {
  await AsyncStorage.setItem('@demo_mode', 'true');
  await AsyncStorage.setItem('@auth_user', JSON.stringify({
    id: 'demo',
    email: 'demo@example.com',
    name: 'Demo User',
    provider: 'google',
  }));
}

/**
 * Clears demo mode and all test data
 */
export async function clearDemoMode(): Promise<void> {
  await AsyncStorage.multiRemove([
    '@demo_mode',
    '@auth_user',
    '@auth_tokens',
    'custom-folders-v1',
    '@history_entries',
  ]);
}

/**
 * Waits for a specified amount of time
 */
export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Waits for an element to appear (for async operations)
 */
export async function waitForElement(
  condition: () => boolean,
  timeout: number = 5000,
  interval: number = 100
): Promise<void> {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    if (condition()) {
      return;
    }
    await wait(interval);
  }
  throw new Error('Element did not appear within timeout');
}

