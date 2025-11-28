/**
 * Noise Sender Item Component
 * 
 * Displays a single noise sender item in the stat details list.
 */

import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { AppText } from '@/components/common/AppText';
import type { Sender } from '@/constants/types';
import type { ThemeColors } from '@/constants/colors';

export interface NoiseSenderItemProps {
  sender: Sender;
  onPress: (email: string) => void;
  colors: ThemeColors;
}

function createStyles() {
  return StyleSheet.create({
    senderCard: {
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 1,
    },
    senderInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      flex: 1,
    },
    senderAvatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
    },
    senderInitial: {
      fontSize: 18,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    senderDetails: {
      flex: 1,
    },
    senderName: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 2,
    },
    senderEmail: {
      fontSize: 13,
      marginBottom: 4,
    },
    senderStats: {
      fontSize: 12,
    },
    noiseBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
    },
    noiseScore: {
      fontSize: 16,
      fontWeight: '700',
    },
  });
}

export function NoiseSenderItem({ sender, onPress, colors }: NoiseSenderItemProps) {
  const styles = React.useMemo(() => createStyles(), []);

  return (
    <TouchableOpacity
      testID={`sender-${sender.id}`}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`${sender.displayName || sender.email}, ${sender.totalEmails} emails, ${sender.engagementRate}% engagement, noise score ${sender.noiseScore.toFixed(1)}`}
      accessibilityHint="Double tap to view emails from this sender"
      style={[styles.senderCard, { backgroundColor: colors.surface }]}
      onPress={() => onPress(sender.email)}
      activeOpacity={0.7}
    >
      <View style={styles.senderInfo}>
        <View style={[styles.senderAvatar, { backgroundColor: colors.primary }]}>
          <AppText style={styles.senderInitial} dynamicTypeStyle="body">
            {sender.displayName?.[0] || sender.email[0].toUpperCase()}
          </AppText>
        </View>
        <View style={styles.senderDetails}>
          <AppText style={[styles.senderName, { color: colors.text }]} numberOfLines={1} dynamicTypeStyle="body">
            {sender.displayName || sender.email}
          </AppText>
          <AppText style={[styles.senderEmail, { color: colors.textSecondary }]} numberOfLines={1} dynamicTypeStyle="caption1">
            {sender.email}
          </AppText>
          <AppText style={[styles.senderStats, { color: colors.textSecondary }]} dynamicTypeStyle="caption1">
            {sender.totalEmails} emails • {sender.engagementRate}% engagement
          </AppText>
        </View>
      </View>
      <View style={[styles.noiseBadge, { backgroundColor: sender.noiseScore >= 8 ? colors.danger + '20' : colors.warning + '20' }]}>
        <AppText style={[styles.noiseScore, { color: sender.noiseScore >= 8 ? colors.danger : colors.warning }]} dynamicTypeStyle="body">
          {sender.noiseScore.toFixed(1)}
        </AppText>
      </View>
    </TouchableOpacity>
  );
}

