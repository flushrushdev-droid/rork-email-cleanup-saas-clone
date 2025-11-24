import React, { useMemo } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';

import { mockRecentEmails } from '@/mocks/emailData';
import { useGmailSync } from '@/contexts/GmailSyncContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import type { Email, EmailCategory, EmailMessage } from '@/constants/types';

const categoryKeywords: Record<EmailCategory, string[]> = {
  invoices: ['invoice', 'bill', 'payment', 'billing', 'charge'],
  receipts: ['receipt', 'order confirmation', 'purchase', 'transaction'],
  travel: ['flight', 'hotel', 'booking', 'reservation', 'trip', 'travel'],
  hr: ['hr', 'human resources', 'benefits', 'payroll', 'pto', 'time off'],
  legal: ['legal', 'contract', 'agreement', 'terms', 'policy'],
  personal: ['personal', 'family', 'friend'],
  promotions: ['sale', 'discount', 'offer', 'deal', 'promo', 'marketing'],
  social: ['linkedin', 'facebook', 'twitter', 'instagram', 'notification'],
  system: ['alert', 'security', 'notification', 'update', 'reminder'],
};

function categorizeEmail(email: Email): EmailCategory | undefined {
  const searchText = `${email.subject} ${email.snippet} ${email.from}`.toLowerCase();
  
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => searchText.includes(keyword))) {
      return category as EmailCategory;
    }
  }
  
  return undefined;
}

export default function FolderDetailsScreen() {
  const params = useLocalSearchParams<{ folderName: string; category?: string; folderColor: string; isCustom?: string }>();
  const { messages } = useGmailSync();
  const { isDemoMode } = useAuth();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

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
        <View style={[styles.header, { backgroundColor: params.folderColor || colors.primary, paddingTop: insets.top + 16 }]}>
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ChevronLeft size={28} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>{params.folderName}</Text>
            <Text style={styles.headerSubtitle}>{filteredEmails.length} emails</Text>
          </View>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {filteredEmails.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyStateTitle, { color: colors.text }]}>No emails</Text>
              <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>This folder is empty</Text>
            </View>
          ) : (
            <View style={styles.emailList}>
              {filteredEmails.map((email) => {
                const categoryColor = email.category ? colors.category[email.category] : colors.primary;
                
                return (
                  <TouchableOpacity 
                    key={email.id} 
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
              })}
            </View>
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  backButton: {
    marginBottom: 12,
  },
  headerContent: {
    gap: 4,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  scrollView: {
    flex: 1,
  },
  emailList: {
    padding: 16,
    gap: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
  },
  emailCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  emailHeader: {
    marginBottom: 8,
  },
  emailMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emailFrom: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  emailDate: {
    fontSize: 12,
  },
  emailSubject: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  emailSnippet: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  emailTags: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  emailTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  emailTagText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});
