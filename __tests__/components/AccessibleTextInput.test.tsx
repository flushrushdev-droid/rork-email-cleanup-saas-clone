import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { AccessibleTextInput } from '@/components/common/AccessibleTextInput';

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

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

describe('AccessibleTextInput', () => {
  it('renders with accessibility label', () => {
    const { getByLabelText } = render(
      <AccessibleTextInput
        accessibilityLabel="Email input"
        value=""
        onChangeText={() => {}}
      />
    );
    
    expect(getByLabelText('Email input')).toBeTruthy();
  });

  it('auto-generates accessibility label from placeholder', () => {
    const { getByLabelText } = render(
      <AccessibleTextInput
        placeholder="Enter your email"
        value=""
        onChangeText={() => {}}
      />
    );
    
    expect(getByLabelText('Enter your email input')).toBeTruthy();
  });

  it('shows error state and message', () => {
    const { getByText, getByLabelText } = render(
      <AccessibleTextInput
        accessibilityLabel="Email input"
        value=""
        onChangeText={() => {}}
        error={true}
        errorMessage="Email is required"
      />
    );
    
    const input = getByLabelText('Email input');
    expect(input).toBeTruthy();
    expect(getByText('Email is required')).toBeTruthy();
  });

  it('calls onChangeText when text changes', () => {
    const onChangeText = jest.fn();
    const { getByLabelText } = render(
      <AccessibleTextInput
        accessibilityLabel="Email input"
        value=""
        onChangeText={onChangeText}
      />
    );
    
    const input = getByLabelText('Email input');
    fireEvent.changeText(input, 'test@example.com');
    expect(onChangeText).toHaveBeenCalledWith('test@example.com');
  });

  it('displays label when provided', () => {
    const { getByText } = render(
      <AccessibleTextInput
        accessibilityLabel="Email input"
        label="Email Address"
        value=""
        onChangeText={() => {}}
      />
    );
    
    expect(getByText('Email Address')).toBeTruthy();
  });

  it('has correct accessibility role', () => {
    const { getByLabelText } = render(
      <AccessibleTextInput
        accessibilityLabel="Email input"
        value=""
        onChangeText={() => {}}
      />
    );
    
    const input = getByLabelText('Email input');
    expect(input.props.accessibilityRole).toBe('searchbox');
  });

  it('handles disabled state', () => {
    const { getByLabelText } = render(
      <AccessibleTextInput
        accessibilityLabel="Email input"
        value=""
        onChangeText={() => {}}
        editable={false}
      />
    );
    
    const input = getByLabelText('Email input');
    expect(input.props.editable).toBe(false);
    expect(input.props.accessibilityState.disabled).toBe(true);
  });
});


