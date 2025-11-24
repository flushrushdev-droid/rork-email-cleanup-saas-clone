import React, { useMemo } from 'react';
import { Text, View, FlatList, TouchableOpacity, ListRenderItem } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { mockRecentEmails } from '@/mocks/emailData';
import { useGmailSync } from '@/contexts/GmailSyncContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { createFolderDetailsStyles } from '@/styles/app/folder-details';
import { categorizeEmail } from '@/utils/emailCategories';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import type { Email, EmailCategory, EmailMessage } from '@/constants/types';


export default function FolderDetailsScreen() {
  const params = useLocalSearchParams<{ folderName: string; category?: string; folderColor: string; isCustom?: string }>();
  const { messages } = useGmailSync();
  const { isDemoMode } = useAuth();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = React.useMemo(() => createFolderDetailsStyles(colors), [colors]);

  const emailsWithCategories = useMemo(() => {
    if (isDemoMode || messages.length === 0) {
      return mockRecentEmails;
    }

    return messages.map(email => ({
      ...email,
      category: categorizeEmail(email),
      date: new Date(email.date),
      size: email.sizeBytes,
      tags: [],
      attachmentCount: 0,
      isStarred: false,
      priority: undefined as 'action' | 'later' | 'fyi' | 'low' | undefined,
    }));
  }, [messages, isDemoMode]);

  const filteredEmails = useMemo(() => {
    // For now, custom folders have no rule logic -> show empty
    if (params.isCustom === '1') {
      return [] as any[];
    }
    if (params.folderName === 'Action Required') {
      return emailsWithCategories.filter(email => 
        email.priority === 'action' || 
        email.subject.toLowerCase().includes('action required') ||
        email.subject.toLowerCase().includes('urgent')
      );
    }

    if (params.category) {
      return emailsWithCategories.filter(email => email.category === params.category);
    }

    return emailsWithCategories;
  }, [emailsWithCategories, params.folderName, params.category]);

  const handleEmailPress = (email: EmailMessage) => {
    router.push({
      pathname: '/email-detail',
      params: { emailId: email.id },
    });
  };

  return (
    <>
      <Stack.Screen 
        options={{ 
          headerShown: false,
        }} 
      />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScreenHeader
          title={params.folderName || 'Folder'}
          subtitle={`${filteredEmails.length} emails`}
          backgroundColor={params.folderColor || colors.primary}
          titleColor="#FFFFFF"
          subtitleColor="#FFFFFF"
          backButtonColor="#FFFFFF"
          insets={insets}
          style={styles.header}
        />

        <FlatList
          data={filteredEmails}
          renderItem={({ item: email }) => {
            const categoryColor = email.category ? colors.category[email.category] : colors.primary;
            
            return (
              <TouchableOpacity 
                style={[styles.emailCard, { backgroundColor: colors.surface, borderLeftColor: categoryColor }]}
                onPress={() => handleEmailPress(email as EmailMessage)}
                activeOpacity={0.7}
              >
                <View style={styles.emailHeader}>
                  <View style={styles.emailMeta}>
                    <Text style={[styles.emailFrom, { color: colors.textSecondary }]} numberOfLines={1}>{email.from}</Text>
                    <Text style={[styles.emailDate, { color: colors.textSecondary }]}>
                      {new Date(email.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.emailSubject, { color: colors.text }]} numberOfLines={1}>{email.subject}</Text>
                <Text style={[styles.emailSnippet, { color: colors.textSecondary }]} numberOfLines={2}>{email.snippet}</Text>
                <View style={styles.emailTags}>
                  {email.category && (
                    <View style={[styles.emailTag, { backgroundColor: categoryColor + '20' }]}>
                      <Text style={[styles.emailTagText, { color: categoryColor }]}>
                        {email.category}
                      </Text>
                    </View>
                  )}
                  {email.priority && email.priority !== 'low' && (
                    <View style={[styles.emailTag, { backgroundColor: colors.status[email.priority === 'action' ? 'actionRequired' : email.priority === 'later' ? 'waiting' : 'fyi'] + '20' }]}>
                      <Text style={[styles.emailTagText, { color: colors.status[email.priority === 'action' ? 'actionRequired' : email.priority === 'later' ? 'waiting' : 'fyi'] }]}>
                        {email.priority}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          }}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={[styles.emptyStateTitle, { color: colors.text }]}>No emails</Text>
              <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>This folder is empty</Text>
            </View>
          }
          contentContainerStyle={[{ paddingBottom: 40 }]}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={10}
          updateCellsBatchingPeriod={50}
          style={styles.scrollView}
        />
      </View>
    </>
  );
}

