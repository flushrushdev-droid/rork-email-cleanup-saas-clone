import React from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { X, ChevronDown } from 'lucide-react-native';
import type { RuleAction, RuleActionType } from '@/constants/types';

interface RuleActionCardProps {
  action: RuleAction;
  index: number;
  onUpdate: (index: number, field: keyof RuleAction, value: string) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
  dropdown: {
    visible: boolean;
    type: 'field' | 'operator' | 'action' | null;
    index: number;
  };
  onOpenDropdown: (type: 'action', index: number) => void;
  onSelectOption: (value: string | RuleActionType) => void;
  colors: any;
}

const ACTION_TYPES: { value: RuleActionType; label: string }[] = [
  { value: 'label', label: 'Add Label' },
  { value: 'tag', label: 'Add Tag' },
  { value: 'archive', label: 'Archive' },
  { value: 'delete', label: 'Delete' },
];

export function RuleActionCard({
  action,
  index,
  onUpdate,
  onRemove,
  canRemove,
  dropdown,
  onOpenDropdown,
  onSelectOption,
  colors,
}: RuleActionCardProps) {
  const styles = React.useMemo(() => createRuleActionCardStyles(colors), [colors]);

  const needsValue = action.type === 'label' || action.type === 'tag';

  return (
    <View style={[styles.actionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={[styles.actionRow, { zIndex: dropdown.visible && dropdown.index === index ? 1000 : 1 }]}>
        <View style={[styles.pickerContainer, { flex: 1, zIndex: dropdown.visible && dropdown.type === 'action' && dropdown.index === index ? 1001 : 1 }]}>
          <Text style={[styles.pickerLabel, { color: colors.textSecondary }]}>Action</Text>
          <TouchableOpacity
            style={[styles.picker, { backgroundColor: colors.background, borderColor: colors.border }]}
            onPress={() => onOpenDropdown('action', index)}
          >
            <Text style={[styles.pickerValue, { color: colors.text }]}>
              {ACTION_TYPES.find((a) => a.value === action.type)?.label}
            </Text>
            <ChevronDown size={16} color={colors.textSecondary} />
          </TouchableOpacity>
          {dropdown.visible && dropdown.type === 'action' && dropdown.index === index && (
            <View style={[styles.dropdownMenu, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {ACTION_TYPES.map((actionType) => (
                <TouchableOpacity
                  key={actionType.value}
                  style={[styles.dropdownOption, { borderBottomColor: colors.border }]}
                  onPress={() => onSelectOption(actionType.value)}
                >
                  <Text style={[styles.dropdownOptionText, { color: colors.text }]}>{actionType.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      {needsValue && (
        <View style={styles.valueRow}>
          <Text style={[styles.pickerLabel, { color: colors.textSecondary }]}>
            {action.type === 'label' ? 'Label Name' : 'Tag Name'}
          </Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
            placeholder={action.type === 'label' ? 'e.g., Receipts' : 'e.g., finance'}
            placeholderTextColor={colors.textSecondary}
            value={action.value || ''}
            onChangeText={(text) => onUpdate(index, 'value', text)}
          />
        </View>
      )}

      {canRemove && (
        <TouchableOpacity style={styles.removeButton} onPress={() => onRemove(index)}>
          <X size={16} color={colors.danger} />
          <Text style={[styles.removeButtonText, { color: colors.danger }]}>Remove</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function createRuleActionCardStyles(colors: any) {
  return StyleSheet.create({
    actionCard: {
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
    },
    actionRow: {
      marginBottom: 8,
    },
    pickerContainer: {
      position: 'relative',
    },
    pickerLabel: {
      fontSize: 13,
      fontWeight: '600',
      marginBottom: 6,
    },
    picker: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderRadius: 10,
      padding: 12,
      borderWidth: 1,
    },
    pickerValue: {
      fontSize: 14,
      fontWeight: '500',
    },
    valueRow: {
      marginBottom: 8,
    },
    input: {
      borderRadius: 12,
      padding: 14,
      fontSize: 15,
      borderWidth: 1,
    },
    removeButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      alignSelf: 'flex-start',
    },
    removeButtonText: {
      fontSize: 13,
      fontWeight: '600',
    },
    dropdownMenu: {
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      borderRadius: 12,
      marginTop: 4,
      borderWidth: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 5,
      zIndex: 1002,
      maxHeight: 200,
    },
    dropdownOption: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
    },
    dropdownOptionText: {
      fontSize: 14,
      fontWeight: '500',
    },
  });
}

