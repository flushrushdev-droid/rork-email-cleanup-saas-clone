import React, { useMemo } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';

import Colors from '@/constants/colors';
import { mockRecentEmails } from '@/mocks/emailData';
import { useGmailSync } from '@/contexts/GmailSyncContext';
import { useAuth } from '@/contexts/AuthContext';
import type { Email, EmailCategory } from '@/constants/types';

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
  const params = useLocalSearchParams<{ folderName: string; category?: string; folderColor: string }>();
  const { messages } = useGmailSync();
  const { isDemoMode } = useAuth();
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

  return (
    <>
      <Stack.Screen 
        options={{ 
          headerShown: false,
        }} 
      />
      <View style={styles.container}>
        <View style={[styles.header, { backgroundColor: params.folderColor || Colors.light.primary, paddingTop: insets.top + 16 }]}>
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
              <Text style={styles.emptyStateTitle}>No emails</Text>
              <Text style={styles.emptyStateText}>This folder is empty</Text>
            </View>
          ) : (
            <View style={styles.emailList}>
              {filteredEmails.map((email) => {
                const categoryColor = email.category ? Colors.light.category[email.category] : Colors.light.primary;
                
                return (
                  <TouchableOpacity 
                    key={email.id} 
                    style={[styles.emailCard, { borderLeftColor: categoryColor }]}
                    activeOpacity={0.7}
                  >
                    <View style={styles.emailHeader}>
                      <View style={styles.emailMeta}>
                        <Text style={styles.emailFrom} numberOfLines={1}>{email.from}</Text>
                        <Text style={styles.emailDate}>
                          {new Date(email.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.emailSubject} numberOfLines={1}>{email.subject}</Text>
                    <Text style={styles.emailSnippet} numberOfLines={2}>{email.snippet}</Text>
                    <View style={styles.emailTags}>
                      {email.category && (
                        <View style={[styles.emailTag, { backgroundColor: categoryColor + '20' }]}>
                          <Text style={[styles.emailTagText, { color: categoryColor }]}>
                            {email.category}
                          </Text>
                        </View>
                      )}
                      {email.priority && email.priority !== 'low' && (
                        <View style={[styles.emailTag, { backgroundColor: Colors.light.status[email.priority === 'action' ? 'actionRequired' : email.priority === 'later' ? 'waiting' : 'fyi'] + '20' }]}>
                          <Text style={[styles.emailTagText, { color: Colors.light.status[email.priority === 'action' ? 'actionRequired' : email.priority === 'later' ? 'waiting' : 'fyi'] }]}>
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
    backgroundColor: Colors.light.background,
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
    color: Colors.light.text,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
  emailCard: {
    backgroundColor: Colors.light.surface,
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
    color: Colors.light.textSecondary,
    flex: 1,
  },
  emailDate: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  emailSubject: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 6,
  },
  emailSnippet: {
    fontSize: 14,
    color: Colors.light.textSecondary,
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
