import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import type { Sender } from '@/constants/types';
import { createStatDetailsStyles } from '@/styles/app/stat-details';

interface NoiseSendersViewProps {
  senders: Sender[];
  onSenderPress: (email: string) => void;
  colors: any;
}

export function NoiseSendersView({ senders, onSenderPress, colors }: NoiseSendersViewProps) {
  const styles = React.useMemo(() => createStatDetailsStyles(colors), [colors]);

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>High Noise Senders ({senders.length})</Text>
      <View style={[styles.infoBox, { backgroundColor: colors.primary + '20', borderLeftColor: colors.primary }]}>
        <Text style={[styles.infoText, { color: colors.text }]}>
          These senders have high email volume but low engagement. Consider unsubscribing or muting them.
        </Text>
      </View>
      {senders.map((sender) => (
        <TouchableOpacity
          key={sender.id}
          testID={`sender-${sender.id}`}
          style={[styles.senderCard, { backgroundColor: colors.surface }]}
          onPress={() => onSenderPress(sender.email)}
          activeOpacity={0.7}
        >
          <View style={styles.senderInfo}>
            <View style={[styles.senderAvatar, { backgroundColor: colors.primary }]}>
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
              <Text style={[styles.senderStats, { color: colors.textSecondary }]}>
                {sender.totalEmails} emails • {sender.engagementRate}% engagement
              </Text>
            </View>
          </View>
          <View style={[styles.noiseBadge, { backgroundColor: sender.noiseScore >= 8 ? '#FFE5E5' : '#FFF4E5' }]}>
            <Text style={[styles.noiseScore, { color: sender.noiseScore >= 8 ? colors.danger : colors.warning }]}>
              {sender.noiseScore.toFixed(1)}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

