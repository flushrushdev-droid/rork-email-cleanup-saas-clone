import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { createStatDetailsStyles } from '@/styles/app/stat-details';

interface AutomationCoverageViewProps {
  onCreateRule: () => void;
  colors: any;
}

export function AutomationCoverageView({ onCreateRule, colors }: AutomationCoverageViewProps) {
  const styles = React.useMemo(() => createStatDetailsStyles(colors), [colors]);

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Automation Coverage</Text>
      <View style={[styles.infoBox, { backgroundColor: colors.primary + '20', borderLeftColor: colors.primary }]}>
        <Text style={[styles.infoText, { color: colors.text }]}>
          56% of your emails are automatically organized by rules and filters. This helps keep your inbox clean and
          organized.
        </Text>
      </View>

      <View style={[styles.automationCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.automationTitle, { color: colors.text }]}>Active Automations</Text>
        <View style={styles.automationItem}>
          <View style={[styles.automationDot, { backgroundColor: colors.success }]} />
          <View style={styles.automationInfo}>
            <Text style={[styles.automationName, { color: colors.text }]}>Auto-archive promotions</Text>
            <Text style={[styles.automationDesc, { color: colors.textSecondary }]}>Moved 847 emails last month</Text>
          </View>
        </View>
        <View style={styles.automationItem}>
          <View style={[styles.automationDot, { backgroundColor: colors.success }]} />
          <View style={styles.automationInfo}>
            <Text style={[styles.automationName, { color: colors.text }]}>Label receipts</Text>
            <Text style={[styles.automationDesc, { color: colors.textSecondary }]}>Organized 203 emails</Text>
          </View>
        </View>
        <View style={styles.automationItem}>
          <View style={[styles.automationDot, { backgroundColor: colors.success }]} />
          <View style={styles.automationInfo}>
            <Text style={[styles.automationName, { color: colors.text }]}>Mark newsletters as read</Text>
            <Text style={[styles.automationDesc, { color: colors.textSecondary }]}>Processed 634 emails</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        testID="create-rule-button"
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Create New Rule"
        accessibilityHint="Double tap to create a new automation rule"
        style={[styles.createRuleButton, { backgroundColor: colors.primary }]}
        onPress={onCreateRule}
      >
        <Text style={[styles.createRuleText, { color: colors.surface }]}>Create New Rule</Text>
      </TouchableOpacity>
    </View>
  );
}

