import React, { useState, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Plus, Zap, Mail } from 'lucide-react-native';

import { Rule } from '@/constants/types';
import { useTheme } from '@/contexts/ThemeContext';
import { createRulesStyles } from '@/styles/app/rules';
import { StatCard } from '@/components/common/StatCard';
import { RuleCard } from '@/components/rules/RuleCard';
import { createScopedLogger } from '@/utils/logger';
import { useEnhancedToast } from '@/hooks/useEnhancedToast';

const rulesLogger = createScopedLogger('Rules');

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

export default function RulesScreen() {
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ updatedRule?: string; isEdit?: string }>();
  const [rules, setRules] = useState(mockRules);
  const styles = React.useMemo(() => createRulesStyles(colors), [colors]);
  const { showInfo } = useEnhancedToast();

  // Update rules when returning from create-rule screen
  useFocusEffect(
    useCallback(() => {
      if (params.updatedRule) {
        try {
          const ruleData = JSON.parse(params.updatedRule);
          const isEdit = params.isEdit === 'true';
          
          // Convert date strings back to Date objects
          const updatedRule: Rule = {
            ...ruleData,
            createdAt: new Date(ruleData.createdAt),
            lastRun: ruleData.lastRun ? new Date(ruleData.lastRun) : undefined,
          };
          
          setRules((prev) => {
            if (isEdit) {
              // Update existing rule
              return prev.map((rule) =>
                rule.id === updatedRule.id ? updatedRule : rule
              );
            } else {
              // Add new rule
              return [updatedRule, ...prev];
            }
          });
          
          // Clear params to prevent re-applying on next focus
          router.setParams({ updatedRule: undefined, isEdit: undefined });
        } catch (error) {
          rulesLogger.error('Error parsing updated rule', error);
        }
      }
    }, [params.updatedRule, params.isEdit])
  );

  const toggleRule = (ruleId: string) => {
    setRules((prev) =>
      prev.map((rule) =>
        rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
      )
    );
  };

  const enabledRules = rules.filter((rule) => rule.enabled);
  const disabledRules = rules.filter((rule) => !rule.enabled);

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Automation Rules',
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
          headerShadowVisible: false,
        }}
      />
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
        <View style={[styles.header, { paddingTop: 0 }]}>
          <AppText style={[styles.title, { color: colors.text }]} dynamicTypeStyle="title1">Automation Rules</AppText>
          <AppText style={[styles.subtitle, { color: colors.textSecondary }]} dynamicTypeStyle="body">
            Automatically organize and manage your emails
          </AppText>
        </View>

        <TouchableOpacity
          style={[
            styles.createButton,
            { backgroundColor: colors.surface, borderColor: colors.primary },
          ]}
          onPress={() => router.push('/create-rule')}
        >
          <Plus size={20} color={colors.primary} />
          <AppText style={[styles.createButtonText, { color: colors.primary }]} dynamicTypeStyle="headline">Create New Rule</AppText>
        </TouchableOpacity>

        <View style={styles.statsBar}>
          <StatCard
            label="Active Rules"
            value={enabledRules.length.toString()}
            icon={Zap}
            iconColor={colors.success}
            style={{ flex: 1 }}
          />
          <StatCard
            label="Total Matches"
            value={rules.reduce((sum, rule) => sum + (rule.matchCount || 0), 0).toString()}
            icon={Mail}
            iconColor={colors.info}
            style={{ flex: 1 }}
          />
        </View>

        <ScrollView
          style={styles.scrollContent}
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {enabledRules.length > 0 && (
            <View style={styles.section}>
              <AppText style={[styles.sectionTitle, { color: colors.text }]} dynamicTypeStyle="headline">Active Rules ({enabledRules.length})</AppText>
              {enabledRules.map((rule) => (
                <RuleCard
                  key={rule.id}
                  rule={rule}
                  onToggle={toggleRule}
                  showActions={true}
                  colors={colors}
                />
              ))}
            </View>
          )}

          {disabledRules.length > 0 && (
            <View style={styles.section}>
              <AppText style={[styles.sectionTitle, { color: colors.text }]} dynamicTypeStyle="headline">Your Rules ({rules.length})</AppText>
              {rules.map((rule) => (
                <RuleCard
                  key={rule.id}
                  rule={rule}
                  onToggle={toggleRule}
                  showActions={false}
                  colors={colors}
                />
              ))}
            </View>
          )}

          <View style={[styles.builderPromo, { backgroundColor: colors.primary + '10' }]}>
            <View style={[styles.builderIcon, { backgroundColor: colors.primary + '20' }]}>
              <Zap size={32} color={colors.primary} />
            </View>
            <AppText style={[styles.builderTitle, { color: colors.text }]} dynamicTypeStyle="headline">Rule Builder</AppText>
            <AppText style={[styles.builderDescription, { color: colors.textSecondary }]} dynamicTypeStyle="body">
              Create complex automation rules with our visual rule builder
            </AppText>
            <TouchableOpacity
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Try Rule Builder"
              accessibilityHint="Double tap to try the visual rule builder feature"
              style={[styles.builderButton, { backgroundColor: colors.primary }]}
              onPress={() => showInfo('Rule Builder feature coming soon!', { duration: 2000 })}
            >
              <AppText style={styles.builderButtonText} dynamicTypeStyle="headline">Try Rule Builder</AppText>
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
