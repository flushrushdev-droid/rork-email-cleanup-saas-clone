/**
 * Mock navigation utilities for testing
 */
export const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  setParams: jest.fn(),
  canGoBack: jest.fn(() => true),
  dismiss: jest.fn(),
  dismissAll: jest.fn(),
};

export const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  reset: jest.fn(),
  setParams: jest.fn(),
  dispatch: jest.fn(),
  isFocused: jest.fn(() => true),
  addListener: jest.fn(() => jest.fn()),
  removeListener: jest.fn(),
};

/**
 * Reset all navigation mocks
 */
export function resetNavigationMocks(): void {
  mockRouter.push.mockClear();
  mockRouter.replace.mockClear();
  mockRouter.back.mockClear();
  mockRouter.setParams.mockClear();
  mockNavigation.navigate.mockClear();
  mockNavigation.goBack.mockClear();
}

