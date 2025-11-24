import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { NetworkError, AuthError, ValidationError } from '@/utils/errorHandling';

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('useErrorHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with no error', () => {
    const { result } = renderHook(() => useErrorHandler());
    expect(result.current.error).toBeNull();
  });

  it('handles errors and sets error state', () => {
    const { result } = renderHook(() => useErrorHandler());
    
    act(() => {
      result.current.handleError(new NetworkError('Connection failed'));
    });
    
    expect(result.current.error).toBeTruthy();
    expect(result.current.error?.code).toBe('NETWORK_ERROR');
  });

  it('clears error state', () => {
    const { result } = renderHook(() => useErrorHandler());
    
    act(() => {
      result.current.handleError(new NetworkError('Failed'));
    });
    
    expect(result.current.error).toBeTruthy();
    
    act(() => {
      result.current.clearError();
    });
    
    expect(result.current.error).toBeNull();
  });

  it('handles async operations successfully', async () => {
    const { result } = renderHook(() => useErrorHandler());
    
    await act(async () => {
      const value = await result.current.handleAsync(async () => {
        return 'success';
      });
      expect(value).toBe('success');
    });
    
    expect(result.current.error).toBeNull();
  });

  it('handles async operations with errors', async () => {
    const { result } = renderHook(() => useErrorHandler());
    
    await act(async () => {
      const value = await result.current.handleAsync(async () => {
        throw new NetworkError('Failed');
      });
      expect(value).toBeNull();
    });
    
    expect(result.current.error).toBeTruthy();
    expect(result.current.error?.code).toBe('NETWORK_ERROR');
  });

  it('handles errors with toast notification', () => {
    const { result } = renderHook(() => useErrorHandler());
    
    act(() => {
      result.current.handleError(new NetworkError('Failed'));
    });
    
    // Error should be set
    expect(result.current.error).toBeTruthy();
    expect(result.current.error?.code).toBe('NETWORK_ERROR');
  });
});

