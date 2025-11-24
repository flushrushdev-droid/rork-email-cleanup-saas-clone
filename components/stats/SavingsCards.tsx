import React from 'react';
import { View, Text } from 'react-native';
import { Clock, HardDrive } from 'lucide-react-native';
import { createOverviewStyles } from '@/styles/app/index';
import { formatAccessibilityLabel } from '@/utils/accessibility';

interface SavingsCardsProps {
  health: {
    projectedTimeSaved: number;
    projectedSpaceSaved: number;
  };
  colors: any;
}

export function SavingsCards({ health, colors }: SavingsCardsProps) {
  const styles = React.useMemo(() => createOverviewStyles(colors), [colors]);

  return (
    <View style={styles.savingsContainer}>
      <View 
        style={[styles.savingCard, { backgroundColor: colors.surface }]}
        accessible={true}
        accessibilityRole="text"
        accessibilityLabel={formatAccessibilityLabel('Time saved monthly: {minutes} minutes', {
          minutes: health.projectedTimeSaved.toString(),
        })}
      >
        <View style={[styles.savingIconContainer, { backgroundColor: colors.primary + '20' }]}>
          <Clock size={24} color={colors.primary} />
        </View>
        <View style={styles.savingContent}>
          <Text style={[styles.savingValue, { color: colors.text }]}>{health.projectedTimeSaved} min</Text>
          <Text style={[styles.savingLabel, { color: colors.textSecondary }]}>Time Saved Monthly</Text>
        </View>
      </View>
      <View 
        style={[styles.savingCard, { backgroundColor: colors.surface }]}
        accessible={true}
        accessibilityRole="text"
        accessibilityLabel={formatAccessibilityLabel('Space saved: {megabytes} megabytes', {
          megabytes: health.projectedSpaceSaved.toString(),
        })}
      >
        <View style={[styles.savingIconContainer, { backgroundColor: colors.secondary + '20' }]}>
          <HardDrive size={24} color={colors.secondary} />
        </View>
        <View style={styles.savingContent}>
          <Text style={[styles.savingValue, { color: colors.text }]}>{health.projectedSpaceSaved} MB</Text>
          <Text style={[styles.savingLabel, { color: colors.textSecondary }]}>Space Saved</Text>
        </View>
      </View>
    </View>
  );
}


