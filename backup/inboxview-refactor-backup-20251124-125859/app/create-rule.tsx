import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Plus, X, ChevronDown, Check } from 'lucide-react-native';

import { useTheme } from '@/contexts/ThemeContext';
import {
  RuleCondition,
  RuleAction,
  RuleConditionField,
  RuleConditionOperator,
  RuleActionType,
  Rule,
} from '@/constants/types';

// Mock rules for editing (same as in rules.tsx)
const mockRules: Rule[] = [
  {
    id: '1',
    name: 'Archive old newsletters',
    enabled: true,
    conditions: [
      { field: 'sender', operator: 'contains', value: 'newsletter' },
      { field: 'age', operator: 'greaterThan', value: 90 },
    ],
    actions: [{ type: 'archive' }],
    createdAt: new Date('2024-11-01'),
    lastRun: new Date(Date.now() - 86400000),
    matchCount: 347,
  },
  {
    id: '2',
    name: 'Label receipts automatically',
    enabled: true,
    conditions: [
      { field: 'semantic', operator: 'matches', value: 'receipt OR invoice' },
    ],
    actions: [
      { type: 'label', value: 'Receipts' },
      { type: 'tag', value: 'finance' },
    ],
    createdAt: new Date('2024-10-15'),
    lastRun: new Date(Date.now() - 3600000),
    matchCount: 156,
  },
  {
    id: '3',
    name: 'Delete spam from specific domain',
    enabled: false,
    conditions: [
      { field: 'domain', operator: 'equals', value: 'spam-domain.com' },
    ],
    actions: [{ type: 'delete' }],
    createdAt: new Date('2024-09-20'),
    matchCount: 0,
  },
];

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

