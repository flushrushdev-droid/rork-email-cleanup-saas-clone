import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { createAIStyles } from './styles';

interface AIDropdownProps {
  label: string;
  value: string;
  options: string[];
  onSelect: (value: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  colors: any;
}

export function AIDropdown({ label, value, options, onSelect, isOpen, onToggle, colors }: AIDropdownProps) {
  const styles = createAIStyles(colors);

  const handleSelect = (option: string) => {
    onSelect(option);
    onToggle();
  };

  return (
    <View style={styles.aiOption}>
      <Text style={[styles.aiDropdownLabel, { color: colors.textSecondary }]}>{label}</Text>
      <TouchableOpacity
        style={[styles.aiDropdownButton, { backgroundColor: colors.surface }]}
        onPress={onToggle}
      >
        <Text style={[styles.aiDropdownValue, { color: colors.text }]}>{value}</Text>
        <ChevronDown size={16} color={colors.textSecondary} />
      </TouchableOpacity>
      {isOpen && (
        <View style={[styles.aiDropdownOverlay, { backgroundColor: colors.surface }]}>
          {options.map((option) => (
            <TouchableOpacity
              key={option}
              style={[styles.aiDropdownItem, { borderBottomColor: colors.border }]}
              onPress={() => handleSelect(option)}
            >
              <Text
                style={[
                  styles.aiDropdownItemText,
                  { color: colors.text },
                  value === option && { color: colors.primary, fontWeight: '600' as const },
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

