import React, { useCallback } from 'react';
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
import { useSupabaseRules } from '@/hooks/useSupabaseRules';

const rulesLogger = createScopedLogger('Rules');

export default function RulesScreen() {
  const { colors } = useTheme();
  const { rules, isLoading, error, toggleRule, refresh } = useSupabaseRules();
  const styles = React.useMemo(() => createRulesStyles(colors), [colors]);
  const { showInfo, showError } = useEnhancedToast();

  // Refresh rules when screen comes into focus (in case they were updated elsewhere)
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  // Handle toggle with error handling
  const handleToggle = useCallback(async (ruleId: string) => {
    try {
      const rule = rules.find((r) => r.id === ruleId);
      if (rule) {
        await toggleRule(ruleId, !rule.enabled);
      }
    } catch (err) {
      showError('Failed to update rule');
      rulesLogger.error('Error toggling rule', err);
    }
  }, [rules, toggleRule, showError]);

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
          {isLoading ? (
            <View style={styles.section}>
              <AppText style={[styles.sectionTitle, { color: colors.text }]} dynamicTypeStyle="body">
                Loading rules...
              </AppText>
            </View>
          ) : error ? (
            <View style={styles.section}>
              <AppText style={[styles.sectionTitle, { color: colors.error }]} dynamicTypeStyle="body">
                Error loading rules: {error.message}
              </AppText>
            </View>
          ) : rules.length === 0 ? (
            <View style={styles.section}>
              <AppText style={[styles.sectionTitle, { color: colors.textSecondary }]} dynamicTypeStyle="body">
                No rules yet. Create your first rule to get started!
              </AppText>
            </View>
          ) : (
            <>
              {enabledRules.length > 0 && (
                <View style={styles.section}>
                  <AppText style={[styles.sectionTitle, { color: colors.text }]} dynamicTypeStyle="headline">Active Rules ({enabledRules.length})</AppText>
                  {enabledRules.map((rule) => (
                    <RuleCard
                      key={rule.id}
                      rule={rule}
                      onToggle={handleToggle}
                      showActions={true}
                      colors={colors}
                    />
                  ))}
                </View>
              )}

              {disabledRules.length > 0 && (
                <View style={styles.section}>
                  <AppText style={[styles.sectionTitle, { color: colors.text }]} dynamicTypeStyle="headline">Disabled Rules ({disabledRules.length})</AppText>
                  {disabledRules.map((rule) => (
                    <RuleCard
                      key={rule.id}
                      rule={rule}
                      onToggle={handleToggle}
                      showActions={true}
                      colors={colors}
                    />
                  ))}
                </View>
              )}
            </>
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
