// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    setParams: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
  useSegments: () => [],
  usePathname: () => '/',
  Stack: {
    Screen: ({ children }: any) => children,
  },
  Tabs: {
    Screen: ({ children }: any) => children,
  },
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  },
}));

// Mock expo modules
jest.mock('expo-auth-session', () => ({
  useAuthRequest: jest.fn(() => [null, null, jest.fn()]),
  ResponseType: { Code: 'code' },
}));

jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn(() =>
    Promise.resolve({
      canceled: false,
      assets: [{ name: 'test.pdf', size: 1024, uri: 'file://test.pdf' }],
    })
  ),
}));

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(() =>
    Promise.resolve({
      canceled: false,
      assets: [{ uri: 'file://test.jpg', width: 100, height: 100 }],
    })
  ),
}));

jest.mock('expo-constants', () => ({
  default: {
    expoConfig: {
      extra: {},
    },
  },
}));

// Mock SafeAreaContext
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

// Mock Alert
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return Object.setPrototypeOf(
    {
      Alert: { alert: jest.fn() },
      Platform: { OS: 'ios', select: (obj: any) => obj.ios || obj.default },
    },
    RN
  );
});

import AsyncStorage from '@react-native-async-storage/async-storage';

// Setup for each test
beforeEach(() => {
  jest.clearAllMocks();
  AsyncStorage.clear();
});

// Set demo mode by default
beforeEach(async () => {
  await AsyncStorage.setItem('@demo_mode', 'true');
});
