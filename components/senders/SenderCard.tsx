import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Mail, HardDrive, TrendingUp, BellOff, Trash, Trash2 } from 'lucide-react-native';
import type { Sender } from '@/constants/types';
import { calculateSavings, formatBytes, getNoiseColor } from '@/mocks/emailData';
import { createSenderStyles } from '@/styles/app/senders';

interface SenderCardProps {
  sender: Sender;
  isSelected: boolean;
  onPress: () => void;
  onLongPress: () => void;
  onUnsubscribe: (email: string) => void;
  onDelete: (senderId: string, senderEmail: string) => void;
  onPermanentDelete: (senderId: string, senderEmail: string) => void;
  onBlock: (senderId: string, senderEmail: string) => void;
  onViewEmails: (senderId: string) => void;
  colors: any;
}

export function SenderCard({
  sender,
  isSelected,
  onPress,
  onLongPress,
  onUnsubscribe,
  onDelete,
  onPermanentDelete,
  onBlock,
  onViewEmails,
  colors,
}: SenderCardProps) {
  const styles = React.useMemo(() => createSenderStyles(colors), [colors]);
  const savings = calculateSavings(sender);

  return (
    <View
      style={[
        styles.senderCard,
        { backgroundColor: colors.surface },
        isSelected && { borderColor: colors.primary },
      ]}
    >
      <TouchableOpacity
        testID={`sender-card-${sender.id}`}
        onPress={onViewEmails}
        onLongPress={onLongPress}
        activeOpacity={0.7}
      >
        <View style={styles.senderHeader}>
          <View style={styles.senderInfo}>
            <View
              style={[
                styles.senderAvatar,
                {
                  backgroundColor: sender.isTrusted
                    ? colors.success
                    : sender.isBlocked
                    ? colors.danger
                    : colors.primary,
                },
              ]}
            >
              <Text style={styles.senderInitial}>
                {sender.displayName?.[0] || sender.email[0].toUpperCase()}
              </Text>
            </View>
            <View style={styles.senderDetails}>
              <Text style={[styles.senderName, { color: colors.text }]} numberOfLines={1}>
                {sender.displayName || sender.email}
              </Text>
              <Text style={[styles.senderEmail, { color: colors.textSecondary }]} numberOfLines={1}>
                {sender.email}
              </Text>
            </View>
          </View>
          <View style={[styles.noiseBadge, { backgroundColor: getNoiseColor(sender.noiseScore) + '20' }]}>
            <Text style={[styles.noiseScore, { color: getNoiseColor(sender.noiseScore) }]}>
              {sender.noiseScore.toFixed(1)}
            </Text>
          </View>
        </View>

        <View style={[styles.statsRow, { borderColor: colors.border }]}>
          <View style={styles.statBox}>
            <Mail size={16} color={colors.textSecondary} />
            <Text style={[styles.statValue, { color: colors.text }]}>{sender.totalEmails}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Emails</Text>
          </View>
          <View style={styles.statBox}>
            <HardDrive size={16} color={colors.textSecondary} />
            <Text style={[styles.statValue, { color: colors.text }]}>{formatBytes(sender.totalSize)}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Storage</Text>
          </View>
          <View style={styles.statBox}>
            <TrendingUp size={16} color={colors.textSecondary} />
            <Text style={[styles.statValue, { color: colors.text }]}>{sender.engagementRate}%</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Engagement</Text>
          </View>
        </View>

        <View style={[styles.savingsBar, { backgroundColor: colors.background }]}>
          <View style={styles.savingItem}>
            <Text style={[styles.savingLabel, { color: colors.textSecondary }]}>Potential Savings:</Text>
            <Text style={[styles.savingValue, { color: colors.text }]}>
              {savings.time} min • {savings.space} MB
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      <View style={styles.actions}>
        {sender.hasUnsubscribe && (
          <TouchableOpacity
            testID={`unsubscribe-${sender.id}`}
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={() => onUnsubscribe(sender.email)}
          >
            <BellOff size={16} color="#FFFFFF" />
            <Text style={styles.actionButtonPrimaryText}>Unsubscribe</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          testID={`delete-${sender.id}`}
          style={[styles.actionButton, { backgroundColor: colors.background }]}
          onPress={() => onDelete(sender.id, sender.email)}
        >
          <Trash size={16} color={colors.text} />
          <Text style={[styles.actionButtonText, { color: colors.text }]}>Delete</Text>
        </TouchableOpacity>
        <TouchableOpacity
          testID={`permanent-delete-${sender.id}`}
          style={[styles.actionButton, { backgroundColor: colors.background, borderColor: colors.danger }]}
          onPress={() => onPermanentDelete(sender.id, sender.email)}
        >
          <Trash2 size={16} color={colors.danger} />
          <Text style={[styles.actionButtonDangerText, { color: colors.danger }]}>Delete Forever</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomActions}>
        <TouchableOpacity
          testID={`auto-rule-${sender.id}`}
          style={[styles.autoRuleButton, { backgroundColor: colors.primary }]}
          onPress={() => Alert.alert('Auto Rule', `Create automatic rule for ${sender.email}`)}
        >
          <Text style={styles.autoRuleButtonText}>Auto Rule</Text>
        </TouchableOpacity>

        <TouchableOpacity
          testID={`block-${sender.id}`}
          style={[styles.blockButton, { backgroundColor: colors.danger }]}
          onPress={() => onBlock(sender.id, sender.email)}
        >
          <Text style={styles.blockButtonText}>Block Sender</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

