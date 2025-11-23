import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Mock storage implementation for testing
 */
export class MockStorage {
  private storage: Map<string, string> = new Map();

  async getItem(key: string): Promise<string | null> {
    return this.storage.get(key) || null;
  }

  async setItem(key: string, value: string): Promise<void> {
    this.storage.set(key, value);
  }

  async removeItem(key: string): Promise<void> {
    this.storage.delete(key);
  }

  async multiGet(keys: string[]): Promise<[string, string | null][]> {
    return keys.map(key => [key, this.storage.get(key) || null]);
  }

  async multiSet(keyValuePairs: [string, string][]): Promise<void> {
    keyValuePairs.forEach(([key, value]) => {
      this.storage.set(key, value);
    });
  }

  async multiRemove(keys: string[]): Promise<void> {
    keys.forEach(key => this.storage.delete(key));
  }

  async clear(): Promise<void> {
    this.storage.clear();
  }

  getAllKeys(): Promise<string[]> {
    return Promise.resolve(Array.from(this.storage.keys()));
  }
}

/**
 * Setup mock storage for tests
 */
export function setupMockStorage(): MockStorage {
  const mockStorage = new MockStorage();
  // You can pre-populate with demo data if needed
  return mockStorage;
}