// Get valid operators for a given field type
const getValidOperators = (field: RuleConditionField): RuleConditionOperator[] => {
  switch (field) {
    // Text fields
    case 'sender':
    case 'subject':
    case 'body':
    case 'domain':
    case 'label':
      return ['contains', 'notContains', 'equals', 'notEquals', 'startsWith', 'endsWith', 'matches'];
    
    // Numeric fields
    case 'age':
    case 'size':
      return ['equals', 'notEquals', 'greaterThan', 'lessThan', 'greaterThanOrEqual', 'lessThanOrEqual'];
    
    // Date fields
    case 'date':
      return ['equals', 'before', 'after', 'greaterThan', 'lessThan'];
    
    // Boolean fields
    case 'hasAttachments':
    case 'isRead':
    case 'isStarred':
      return ['isTrue', 'isFalse', 'equals'];
    
    // AI/Semantic fields
    case 'semantic':
      return ['matches', 'contains', 'notContains'];
    
    default:
      return ['contains', 'equals'];
  }
};

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
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ ruleId?: string }>();
  const isEditMode = !!params.ruleId;
  const ruleToEdit = params.ruleId ? mockRules.find(r => r.id === params.ruleId) : null;

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
  const [toast, setToast] = useState<{ message: string } | null>(null);

  // Pre-fill form when editing
  useEffect(() => {
    if (ruleToEdit) {
      setRuleName(ruleToEdit.name);
      // Validate and fix operators when loading existing rule
      const validatedConditions = ruleToEdit.conditions.map((cond) => {
        const validOperators = getValidOperators(cond.field);
        if (!validOperators.includes(cond.operator)) {
          return { ...cond, operator: validOperators[0] };
        }
        return cond;
      });
      setConditions(validatedConditions);
      setActions(ruleToEdit.actions);
    }
  }, [ruleToEdit]);

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
      const newField = value as RuleConditionField;
      const validOperators = getValidOperators(newField);
      const currentOperator = conditions[index].operator;
      
      // If current operator is not valid for the new field, reset to first valid operator
      if (!validOperators.includes(currentOperator)) {
        updateCondition(index, 'field', newField);
        updateCondition(index, 'operator', validOperators[0]);
      } else {
        updateCondition(index, 'field', newField);
      }
    } else if (type === 'operator') {
      updateCondition(index, 'operator', value as RuleConditionOperator);
    } else if (type === 'action') {
      updateAction(index, 'type', value as RuleActionType);
    }

    closeDropdown();
  };

  const handleSave = () => {
    console.log('handleSave called', { ruleName, conditions, actions, isEditMode });
    
    // Validate rule name
    if (!ruleName.trim()) {
      console.log('Validation failed: rule name empty');
      Alert.alert('Error', 'Please enter a rule name');
      return;
    }

    // Validate conditions - check if value is needed based on operator
    const hasEmptyConditions = conditions.some((c) => {
      // Boolean operators don't need values
      if (c.operator === 'isTrue' || c.operator === 'isFalse') {
        return false;
      }
      
      // Check if value is empty
      if (c.field === 'age' || c.field === 'size') {
        return !c.value || (typeof c.value === 'number' && c.value <= 0);
      }
      return !c.value || (typeof c.value === 'string' && !c.value.trim());
    });
    
    if (hasEmptyConditions) {
      console.log('Validation failed: empty conditions');
      Alert.alert('Error', 'Please fill in all condition values');
      return;
    }

    // Validate operators are valid for their fields
    const hasInvalidOperators = conditions.some((c) => {
      const validOperators = getValidOperators(c.field);
      return !validOperators.includes(c.operator);
    });
    if (hasInvalidOperators) {
      console.log('Validation failed: invalid operators');
      Alert.alert('Error', 'Please select valid operators for each field');
      return;
    }

    // Validate actions
    const actionsNeedingValue = actions.filter((a) => a.type === 'label' || a.type === 'tag');
    const hasEmptyActions = actionsNeedingValue.some((a) => !a.value || !a.value.trim());
    if (hasEmptyActions) {
      console.log('Validation failed: empty actions');
      Alert.alert('Error', 'Please fill in all action values');
      return;
    }

    console.log('Validation passed, showing success toast');
    
    // Prepare updated rule data
    const updatedRule: Rule = {
      id: ruleToEdit?.id || Date.now().toString(),
      name: ruleName.trim(),
      enabled: ruleToEdit?.enabled ?? true,
      conditions,
      actions,
      createdAt: ruleToEdit?.createdAt || new Date(),
      lastRun: ruleToEdit?.lastRun,
      matchCount: ruleToEdit?.matchCount || 0,
    };
    
    // Show success toast
    setToast({
      message: `Rule "${ruleName}" ${isEditMode ? 'updated' : 'created'} successfully!`,
    });

    // Navigate to rules page with updated rule data after a short delay
    setTimeout(() => {
      router.push({
        pathname: '/rules',
        params: {
          updatedRule: JSON.stringify(updatedRule),
          isEdit: isEditMode ? 'true' : 'false',
        },
      });
    }, 1500);
  };

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  return (
    <>
      <Stack.Screen
        options={{
          title: isEditMode ? 'Edit Rule' : 'Create New Rule',
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
                        {OPERATORS.filter((op) => getValidOperators(condition.field).includes(op.value)).map((operator) => (
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

                {(condition.operator !== 'isTrue' && condition.operator !== 'isFalse') && (
                  <View style={styles.valueRow}>
                    <Text style={[styles.pickerLabel, { color: colors.textSecondary }]}>Value</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                      placeholder={
                        condition.field === 'age'
                          ? 'Number of days (e.g., 30)'
                          : condition.field === 'size'
                          ? 'Size in bytes (e.g., 1048576)'
                          : condition.field === 'date'
                          ? 'Date (e.g., 2024-01-15)'
                          : condition.field === 'semantic'
                          ? 'Keywords or phrase'
                          : condition.field === 'subject' || condition.field === 'body'
                          ? 'Text to search for'
                          : 'Text to match'
                      }
                      placeholderTextColor={colors.textSecondary}
                      value={String(condition.value || '')}
                      onChangeText={(text) => {
                        let value: string | number = text;
                        if (condition.field === 'age' || condition.field === 'size') {
                          value = Number(text) || 0;
                        }
                        updateCondition(index, 'value', value);
                      }}
                      keyboardType={condition.field === 'age' || condition.field === 'size' ? 'numeric' : 'default'}
                    />
                  </View>
                )}

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
          <TouchableOpacity 
            style={[styles.saveButton, { backgroundColor: colors.primary }]} 
            onPress={() => {
              console.log('Save button pressed!');
              handleSave();
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.saveButtonText}>{isEditMode ? 'Save Changes' : 'Create Rule'}</Text>
          </TouchableOpacity>
        </View>

        {toast && (
          <View
            style={{
              position: 'absolute',
              left: 16,
              right: 16,
              bottom: insets.bottom + 16,
              backgroundColor: colors.surface,
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 14,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              borderWidth: 1,
              borderColor: colors.success + '55',
              shadowColor: colors.success,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 10,
              elevation: 4,
            }}
          >
            <View
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: colors.success + '22',
                borderWidth: 1,
                borderColor: colors.success + '55',
              }}
            >
              <Check size={18} color={colors.success} strokeWidth={3} />
            </View>
            <Text style={{ color: colors.text, flex: 1, fontSize: 14 }}>{toast.message}</Text>
          </View>
        )}
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