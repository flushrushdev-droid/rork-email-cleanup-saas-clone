import React from 'react';
import { View, Text, TouchableOpacity, Switch } from 'react-native';
import { Archive, Tag, Trash2, Play, Settings } from 'lucide-react-native';
import { router } from 'expo-router';
import { Rule } from '@/constants/types';
import { createRulesStyles } from '@/styles/app/rules';
import { useEnhancedToast } from '@/hooks/useEnhancedToast';

interface RuleCardProps {
  rule: Rule;
  onToggle: (ruleId: string) => void;
  showActions?: boolean;
  colors: any;
}

export function RuleCard({ rule, onToggle, showActions = true, colors }: RuleCardProps) {
  const styles = createRulesStyles(colors);
  const { showInfo } = useEnhancedToast();

  const getConditionText = (rule: Rule): string => {
    return rule.conditions
      .map((cond) => {
        if (cond.field === 'sender') {
          return `From contains "${cond.value}"`;
        } else if (cond.field === 'age') {
          return `Older than ${cond.value} days`;
        } else if (cond.field === 'semantic') {
          return `Contains: "${cond.value}"`;
        } else if (cond.field === 'domain') {
          return `Domain is "${cond.value}"`;
        }
        return `${cond.field} ${cond.operator} ${cond.value}`;
      })
      .join(' AND ');
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'archive':
        return <Archive size={14} color={colors.primary} />;
      case 'label':
        return <Tag size={14} color={colors.primary} />;
      case 'delete':
        return <Trash2 size={14} color={colors.danger} />;
      case 'tag':
        return <Tag size={14} color={colors.primary} />;
      default:
        return null;
    }
  };

  const handleTest = () => {
    showInfo(`Testing rule: ${rule.name}`, { duration: 2000 });
  };

  const handleEdit = () => {
    router.push({
      pathname: '/create-rule',
      params: {
        rule: JSON.stringify(rule),
        isEdit: 'true',
      },
    });
  };

  return (
    <View 
      style={[
        styles.ruleCard, 
        { backgroundColor: colors.surface }, 
        !rule.enabled && styles.ruleCardDisabled
      ]}
    >
      <View style={styles.ruleHeader}>
        <View style={styles.ruleInfo}>
          <Text 
            style={[
              styles.ruleName, 
              { color: colors.text }, 
              !rule.enabled && { color: colors.textSecondary }
            ]}
          >
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
          onValueChange={() => onToggle(rule.id)}
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

      {showActions && rule.enabled && (
        <View style={[styles.ruleFooter, { borderColor: colors.border }]}>
          <View style={[styles.matchBadge, { backgroundColor: colors.background }]}>
            <Text style={[styles.matchCount, { color: colors.textSecondary }]}>
              {rule.matchCount} matches
            </Text>
          </View>
          <View style={styles.ruleButtons}>
            <TouchableOpacity
              style={[styles.testButton, { backgroundColor: colors.background }]}
              onPress={handleTest}
            >
              <Play size={14} color={colors.primary} />
              <Text style={[styles.testButtonText, { color: colors.primary }]}>Test</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.editButton, { backgroundColor: colors.background }]}
              onPress={handleEdit}
            >
              <Settings size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

