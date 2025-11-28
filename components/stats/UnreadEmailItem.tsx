/**
 * Unread Email Item Component
 * 
 * Displays a single unread email item in the stat details list.
 */

import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { Mail } from 'lucide-react-native';
import type { Email } from '@/constants/types';
import type { ThemeColors } from '@/constants/colors';

export interface UnreadEmailItemProps {
  email: Email;
  onPress: (emailId: string) => void;
  colors: ThemeColors;
}

function createStyles() {
  return StyleSheet.create({
    emailCard: {
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 1,
    },
    emailHeader: {
      flexDirection: 'row',
      gap: 12,
    },
    emailIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emailContent: {
      flex: 1,
    },
    emailSubject: {
      fontSize: 15,
      fontWeight: '600',
      marginBottom: 4,
    },
    emailFrom: {
      fontSize: 13,
      marginBottom: 6,
    },
    emailSnippet: {
      fontSize: 14,
      lineHeight: 20,
      marginBottom: 4,
    },
    emailDate: {
      fontSize: 12,
    },
  });
}

export function UnreadEmailItem({ email, onPress, colors }: UnreadEmailItemProps) {
  const styles = React.useMemo(() => createStyles(), []);
  
  const emailDate = typeof email.date === 'string'
    ? new Date(email.date).toLocaleDateString()
    : '';

  return (
    <TouchableOpacity
      testID={`unread-email-${email.id}`}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`Unread email from ${email.from}, subject: ${email.subject || 'No subject'}, ${emailDate}`}
      accessibilityHint="Double tap to view this email"
      style={[styles.emailCard, { backgroundColor: colors.surface }]}
      onPress={() => onPress(email.id)}
      activeOpacity={0.7}
    >
      <View style={styles.emailHeader}>
        <View style={[styles.emailIconContainer, { backgroundColor: colors.primary + '20' }]}>
          <Mail size={20} color={colors.primary} />
        </View>
        <View style={styles.emailContent}>
          <AppText style={[styles.emailSubject, { color: colors.text }]} numberOfLines={1} dynamicTypeStyle="body">
            {email.subject}
          </AppText>
          <AppText style={[styles.emailFrom, { color: colors.textSecondary }]} numberOfLines={1} dynamicTypeStyle="caption1">
            {email.from}
          </AppText>
          <AppText style={[styles.emailSnippet, { color: colors.textSecondary }]} numberOfLines={2} dynamicTypeStyle="caption1">
            {email.snippet}
          </AppText>
          <AppText style={[styles.emailDate, { color: colors.textSecondary }]} dynamicTypeStyle="caption1">
            {emailDate}
          </AppText>
        </View>
      </View>
    </TouchableOpacity>
  );
}

