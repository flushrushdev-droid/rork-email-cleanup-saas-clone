import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ErrorDisplay } from '@/components/common/ErrorDisplay';
import { NetworkError, AuthError, ValidationError, APIError } from '@/utils/errorHandling';

// Mock ThemeContext
jest.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      primary: '#007AFF',
      secondary: '#5856D6',
      surface: '#F2F2F7',
      background: '#FFFFFF',
      text: '#000000',
      textSecondary: '#8E8E93',
      success: '#34C759',
      danger: '#FF3B30',
      border: '#C6C6C8',
      warning: '#FF9500',
    },
  }),
}));

describe('ErrorDisplay', () => {
  it('displays error message for inline variant', () => {
    const error = new NetworkError('Connection failed');
    const { getByText } = render(
      <ErrorDisplay error={error} variant="inline" />
    );
    
    expect(getByText(/unable to connect/i)).toBeTruthy();
  });

  it('shows retry button for retryable errors', () => {
    const error = new NetworkError('Connection failed');
    const onRetry = jest.fn();
    const { getByLabelText } = render(
      <ErrorDisplay
        error={error}
        variant="alert"
        showRetry={true}
        onRetry={onRetry}
      />
    );
    
    const retryButton = getByLabelText(/retry/i);
    expect(retryButton).toBeTruthy();
    
    fireEvent.press(retryButton);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('does not show retry button for non-retryable errors', () => {
    const error = new AuthError('Unauthorized');
    const { queryByLabelText } = render(
      <ErrorDisplay
        error={error}
        variant="alert"
        showRetry={true}
        onRetry={() => {}}
      />
    );
    
    expect(queryByLabelText(/retry/i)).toBeNull();
  });

  it('shows dismiss button when onDismiss provided', () => {
    const error = new NetworkError('Connection failed');
    const onDismiss = jest.fn();
    const { getByLabelText } = render(
      <ErrorDisplay
        error={error}
        variant="alert"
        onDismiss={onDismiss}
      />
    );
    
    const dismissButton = getByLabelText(/dismiss/i);
    expect(dismissButton).toBeTruthy();
    
    fireEvent.press(dismissButton);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('displays validation error message', () => {
    const error = new ValidationError('Email is required', 'email');
    const { getByText } = render(
      <ErrorDisplay error={error} variant="inline" />
    );
    
    expect(getByText('Email is required')).toBeTruthy();
  });

  it('displays API error message', () => {
    const error = new APIError('Server error', 500);
    const { getByText } = render(
      <ErrorDisplay error={error} variant="alert" />
    );
    
    expect(getByText(/server error/i)).toBeTruthy();
  });

  it('uses custom message when provided', () => {
    const error = new NetworkError('Connection failed');
    const { getByText } = render(
      <ErrorDisplay
        error={error}
        variant="inline"
        message="Custom error message"
      />
    );
    
    expect(getByText('Custom error message')).toBeTruthy();
  });

  it('renders toast variant correctly', () => {
    const error = new NetworkError('Connection failed');
    const { getByText } = render(
      <ErrorDisplay
        error={error}
        variant="toast"
        onDismiss={() => {}}
      />
    );
    
    // Toast should display the error message
    expect(getByText(/unable to connect/i)).toBeTruthy();
  });
});

