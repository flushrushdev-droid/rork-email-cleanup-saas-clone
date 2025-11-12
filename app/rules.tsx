import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { Plus, Zap, Clock, Mail, Tag, Archive, Trash2, ChevronRight, Play } from 'lucide-react-native';

import { Rule } from '@/constants/types';
import { useTheme } from '@/contexts/ThemeContext';

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
  const [rules, setRules] = useState(mockRules);

  const toggleRule = (ruleId: string) => {
    setRules((prev) =>
      prev.map((rule) =>
        rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
      )
    );
  };

  const getConditionText = (rule: Rule): string => {
    const conditionStrings = rule.conditions.map((cond) => {
      const field = (cond.field as string).replace(/([A-Z])/g, ' $1').toLowerCase();
      return `${field} ${(cond.operator as string).replace(/([A-Z])/g, ' $1').toLowerCase()} "${String(cond.value)}"`;
    });
    return conditionStrings.join(' AND ');
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'label':
        return <Tag size={16} color={colors.primary} />;
      case 'archive':
        return <Archive size={16} color={colors.warning} />;
      case 'delete':
        return <Trash2 size={16} color={colors.danger} />;
      default:
        return <Mail size={16} color={colors.text} />;
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Automation Rules',
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
        }}
      />
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Automation Rules</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Create smart email workflows</Text>
        </View>

        <TouchableOpacity testID="create-rule" style={[styles.createButton, { backgroundColor: colors.surface, borderColor: colors.primary }]} onPress={() => router.push('/create-rule')}>
          <Plus size={20} color={colors.primary} />
          <Text style={[styles.createButtonText, { color: colors.primary }]}>Create New Rule</Text>
        </TouchableOpacity>

        <View style={styles.statsBar}>
          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <Zap size={20} color={colors.success} />
            <View style={styles.statContent}>
              <Text style={[styles.statValue, { color: colors.text }]}>{rules.filter(r => r.enabled).length}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Active</Text>
            </View>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <Clock size={20} color={colors.info} />
            <View style={styles.statContent}>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {rules.reduce((sum, r) => sum + (r.matchCount ?? 0), 0)}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Matches</Text>
            </View>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.templateSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Templates</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.templatesScroll}>
              <TouchableOpacity testID="tpl-archive" style={styles.templateCard} onPress={() => alert('Template: Archive Old created')}>
                <View style={[styles.templateIcon, { backgroundColor: colors.warning + '20' }]}>
                  <Archive size={24} color={colors.warning} />
                </View>
                <Text style={[styles.templateName, { color: colors.text }]}>Archive Old</Text>
              </TouchableOpacity>
              <TouchableOpacity testID="tpl-label" style={styles.templateCard} onPress={() => alert('Template: Auto-Label created')}>
                <View style={[styles.templateIcon, { backgroundColor: colors.primary + '20' }]}>
                  <Tag size={24} color={colors.primary} />
                </View>
                <Text style={[styles.templateName, { color: colors.text }]}>Auto-Label</Text>
              </TouchableOpacity>
              <TouchableOpacity testID="tpl-delete" style={styles.templateCard} onPress={() => alert('Template: Delete Spam created')}>
                <View style={[styles.templateIcon, { backgroundColor: colors.danger + '20' }]}>
                  <Trash2 size={24} color={colors.danger} />
                </View>
                <Text style={[styles.templateName, { color: colors.text }]}>Delete Spam</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Rules ({rules.length})</Text>
            {rules.map((rule) => (
              <View key={rule.id} style={[styles.ruleCard, { backgroundColor: colors.surface }, !rule.enabled && styles.ruleCardDisabled]}>
                <View style={styles.ruleHeader}>
                  <View style={styles.ruleInfo}>
                    <Text style={[styles.ruleName, { color: colors.text }, !rule.enabled && { color: colors.textSecondary }]}>
                      {rule.name}
                    </Text>
                    {rule.lastRun && (
                      <Text style={[styles.ruleLastRun, { color: colors.textSecondary }]}>
                        Last run: {new Date(rule.lastRun).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Text>
                    )}
                  </View>
                  <Switch
                    value={rule.enabled}
                    onValueChange={() => toggleRule(rule.id)}
                    trackColor={{ false: colors.border, true: colors.primary }}
                  />
                </View>

                <View style={[styles.ruleConditions, { backgroundColor: colors.background }]}>
                  <Text style={[styles.conditionLabel, { color: colors.textSecondary }]}>When:</Text>
                  <Text style={[styles.conditionText, { color: colors.text }]} numberOfLines={2}>
                    {getConditionText(rule)}
                  </Text>
                </View>

                <View style={styles.ruleActions}>
                  <Text style={[styles.actionLabel, { color: colors.textSecondary }]}>Then:</Text>
                  <View style={styles.actionBadges}>
                    {rule.actions.map((action, index) => (
                      <View key={index} style={[styles.actionBadge, { backgroundColor: colors.primary + '15' }]}>
                        {getActionIcon(action.type)}
                        <Text style={[styles.actionBadgeText, { color: colors.primary }]}>
                          {action.type}
                          {action.value && `: ${action.value}`}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>

                <View style={[styles.ruleFooter, { borderColor: colors.border }]}>
                  <View style={[styles.matchBadge, { backgroundColor: colors.success + '15' }]}>
                    <Text style={[styles.matchCount, { color: colors.success }]}>{rule.matchCount} matches</Text>
                  </View>
                  <View style={styles.ruleButtons}>
                    <TouchableOpacity testID={`test-${rule.id}`} style={[styles.testButton, { backgroundColor: colors.primary + '15' }]} onPress={() => alert(`Tested rule: ${rule.name}`)}>
                      <Play size={16} color={colors.primary} />
                      <Text style={[styles.testButtonText, { color: colors.primary }]}>Test</Text>
                    </TouchableOpacity>
                    <TouchableOpacity testID={`edit-${rule.id}`} style={[styles.editButton, { backgroundColor: colors.background }]} onPress={() => alert(`Edit rule: ${rule.name}`)}>
                      <ChevronRight size={16} color={colors.text} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>

          <View style={[styles.builderPromo, { backgroundColor: colors.surface }]}>
            <View style={[styles.builderIcon, { backgroundColor: colors.primary + '15' }]}>
              <Zap size={32} color={colors.primary} />
            </View>
            <Text style={[styles.builderTitle, { color: colors.text }]}>Visual Rule Builder</Text>
            <Text style={[styles.builderDescription, { color: colors.textSecondary }]}>
              Create complex rules with drag-and-drop conditions and actions. No coding required!
            </Text>
            <TouchableOpacity testID="try-builder" style={[styles.builderButton, { backgroundColor: colors.primary }]} onPress={() => alert('Visual Rule Builder coming soon')}>
              <Text style={styles.builderButtonText}>Try Rule Builder</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  statsBar: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  templateSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  templatesScroll: {
    marginLeft: -16,
    paddingLeft: 16,
  },
  templateCard: {
    alignItems: 'center',
    marginRight: 12,
    width: 100,
  },
  templateIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  templateName: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  ruleCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  ruleCardDisabled: {
    opacity: 0.6,
  },
  ruleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  ruleInfo: {
    flex: 1,
    paddingRight: 12,
  },
  ruleName: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  ruleNameDisabled: {
  },
  ruleLastRun: {
    fontSize: 12,
  },
  ruleConditions: {
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  conditionLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  conditionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  ruleActions: {
    marginBottom: 12,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  actionBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  actionBadgeText: {
    fontSize: 13,
    fontWeight: '500',
  },
  ruleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
  },
  matchBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  matchCount: {
    fontSize: 12,
    fontWeight: '600',
  },
  ruleButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  testButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  builderPromo: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  builderIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  builderTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  builderDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  builderButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  builderButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
