import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Mail, BellOff } from 'lucide-react-native';
import { createUnsubscribeStyles } from '@/styles/app/unsubscribe';

interface Sender {
  id: string;
  displayName?: string;
  email: string;
  totalEmails: number;
  frequency: number;
  noiseScore: number;
  hasUnsubscribe: boolean;
}

interface UnsubscribeSenderCardProps {
  sender: Sender;
  onUnsubscribe: (senderId: string) => void;
  colors: any;
}

export function UnsubscribeSenderCard({ sender, onUnsubscribe, colors }: UnsubscribeSenderCardProps) {
  const styles = React.useMemo(() => createUnsubscribeStyles(colors), [colors]);

  return (
    <View key={sender.id} style={[styles.senderCard, { backgroundColor: colors.surface }]}>
      <View style={styles.senderHeader}>
        <View style={styles.senderInfo}>
          <View style={[styles.senderAvatar, { backgroundColor: colors.primary + '20' }]}>
            <Mail size={20} color={colors.primary} />
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
      </View>

      <View style={[styles.senderStats, { borderColor: colors.border }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.text }]}>{sender.totalEmails}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Emails</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.text }]}>{sender.frequency}/mo</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Frequency</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.text }]}>{sender.noiseScore.toFixed(1)}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Noise</Text>
        </View>
      </View>

      <View style={[styles.methodBadge, { backgroundColor: colors.background }]}>
        <Text style={[styles.methodText, { color: colors.textSecondary }]}>
          Method: {sender.hasUnsubscribe ? 'List-Unsubscribe' : 'Auto-Reply'}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.unsubscribeButton, { backgroundColor: colors.danger }]}
        onPress={() => onUnsubscribe(sender.id)}
      >
        <BellOff size={18} color="#FFFFFF" />
        <Text style={styles.unsubscribeButtonText}>Unsubscribe</Text>
      </TouchableOpacity>
    </View>
  );
}

