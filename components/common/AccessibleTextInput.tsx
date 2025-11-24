import React, { forwardRef } from 'react';
import { TextInput, TextInputProps, StyleSheet, View, Text } from 'react-native';
import { getInputAccessibilityProps } from '@/utils/accessibility';
import { useTheme } from '@/contexts/ThemeContext';

export interface AccessibleTextInputProps extends Omit<TextInputProps, 'accessibilityRole' | 'accessibilityLabel' | 'accessibilityHint'> {
  /**
   * Accessibility label for the input (required for screen readers)
   * If not provided, will be generated from placeholder
   */
  accessibilityLabel?: string;
  /**
   * Optional hint to provide additional context
   */
  accessibilityHint?: string;
  /**
   * Show error state
   */
  error?: boolean;
  /**
   * Error message to display
   */
  errorMessage?: string;
  /**
   * Label text to display above the input
   */
  label?: string;
}

/**
 * AccessibleTextInput - A TextInput wrapper with built-in accessibility support
 * 
 * @example
 * <AccessibleTextInput
 *   accessibilityLabel="Folder name"
 *   accessibilityHint="Enter a name for your new folder"
 *   placeholder="Folder name"
 *   value={folderName}
 *   onChangeText={setFolderName}
 *   error={hasError}
 *   errorMessage="Folder name is required"
 * />
 */
export const AccessibleTextInput = forwardRef<TextInput, AccessibleTextInputProps>(
  (
    {
      accessibilityLabel,
      accessibilityHint,
      placeholder,
      error,
      errorMessage,
      label,
      style,
      ...props
    },
    ref
  ) => {
    const { colors } = useTheme();
    
    // Generate accessibility label from placeholder if not provided
    const labelText = accessibilityLabel || (placeholder ? `${placeholder} input` : 'Text input');
    
    const accessibilityProps = getInputAccessibilityProps(labelText, {
      hint: accessibilityHint,
      placeholder,
      error,
      disabled: props.editable === false,
    });

    return (
      <View style={styles.container}>
        {label && (
          <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
        )}
        <TextInput
          ref={ref}
          {...props}
          {...accessibilityProps}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          style={[
            styles.input,
            { 
              color: colors.text,
              borderColor: error ? colors.danger : colors.border,
              backgroundColor: colors.surface,
            },
            style,
          ]}
        />
        {error && errorMessage && (
          <Text style={[styles.errorText, { color: colors.danger }]}>
            {errorMessage}
          </Text>
        )}
      </View>
    );
  }
);

AccessibleTextInput.displayName = 'AccessibleTextInput';

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 44, // Minimum touch target size
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});


