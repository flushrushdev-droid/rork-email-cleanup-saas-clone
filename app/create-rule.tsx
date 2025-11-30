import React from 'react';
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Plus, Check } from 'lucide-react-native';

import { useTheme } from '@/contexts/ThemeContext';
import {
  RuleConditionField,
  RuleConditionOperator,
  Rule,
} from '@/constants/types';
import { useRuleForm } from '@/hooks/useRuleForm';
import { useSupabaseRules } from '@/hooks/useSupabaseRules';
import { RuleConditionCard } from '@/components/rules/RuleConditionCard';
import { RuleActionCard } from '@/components/rules/RuleActionCard';
import { createRuleFormStyles } from '@/styles/app/rules';

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

export default function CreateRuleScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ ruleId?: string }>();
  const isEditMode = !!params.ruleId;
  const { rules, createRule, updateRule } = useSupabaseRules();
  const ruleToEdit = params.ruleId ? rules.find(r => r.id === params.ruleId) : null;

  const ruleForm = useRuleForm({
    ruleToEdit: ruleToEdit || null,
    isEditMode,
    getValidOperators,
    onCreateRule: createRule,
    onUpdateRule: updateRule,
  });

  const styles = React.useMemo(() => createRuleFormStyles(colors), [colors]);

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
              value={ruleForm.ruleName}
              onChangeText={ruleForm.setRuleName}
            />
          </View>

          <View style={[styles.section, { zIndex: ruleForm.dropdown.visible && ruleForm.dropdown.type !== 'action' ? 1000 : 1 }]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Conditions (When)</Text>
              <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>All conditions must be met</Text>
            </View>

            {ruleForm.conditions.map((condition, index) => (
              <RuleConditionCard
                key={index}
                condition={condition}
                index={index}
                onUpdate={ruleForm.updateCondition}
                onRemove={ruleForm.removeCondition}
                canRemove={ruleForm.conditions.length > 1}
                dropdown={ruleForm.dropdown}
                onOpenDropdown={ruleForm.openDropdown}
                onSelectOption={ruleForm.selectDropdownOption}
                getValidOperators={getValidOperators}
                colors={colors}
              />
            ))}

            <TouchableOpacity style={[styles.addButton, { zIndex: -1, backgroundColor: colors.surface, borderColor: colors.primary }]} onPress={ruleForm.addCondition}>
              <Plus size={18} color={colors.primary} />
              <Text style={[styles.addButtonText, { color: colors.primary }]}>Add Condition</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.section, { zIndex: ruleForm.dropdown.visible && ruleForm.dropdown.type === 'action' ? 1000 : 1 }]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Actions (Then)</Text>
              <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>What to do when conditions match</Text>
            </View>

            {ruleForm.actions.map((action, index) => (
              <RuleActionCard
                key={index}
                action={action}
                index={index}
                onUpdate={ruleForm.updateAction}
                onRemove={ruleForm.removeAction}
                canRemove={ruleForm.actions.length > 1}
                dropdown={ruleForm.dropdown}
                onOpenDropdown={ruleForm.openDropdown}
                onSelectOption={ruleForm.selectDropdownOption}
                colors={colors}
              />
            ))}

            <TouchableOpacity style={[styles.addButton, { zIndex: -1, backgroundColor: colors.surface, borderColor: colors.primary }]} onPress={ruleForm.addAction}>
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
            onPress={ruleForm.handleSave}
            activeOpacity={0.8}
          >
            <Text style={styles.saveButtonText}>{isEditMode ? 'Save Changes' : 'Create Rule'}</Text>
          </TouchableOpacity>
        </View>

        {ruleForm.toast && (
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
            <Text style={{ color: colors.text, flex: 1, fontSize: 14 }}>{ruleForm.toast.message}</Text>
          </View>
        )}
      </SafeAreaView>
    </>
  );
}
