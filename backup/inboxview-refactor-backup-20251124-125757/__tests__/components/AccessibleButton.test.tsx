import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import { AccessibleButton } from '@/components/common/AccessibleButton';
import { ThemeProvider } from '@/contexts/ThemeContext';

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
  ThemeProvider: ({ children }: any) => children,
}));

describe('AccessibleButton', () => {
  it('renders with accessibility label', () => {
    const { getByLabelText } = render(
      <AccessibleButton accessibilityLabel="Test button" onPress={() => {}}>
        <Text>Click me</Text>
      </AccessibleButton>
    );
    
    expect(getByLabelText('Test button')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByLabelText } = render(
      <AccessibleButton accessibilityLabel="Test button" onPress={onPress}>
        <Text>Click me</Text>
      </AccessibleButton>
    );
    
    fireEvent.press(getByLabelText('Test button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('shows loading state with busy accessibility state', () => {
    const { getByLabelText } = render(
      <AccessibleButton accessibilityLabel="Test button" onPress={() => {}} loading>
        <Text>Click me</Text>
      </AccessibleButton>
    );
    
    const button = getByLabelText('Test button');
    expect(button.props.accessibilityState.busy).toBe(true);
    // TouchableOpacity disabled prop is checked via accessibilityState
    expect(button.props.accessibilityState.disabled).toBe(true);
  });

  it('handles disabled state', () => {
    const { getByLabelText } = render(
      <AccessibleButton accessibilityLabel="Test button" onPress={() => {}} disabled>
        <Text>Click me</Text>
      </AccessibleButton>
    );
    
    const button = getByLabelText('Test button');
    expect(button.props.accessibilityState.disabled).toBe(true);
  });

  it('does not call onPress when disabled', () => {
    const onPress = jest.fn();
    const { getByLabelText } = render(
      <AccessibleButton accessibilityLabel="Test button" onPress={onPress} disabled>
        <Text>Click me</Text>
      </AccessibleButton>
    );
    
    fireEvent.press(getByLabelText('Test button'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('includes accessibility hint when provided', () => {
    const { getByLabelText } = render(
      <AccessibleButton
        accessibilityLabel="Test button"
        accessibilityHint="This button does something important"
        onPress={() => {}}
      >
        <Text>Click me</Text>
      </AccessibleButton>
    );
    
    const button = getByLabelText('Test button');
    expect(button.props.accessibilityHint).toBe('This button does something important');
  });

  it('has correct accessibility role', () => {
    const { getByLabelText } = render(
      <AccessibleButton accessibilityLabel="Test button" onPress={() => {}}>
        <Text>Click me</Text>
      </AccessibleButton>
    );
    
    const button = getByLabelText('Test button');
    expect(button.props.accessibilityRole).toBe('button');
  });
});

