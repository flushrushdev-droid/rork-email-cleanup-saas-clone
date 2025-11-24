import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Mail } from 'lucide-react-native';
import type { EmailMessage } from '@/constants/types';
import { createStatDetailsStyles } from '@/styles/app/stat-details';

interface UnreadEmailsViewProps {
  emails: EmailMessage[];
  onEmailPress: (emailId: string) => void;
  colors: any;
}

export function UnreadEmailsView({ emails, onEmailPress, colors }: UnreadEmailsViewProps) {
  const styles = React.useMemo(() => createStatDetailsStyles(colors), [colors]);

  if (emails.length === 0) {
    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Unread Messages (0)</Text>
        <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No unread messages! 🎉</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Unread Messages ({emails.length})</Text>
      {emails.map((email) => (
        <TouchableOpacity
          key={email.id}
          testID={`unread-email-${email.id}`}
          style={[styles.emailCard, { backgroundColor: colors.surface }]}
          onPress={() => onEmailPress(email.id)}
          activeOpacity={0.7}
        >
          <View style={styles.emailHeader}>
            <View style={[styles.emailIconContainer, { backgroundColor: colors.primary + '20' }]}>
              <Mail size={20} color={colors.primary} />
            </View>
            <View style={styles.emailContent}>
              <Text style={[styles.emailSubject, { color: colors.text }]} numberOfLines={1}>
                {email.subject}
              </Text>
              <Text style={[styles.emailFrom, { color: colors.textSecondary }]} numberOfLines={1}>
                {email.from}
              </Text>
              <Text style={[styles.emailSnippet, { color: colors.textSecondary }]} numberOfLines={2}>
                {email.snippet}
              </Text>
              <Text style={[styles.emailDate, { color: colors.textSecondary }]}>
                {typeof email.date === 'string'
                  ? new Date(email.date).toLocaleDateString()
                  : email.date.toLocaleDateString()}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

