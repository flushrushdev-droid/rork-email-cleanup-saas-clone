import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { createComposeStyles } from './styles';

interface ComposeFormFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  colors: any;
}

export function ComposeFormField({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  keyboardType = 'default',
  colors,
}: ComposeFormFieldProps) {
  const styles = createComposeStyles(colors);

  return (
    <View style={multiline ? [styles.composeField, styles.composeBodyField] : styles.composeField}>
      {!multiline && <Text style={[styles.composeLabel, { color: colors.textSecondary }]}>{label}</Text>}
      <TextInput
        style={[
          styles.composeInput,
          multiline && styles.composeBodyInput,
          { color: colors.text }
        ]}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        keyboardType={keyboardType}
        autoCapitalize={keyboardType === 'email-address' ? 'none' : 'sentences'}
        placeholderTextColor={colors.textSecondary}
      />
    </View>
  );
}


