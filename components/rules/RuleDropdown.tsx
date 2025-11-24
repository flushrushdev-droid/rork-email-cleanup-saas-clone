import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { createRuleStyles } from './styles';

interface RuleDropdownProps {
  visible: boolean;
  options: { value: string; label: string }[];
  onSelect: (value: string) => void;
  onClose: () => void;
  colors: any;
}

export function RuleDropdown({
  visible,
  options,
  onSelect,
  onClose,
  colors,
}: RuleDropdownProps) {
  const styles = createRuleStyles(colors);

  if (!visible) return null;

  return (
    <View style={[styles.dropdownMenu, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <ScrollView style={{ maxHeight: 200 }}>
        {options.map((option, index) => (
          <TouchableOpacity
            key={option.value}
            style={[styles.dropdownOption, { borderBottomColor: colors.border }, index === options.length - 1 && { borderBottomWidth: 0 }]}
            onPress={() => {
              onSelect(option.value);
              onClose();
            }}
          >
            <Text style={[styles.dropdownOptionText, { color: colors.text }]}>{option.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}


