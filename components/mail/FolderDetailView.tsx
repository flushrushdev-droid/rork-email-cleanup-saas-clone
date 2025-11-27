import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Mail, Star } from 'lucide-react-native';
import { EdgeInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { createMailStyles } from '@/styles/app/mail';
import { formatDate } from '@/utils/dateFormat';
import type { EmailMessage } from '@/constants/types';

interface FolderDetailViewProps {
  selectedFolder: {
    id: string;
    name: string;
    color: string;
  } | null;
  filteredEmails: EmailMessage[];
  onBack: () => void;
  onEmailPress: (email: EmailMessage) => void;
  onStar: (emailId: string) => void;
  insets: EdgeInsets;
}

export function FolderDetailView({
  selectedFolder,
  filteredEmails,
  onBack,
  onEmailPress,
  onStar,
  insets,
}: FolderDetailViewProps) {
  const { colors } = useTheme();
  const styles = React.useMemo(() => createMailStyles(colors), [colors]);

  if (!selectedFolder) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader
        title={selectedFolder.name}
        subtitle={`${filteredEmails.length} emails`}
        backgroundColor={selectedFolder.color}
        titleColor={colors.surface}
        subtitleColor={colors.surface + 'E6'}
        backButtonColor={colors.surface}
        onBack={onBack}
        insets={insets}
      />

      <ScrollView 
        style={styles.emailList} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
      >
        {filteredEmails.length === 0 ? (
          <EmptyState
            icon={Mail}
            title="No emails found"
            description="This folder doesn't contain any emails yet"
            iconSize={48}
            style={styles.emptyState}
          />
        ) : (
          filteredEmails.map((email: EmailMessage) => {
            const categoryColor = email.category ? colors.category[email.category] : colors.primary;
            
            return (
              <TouchableOpacity
                key={email.id}
                testID={`email-${email.id}`}
                style={[styles.emailCard, { backgroundColor: colors.surface }, !email.isRead && { backgroundColor: colors.surface }, { borderLeftColor: categoryColor }]}
                onPress={() => onEmailPress(email)}
                activeOpacity={0.7}
              >
                <View style={styles.emailCardContent}>
                  <View style={styles.emailCardHeader}>
                    <Text
                      style={[styles.emailFrom, { color: colors.text }, !email.isRead && styles.emailFromUnread]}
                      numberOfLines={1}
                    >
                      {email.from.split('<')[0].trim() || email.from}
                    </Text>
                    <View style={styles.emailMeta}>
                      <Text style={[styles.emailDate, { color: colors.textSecondary }]}>{formatDate(email.date)}</Text>
                      <TouchableOpacity
                        testID={`star-${email.id}`}
                        onPress={(e) => {
                          e.stopPropagation();
                          onStar(email.id);
                        }}
                        style={styles.starButton}
                      >
                        <Star
                          size={16}
                          color={email.isStarred ? colors.warning : colors.textSecondary}
                          fill={email.isStarred ? colors.warning : 'none'}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <Text
                    style={[styles.emailSubject, { color: colors.text }, !email.isRead && styles.emailSubjectUnread]}
                    numberOfLines={1}
                  >
                    {email.subject}
                  </Text>
                  <Text style={[styles.emailSnippet, { color: colors.textSecondary }]} numberOfLines={2}>
                    {email.snippet}
                  </Text>
                  {email.category && (
                    <View style={styles.emailTags}>
                      <View style={[styles.emailTag, { backgroundColor: categoryColor + '20' }]}>
                        <Text style={[styles.emailTagText, { color: categoryColor }]}>
                          {email.category}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
                {!email.isRead && <View style={styles.unreadDot} />}
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

