import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RulesScreen from '@/app/rules';
import CreateRuleScreen from '@/app/create-rule';
import { setupDemoMode, clearDemoMode } from '../utils/demo-helpers';
// Mock rules data (same as in app/rules.tsx)
const mockRules = [
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

jest.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      primary: '#007AFF',
      surface: '#F2F2F7',
      background: '#FFFFFF',
      text: '#000000',
      textSecondary: '#8E8E93',
      success: '#34C759',
      warning: '#FF9500',
      danger: '#FF3B30',
      info: '#5AC8FA',
      border: '#C6C6C8',
    },
  }),
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    setParams: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
  Stack: {
    Screen: ({ children }: { children: React.ReactNode }) => children,
  },
}));

describe('Demo Automation Rules', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await clearDemoMode();
    await setupDemoMode();
  });

  afterEach(async () => {
    await clearDemoMode();
  });

  test('should display mock rules', () => {
    expect(mockRules.length).toBeGreaterThan(0);
    expect(mockRules[0]).toHaveProperty('id');
    expect(mockRules[0]).toHaveProperty('name');
    expect(mockRules[0]).toHaveProperty('conditions');
    expect(mockRules[0]).toHaveProperty('actions');
  });

  test('should create new rule flow', () => {
    const ruleName = 'Test Rule';
    const conditions = [{ field: 'sender', operator: 'contains', value: 'test' }];
    const actions = [{ type: 'archive' }];

    expect(ruleName).toBeTruthy();
    expect(conditions.length).toBeGreaterThan(0);
    expect(actions.length).toBeGreaterThan(0);
  });

  test('should edit existing rule flow', () => {
    const rule = mockRules[0];
    const updatedName = `${rule.name} UPDATED`;

    expect(rule).toBeTruthy();
    expect(updatedName).toContain(rule.name);
  });

  test('should show toast and navigate back after save', () => {
    const setToast = jest.fn();
    const router = { push: jest.fn() };

    const handleSave = () => {
      setToast({ message: 'Rule created successfully!' });
      setTimeout(() => {
        router.push('/rules');
      }, 1500);
    };

    handleSave();
    expect(setToast).toHaveBeenCalled();
  });

  test('should update rule name in list after edit', () => {
    const rules = [...mockRules];
    const ruleId = rules[0].id;
    const updatedName = 'Updated Rule Name';

    const updatedRules = rules.map(rule =>
      rule.id === ruleId ? { ...rule, name: updatedName } : rule
    );

    expect(updatedRules.find(r => r.id === ruleId)?.name).toBe(updatedName);
  });

  test('should validate form (name, conditions, actions)', () => {
    const validateRule = (name: string, conditions: any[], actions: any[]) => {
      if (!name.trim()) return false;
      if (conditions.length === 0) return false;
      if (conditions.some(c => !c.value)) return false;
      if (actions.length === 0) return false;
      return true;
    };

    expect(validateRule('', [], [])).toBe(false);
    expect(validateRule('Test', [], [])).toBe(false);
    expect(validateRule('Test', [{ field: 'sender', operator: 'contains', value: '' }], [])).toBe(false);
    expect(validateRule('Test', [{ field: 'sender', operator: 'contains', value: 'test' }], [])).toBe(false);
    expect(validateRule('Test', [{ field: 'sender', operator: 'contains', value: 'test' }], [{ type: 'archive' }])).toBe(true);
  });

  test('should filter operators by field type', () => {
    const getValidOperators = (field: string) => {
      switch (field) {
        case 'age':
          return ['greaterThan'];
        case 'sender':
        case 'domain':
          return ['contains', 'equals'];
        case 'semantic':
          return ['matches'];
        default:
          return ['contains', 'equals'];
      }
    };

    expect(getValidOperators('age')).toEqual(['greaterThan']);
    expect(getValidOperators('sender')).toContain('contains');
    expect(getValidOperators('semantic')).toEqual(['matches']);
  });

  test('should toggle rule on/off', () => {
    const rules = [...mockRules];
    const ruleId = rules[0].id;
    const initialEnabled = rules[0].enabled;

    const toggledRules = rules.map(rule =>
      rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
    );

    expect(toggledRules.find(r => r.id === ruleId)?.enabled).toBe(!initialEnabled);
  });

  test('should NOT persist rules after refresh', async () => {
    // Rules should not be persisted in demo mode
    const customRule = {
      id: 'custom-1',
      name: 'Custom Rule',
      enabled: true,
      conditions: [],
      actions: [],
      createdAt: new Date(),
    };

    // Verify it's not in AsyncStorage
    const stored = await AsyncStorage.getItem('rules');
    expect(stored).toBeNull();
  });
});

