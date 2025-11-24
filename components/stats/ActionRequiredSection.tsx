import React from 'react';
import { View, Text } from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { AccessibleButton } from '@/components/common/AccessibleButton';
import { formatAccessibilityLabel } from '@/utils/accessibility';
import { createOverviewStyles } from '@/styles/app/index';
import type { EmailMessage } from '@/constants/types';

interface ActionRequiredSectionProps {
  emails: EmailMessage[];
  colors: any;
  router: ReturnType<typeof useRouter>;
}

export function ActionRequiredSection({ emails, colors, router }: ActionRequiredSectionProps) {
  const styles = React.useMemo(() => createOverviewStyles(colors), [colors]);

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Action Required</Text>
        <AccessibleButton
          testID="action-view-all"
          accessibilityLabel="View all action required emails"
          accessibilityHint="Opens folder with all action required emails"
          onPress={() => router.push({ pathname: '/folder-details', params: { folderName: 'Action Required', folderColor: colors.danger } })}
        >
          <Text style={[styles.seeAll, { color: colors.primary }]}>View All</Text>
        </AccessibleButton>
      </View>
      {emails.map((email) => (
        <AccessibleButton
          key={email.id}
          accessibilityLabel={formatAccessibilityLabel('Action required email: {subject} from {from}', {
            subject: email.subject,
            from: email.from,
          })}
          accessibilityHint="Opens email detail view"
          style={[styles.emailCard, { backgroundColor: colors.surface, borderLeftColor: colors.danger }]}
          onPress={() => router.push({ pathname: '/email-detail', params: { emailId: email.id } })}
        >
          <View style={styles.emailHeader}>
            <View style={styles.emailIconContainer}>
              <AlertCircle size={20} color={colors.danger} />
            </View>
            <View style={styles.emailContent}>
              <Text style={[styles.emailSubject, { color: colors.text }]} numberOfLines={1}>{email.subject}</Text>
              <Text style={[styles.emailFrom, { color: colors.textSecondary }]} numberOfLines={1}>{email.from}</Text>
              <Text style={[styles.emailSnippet, { color: colors.textSecondary }]} numberOfLines={2}>{email.snippet}</Text>
            </View>
          </View>
        </AccessibleButton>
      ))}
    </View>
  );
}


