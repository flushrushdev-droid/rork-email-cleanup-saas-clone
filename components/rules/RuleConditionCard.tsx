import React from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { X, ChevronDown } from 'lucide-react-native';
import type { RuleCondition, RuleConditionField, RuleConditionOperator } from '@/constants/types';

interface RuleConditionCardProps {
  condition: RuleCondition;
  index: number;
  onUpdate: (index: number, field: keyof RuleCondition, value: string | number) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
  dropdown: {
    visible: boolean;
    type: 'field' | 'operator' | 'action' | null;
    index: number;
  };
  onOpenDropdown: (type: 'field' | 'operator', index: number) => void;
  onSelectOption: (value: string | RuleConditionField | RuleConditionOperator) => void;
  getValidOperators: (field: RuleConditionField) => RuleConditionOperator[];
  colors: any;
}

const CONDITION_FIELDS: { value: RuleConditionField; label: string }[] = [
  { value: 'sender', label: 'Sender' },
  { value: 'subject', label: 'Subject' },
  { value: 'body', label: 'Body' },
  { value: 'domain', label: 'Domain' },
  { value: 'age', label: 'Age (days)' },
  { value: 'size', label: 'Size (bytes)' },
  { value: 'date', label: 'Date' },
  { value: 'hasAttachments', label: 'Has Attachments' },
  { value: 'isRead', label: 'Is Read' },
  { value: 'isStarred', label: 'Is Starred' },
  { value: 'label', label: 'Label' },
  { value: 'semantic', label: 'Content matches (AI)' },
];

const OPERATORS: { value: RuleConditionOperator; label: string }[] = [
  { value: 'contains', label: 'contains' },
  { value: 'notContains', label: 'does not contain' },
  { value: 'equals', label: 'equals' },
  { value: 'notEquals', label: 'does not equal' },
  { value: 'startsWith', label: 'starts with' },
  { value: 'endsWith', label: 'ends with' },
  { value: 'greaterThan', label: 'greater than' },
  { value: 'lessThan', label: 'less than' },
  { value: 'greaterThanOrEqual', label: 'greater than or equal' },
  { value: 'lessThanOrEqual', label: 'less than or equal' },
  { value: 'matches', label: 'matches (regex)' },
  { value: 'isTrue', label: 'is true' },
  { value: 'isFalse', label: 'is false' },
  { value: 'before', label: 'before' },
  { value: 'after', label: 'after' },
];

export function RuleConditionCard({
  condition,
  index,
  onUpdate,
  onRemove,
  canRemove,
  dropdown,
  onOpenDropdown,
  onSelectOption,
  getValidOperators,
  colors,
}: RuleConditionCardProps) {
  const styles = React.useMemo(() => createRuleConditionCardStyles(colors), [colors]);

  const getPlaceholder = () => {
    if (condition.field === 'age') return 'Number of days (e.g., 30)';
    if (condition.field === 'size') return 'Size in bytes (e.g., 1048576)';
    if (condition.field === 'date') return 'Date (e.g., 2024-01-15)';
    if (condition.field === 'semantic') return 'Keywords or phrase';
    if (condition.field === 'subject' || condition.field === 'body') return 'Text to search for';
    return 'Text to match';
  };

  const showValueInput = condition.operator !== 'isTrue' && condition.operator !== 'isFalse';

  return (
    <View style={[styles.conditionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={[styles.conditionRow, { zIndex: dropdown.visible && dropdown.index === index ? 1000 : 1 }]}>
        <View style={[styles.pickerContainer, { zIndex: dropdown.visible && dropdown.type === 'field' && dropdown.index === index ? 1001 : 1 }]}>
          <Text style={[styles.pickerLabel, { color: colors.textSecondary }]}>Field</Text>
          <TouchableOpacity
            style={[styles.picker, { backgroundColor: colors.background, borderColor: colors.border }]}
            onPress={() => onOpenDropdown('field', index)}
          >
            <Text style={[styles.pickerValue, { color: colors.text }]}>
              {CONDITION_FIELDS.find((f) => f.value === condition.field)?.label}
            </Text>
            <ChevronDown size={16} color={colors.textSecondary} />
          </TouchableOpacity>
          {dropdown.visible && dropdown.type === 'field' && dropdown.index === index && (
            <View style={[styles.dropdownMenu, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {CONDITION_FIELDS.map((field) => (
                <TouchableOpacity
                  key={field.value}
                  style={[styles.dropdownOption, { borderBottomColor: colors.border }]}
                  onPress={() => onSelectOption(field.value)}
                >
                  <Text style={[styles.dropdownOptionText, { color: colors.text }]}>{field.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={[styles.pickerContainer, { zIndex: dropdown.visible && dropdown.type === 'operator' && dropdown.index === index ? 1001 : 1 }]}>
          <Text style={[styles.pickerLabel, { color: colors.textSecondary }]}>Operator</Text>
          <TouchableOpacity
            style={[styles.picker, { backgroundColor: colors.background, borderColor: colors.border }]}
            onPress={() => onOpenDropdown('operator', index)}
          >
            <Text style={[styles.pickerValue, { color: colors.text }]}>
              {OPERATORS.find((o) => o.value === condition.operator)?.label}
            </Text>
            <ChevronDown size={16} color={colors.textSecondary} />
          </TouchableOpacity>
          {dropdown.visible && dropdown.type === 'operator' && dropdown.index === index && (
            <View style={[styles.dropdownMenu, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {OPERATORS.filter((op) => getValidOperators(condition.field).includes(op.value)).map((operator) => (
                <TouchableOpacity
                  key={operator.value}
                  style={[styles.dropdownOption, { borderBottomColor: colors.border }]}
                  onPress={() => onSelectOption(operator.value)}
                >
                  <Text style={[styles.dropdownOptionText, { color: colors.text }]}>{operator.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      {showValueInput && (
        <View style={styles.valueRow}>
          <Text style={[styles.pickerLabel, { color: colors.textSecondary }]}>Value</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
            placeholder={getPlaceholder()}
            placeholderTextColor={colors.textSecondary}
            value={String(condition.value || '')}
            onChangeText={(text) => {
              let value: string | number = text;
              if (condition.field === 'age' || condition.field === 'size') {
                value = Number(text) || 0;
              }
              onUpdate(index, 'value', value);
            }}
            keyboardType={condition.field === 'age' || condition.field === 'size' ? 'numeric' : 'default'}
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

function createRuleConditionCardStyles(colors: any) {
  return StyleSheet.create({
    conditionCard: {
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
    },
    conditionRow: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 12,
    },
    pickerContainer: {
      flex: 1,
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

