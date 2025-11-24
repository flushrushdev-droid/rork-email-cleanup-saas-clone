import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import type {
  RuleCondition,
  RuleAction,
  RuleConditionField,
  RuleConditionOperator,
  RuleActionType,
  Rule,
} from '@/constants/types';

type DropdownState = {
  visible: boolean;
  type: 'field' | 'operator' | 'action' | null;
  index: number;
};

interface UseRuleFormProps {
  ruleToEdit?: Rule | null;
  isEditMode: boolean;
  getValidOperators: (field: RuleConditionField) => RuleConditionOperator[];
}

interface UseRuleFormReturn {
  ruleName: string;
  setRuleName: (name: string) => void;
  conditions: RuleCondition[];
  actions: RuleAction[];
  dropdown: DropdownState;
  toast: { message: string } | null;
  addCondition: () => void;
  removeCondition: (index: number) => void;
  updateCondition: (index: number, field: keyof RuleCondition, value: string | number) => void;
  addAction: () => void;
  removeAction: (index: number) => void;
  updateAction: (index: number, field: keyof RuleAction, value: string) => void;
  openDropdown: (type: 'field' | 'operator' | 'action', index: number) => void;
  closeDropdown: () => void;
  selectDropdownOption: (value: RuleConditionField | RuleConditionOperator | RuleActionType) => void;
  handleSave: () => void;
}

export function useRuleForm({
  ruleToEdit,
  isEditMode,
  getValidOperators,
}: UseRuleFormProps): UseRuleFormReturn {
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
  }, [ruleToEdit, getValidOperators]);

  const addCondition = useCallback(() => {
    setConditions([...conditions, { field: 'sender', operator: 'contains', value: '' }]);
  }, [conditions]);

  const removeCondition = useCallback(
    (index: number) => {
      if (conditions.length > 1) {
        setConditions(conditions.filter((_, i) => i !== index));
      }
    },
    [conditions]
  );

  const updateCondition = useCallback(
    (index: number, field: keyof RuleCondition, value: string | number) => {
      const updated = [...conditions];
      updated[index] = { ...updated[index], [field]: value };
      setConditions(updated);
    },
    [conditions]
  );

  const addAction = useCallback(() => {
    setActions([...actions, { type: 'archive' }]);
  }, [actions]);

  const removeAction = useCallback(
    (index: number) => {
      if (actions.length > 1) {
        setActions(actions.filter((_, i) => i !== index));
      }
    },
    [actions]
  );

  const updateAction = useCallback(
    (index: number, field: keyof RuleAction, value: string) => {
      const updated = [...actions];
      updated[index] = { ...updated[index], [field]: value };
      setActions(updated);
    },
    [actions]
  );

  const openDropdown = useCallback((type: 'field' | 'operator' | 'action', index: number) => {
    setDropdown((prev) => {
      if (prev.visible && prev.type === type && prev.index === index) {
        return { visible: false, type: null, index: -1 };
      } else {
        return { visible: true, type, index };
      }
    });
  }, []);

  const closeDropdown = useCallback(() => {
    setDropdown({ visible: false, type: null, index: -1 });
  }, []);

  const selectDropdownOption = useCallback(
    (value: RuleConditionField | RuleConditionOperator | RuleActionType) => {
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
    },
    [dropdown, conditions, getValidOperators, updateCondition, updateAction, closeDropdown]
  );

  const handleSave = useCallback(() => {
    // Validate rule name
    if (!ruleName.trim()) {
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
      Alert.alert('Error', 'Please fill in all condition values');
      return;
    }

    // Validate operators are valid for their fields
    const hasInvalidOperators = conditions.some((c) => {
      const validOperators = getValidOperators(c.field);
      return !validOperators.includes(c.operator);
    });
    if (hasInvalidOperators) {
      Alert.alert('Error', 'Please select valid operators for each field');
      return;
    }

    // Validate actions
    const actionsNeedingValue = actions.filter((a) => a.type === 'label' || a.type === 'tag');
    const hasEmptyActions = actionsNeedingValue.some((a) => !a.value || !a.value.trim());
    if (hasEmptyActions) {
      Alert.alert('Error', 'Please fill in all action values');
      return;
    }

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
  }, [ruleName, conditions, actions, ruleToEdit, isEditMode, getValidOperators]);

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  return {
    ruleName,
    setRuleName,
    conditions,
    actions,
    dropdown,
    toast,
    addCondition,
    removeCondition,
    updateCondition,
    addAction,
    removeAction,
    updateAction,
    openDropdown,
    closeDropdown,
    selectDropdownOption,
    handleSave,
  };
}


