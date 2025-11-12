import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { Plus, X, ChevronDown } from 'lucide-react-native';

import { useTheme } from '@/contexts/ThemeContext';
import {
  RuleCondition,
  RuleAction,
  RuleConditionField,
  RuleConditionOperator,
  RuleActionType,
} from '@/constants/types';

const CONDITION_FIELDS: { value: RuleConditionField; label: string }[] = [
  { value: 'sender', label: 'Sender' },
  { value: 'domain', label: 'Domain' },
  { value: 'age', label: 'Age (days)' },
  { value: 'semantic', label: 'Content matches' },
];

const OPERATORS: { value: RuleConditionOperator; label: string }[] = [
  { value: 'contains', label: 'contains' },
  { value: 'equals', label: 'equals' },
  { value: 'greaterThan', label: 'greater than' },
  { value: 'matches', label: 'matches' },
];

const ACTION_TYPES: { value: RuleActionType; label: string }[] = [
  { value: 'label', label: 'Add Label' },
  { value: 'tag', label: 'Add Tag' },
  { value: 'archive', label: 'Archive' },
  { value: 'delete', label: 'Delete' },
];

type DropdownState = {
  visible: boolean;
  type: 'field' | 'operator' | 'action' | null;
  index: number;
};

export default function CreateRuleScreen() {
  const { colors } = useTheme();
  const [ruleName, setRuleName] = useState<string>('');
  const [conditions, setConditions] = useState<RuleCondition[]>([
    { field: 'sender', operator: 'contains', value: '' },
  ]);
  const [actions, setActions] = useState<RuleAction[]>([
    { type: 'archive' },
  ]);
  const [dropdown, setDropdown] = useState<DropdownState>({
    visible: false,
    type: null,
    index: -1,
  });

  const addCondition = () => {
    setConditions([...conditions, { field: 'sender', operator: 'contains', value: '' }]);
  };

  const removeCondition = (index: number) => {
    if (conditions.length > 1) {
      setConditions(conditions.filter((_, i) => i !== index));
    }
  };

  const updateCondition = (
    index: number,
    field: keyof RuleCondition,
    value: string | number
  ) => {
    const updated = [...conditions];
    updated[index] = { ...updated[index], [field]: value };
    setConditions(updated);
  };

  const addAction = () => {
    setActions([...actions, { type: 'archive' }]);
  };

  const removeAction = (index: number) => {
    if (actions.length > 1) {
      setActions(actions.filter((_, i) => i !== index));
    }
  };

  const updateAction = (index: number, field: keyof RuleAction, value: string) => {
    const updated = [...actions];
    updated[index] = { ...updated[index], [field]: value };
    setActions(updated);
  };

  const openDropdown = (type: 'field' | 'operator' | 'action', index: number) => {
    if (dropdown.visible && dropdown.type === type && dropdown.index === index) {
      setDropdown({ visible: false, type: null, index: -1 });
    } else {
      setDropdown({ visible: true, type, index });
    }
  };

  const closeDropdown = () => {
    setDropdown({ visible: false, type: null, index: -1 });
  };

  const selectDropdownOption = (
    value: RuleConditionField | RuleConditionOperator | RuleActionType
  ) => {
    const { type, index } = dropdown;

    if (type === 'field') {
      updateCondition(index, 'field', value as RuleConditionField);
    } else if (type === 'operator') {
      updateCondition(index, 'operator', value as RuleConditionOperator);
    } else if (type === 'action') {
      updateAction(index, 'type', value as RuleActionType);
    }

    closeDropdown();
  };

  const handleSave = () => {
    if (!ruleName.trim()) {
      Alert.alert('Error', 'Please enter a rule name');
      return;
    }

    const hasEmptyConditions = conditions.some((c) => !c.value);
    if (hasEmptyConditions) {
      Alert.alert('Error', 'Please fill in all condition values');
      return;
    }

    const actionsNeedingValue = actions.filter((a) => a.type === 'label' || a.type === 'tag');
    const hasEmptyActions = actionsNeedingValue.some((a) => !a.value);
    if (hasEmptyActions) {
      Alert.alert('Error', 'Please fill in all action values');
      return;
    }

    Alert.alert('Success', `Rule "${ruleName}" created successfully!`, [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Create New Rule',
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
        }}
      />
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.text }]}>Rule Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
              placeholder="e.g., Archive old newsletters"
              placeholderTextColor={colors.textSecondary}
              value={ruleName}
              onChangeText={setRuleName}
            />
          </View>

          <View style={[styles.section, { zIndex: dropdown.visible && dropdown.type !== 'action' ? 1000 : 1 }]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Conditions (When)</Text>
              <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>All conditions must be met</Text>
            </View>

            {conditions.map((condition, index) => (
              <View key={index} style={[styles.conditionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={[styles.conditionRow, { zIndex: dropdown.visible && dropdown.index === index ? 1000 : 1 }]}>
                  <View style={[styles.pickerContainer, { zIndex: dropdown.visible && dropdown.type === 'field' && dropdown.index === index ? 1001 : 1 }]}>
                    <Text style={[styles.pickerLabel, { color: colors.textSecondary }]}>Field</Text>
                    <TouchableOpacity
                      style={[styles.picker, { backgroundColor: colors.background, borderColor: colors.border }]}
                      onPress={() => openDropdown('field', index)}
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
                            onPress={() => selectDropdownOption(field.value)}
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
                      onPress={() => openDropdown('operator', index)}
                    >
                      <Text style={[styles.pickerValue, { color: colors.text }]}>
                        {OPERATORS.find((o) => o.value === condition.operator)?.label}
                      </Text>
                      <ChevronDown size={16} color={colors.textSecondary} />
                    </TouchableOpacity>
                    {dropdown.visible && dropdown.type === 'operator' && dropdown.index === index && (
                      <View style={[styles.dropdownMenu, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        {OPERATORS.map((operator) => (
                          <TouchableOpacity
                            key={operator.value}
                            style={[styles.dropdownOption, { borderBottomColor: colors.border }]}
                            onPress={() => selectDropdownOption(operator.value)}
                          >
                            <Text style={[styles.dropdownOptionText, { color: colors.text }]}>{operator.label}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                </View>

                <View style={styles.valueRow}>
                  <Text style={[styles.pickerLabel, { color: colors.textSecondary }]}>Value</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                    placeholder={
                      condition.field === 'age'
                        ? 'Number of days'
                        : condition.field === 'semantic'
                        ? 'Keywords or phrase'
                        : 'Text to match'
                    }
                    placeholderTextColor={colors.textSecondary}
                    value={String(condition.value)}
                    onChangeText={(text) => {
                      const value = condition.field === 'age' ? Number(text) || 0 : text;
                      updateCondition(index, 'value', value);
                    }}
                    keyboardType={condition.field === 'age' ? 'numeric' : 'default'}
                  />
                </View>

                {conditions.length > 1 && (
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeCondition(index)}
                  >
                    <X size={16} color={colors.danger} />
                    <Text style={[styles.removeButtonText, { color: colors.danger }]}>Remove</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}

            <TouchableOpacity style={[styles.addButton, { zIndex: -1, backgroundColor: colors.surface, borderColor: colors.primary }]} onPress={addCondition}>
              <Plus size={18} color={colors.primary} />
              <Text style={[styles.addButtonText, { color: colors.primary }]}>Add Condition</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.section, { zIndex: dropdown.visible && dropdown.type === 'action' ? 1000 : 1 }]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Actions (Then)</Text>
              <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>What to do when conditions match</Text>
            </View>

            {actions.map((action, index) => (
              <View key={index} style={[styles.actionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={[styles.actionRow, { zIndex: dropdown.visible && dropdown.index === index ? 1000 : 1 }]}>
                  <View style={[styles.pickerContainer, { flex: 1, zIndex: dropdown.visible && dropdown.type === 'action' && dropdown.index === index ? 1001 : 1 }]}>
                    <Text style={[styles.pickerLabel, { color: colors.textSecondary }]}>Action</Text>
                    <TouchableOpacity
                      style={[styles.picker, { backgroundColor: colors.background, borderColor: colors.border }]}
                      onPress={() => openDropdown('action', index)}
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
                            onPress={() => selectDropdownOption(actionType.value)}
                          >
                            <Text style={[styles.dropdownOptionText, { color: colors.text }]}>{actionType.label}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                </View>

                {(action.type === 'label' || action.type === 'tag') && (
                  <View style={styles.valueRow}>
                    <Text style={[styles.pickerLabel, { color: colors.textSecondary }]}>
                      {action.type === 'label' ? 'Label Name' : 'Tag Name'}
                    </Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                      placeholder={action.type === 'label' ? 'e.g., Receipts' : 'e.g., finance'}
                      placeholderTextColor={colors.textSecondary}
                      value={action.value || ''}
                      onChangeText={(text) => updateAction(index, 'value', text)}
                    />
                  </View>
                )}

                {actions.length > 1 && (
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeAction(index)}
                  >
                    <X size={16} color={colors.danger} />
                    <Text style={[styles.removeButtonText, { color: colors.danger }]}>Remove</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}

            <TouchableOpacity style={[styles.addButton, { zIndex: -1, backgroundColor: colors.surface, borderColor: colors.primary }]} onPress={addAction}>
              <Plus size={18} color={colors.primary} />
              <Text style={[styles.addButtonText, { color: colors.primary }]}>Add Action</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bottomSpace} />
        </ScrollView>



        <View style={[styles.footer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TouchableOpacity style={[styles.cancelButton, { backgroundColor: colors.background, borderColor: colors.border }]} onPress={() => router.back()}>
            <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.primary }]} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Create Rule</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    borderWidth: 1,
  },
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
  valueRow: {
    marginBottom: 8,
  },
  pickerContainer: {
    flex: 1,
    position: 'relative' as const,
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
  actionCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  actionRow: {
    marginBottom: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
  },
  cancelButton: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  bottomSpace: {
    height: 100,
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