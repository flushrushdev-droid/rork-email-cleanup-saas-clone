import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { createComposeStyles } from './styles';

interface ComposeFormFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  colors: any;
  error?: boolean;
  errorMessage?: string;
}

export function ComposeFormField({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  keyboardType = 'default',
  colors,
  error = false,
  errorMessage,
}: ComposeFormFieldProps) {
  const styles = createComposeStyles(colors);

  return (
    <View style={multiline ? [styles.composeField, styles.composeBodyField] : styles.composeField}>
      {!multiline && <Text style={[styles.composeLabel, { color: colors.textSecondary }]}>{label}</Text>}
      <TextInput
        style={[
          styles.composeInput,
          multiline && styles.composeBodyInput,
          { color: colors.text },
          error && { borderColor: colors.danger, borderWidth: 1 },
        ]}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        keyboardType={keyboardType}
        autoCapitalize={keyboardType === 'email-address' ? 'none' : 'sentences'}
        placeholderTextColor={colors.textSecondary}
        accessible={true}
        accessibilityLabel={label || placeholder || 'Text input'}
        accessibilityHint={error && errorMessage ? errorMessage : (placeholder ? `Enter ${placeholder.toLowerCase()}` : undefined)}
      />
      {error && errorMessage && (
        <Text style={[fieldStyles.errorText, { color: colors.danger }]}>{errorMessage}</Text>
      )}
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});


