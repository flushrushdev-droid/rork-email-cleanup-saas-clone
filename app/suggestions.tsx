import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Stack, router } from 'expo-router';
import { Sparkles, CheckCircle2, XCircle, Archive, Trash2, FolderOpen } from 'lucide-react-native';

import { useTheme } from '@/contexts/ThemeContext';

type SuggestionType = 'archive' | 'delete' | 'move';

interface Suggestion {
  id: string;
  type: SuggestionType;
  title: string;
  description: string;
  emailCount: number;
  reason: string;
  affectedEmails?: string[];
}

export default function SuggestionsScreen() {
  const { colors } = useTheme();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([
    {
      id: '1',
      type: 'archive',
      title: 'Archive promotional emails',
      description: 'You have 45 promotional emails from the past 30 days',
      emailCount: 45,
      reason: 'These emails are rarely opened',
      affectedEmails: [
        'newsletters@medium.com',
        'deals@retailer.com',
        'marketing@store.com',
        'promotions@shop.com',
        'offers@brand.com',
      ],
    },
    {
      id: '2',
      type: 'delete',
      title: 'Delete old newsletters',
      description: 'Newsletter emails older than 60 days',
      emailCount: 23,
      reason: 'Never opened in the last 2 months',
      affectedEmails: [
        'weekly@newsletter.com',
        'digest@news.com',
        'updates@techblog.com',
      ],
    },
    {
      id: '3',
      type: 'move',
      title: 'Move social notifications',
      description: 'Social media notifications to a dedicated folder',
      emailCount: 67,
      reason: 'Frequent but low priority',
      affectedEmails: [
        'noreply@linkedin.com',
        'notifications@twitter.com',
        'notify@facebook.com',
        'alerts@instagram.com',
      ],
    },
  ]);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleApply = async (suggestionId: string) => {
    setProcessingId(suggestionId);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setSuggestions(suggestions.filter((s) => s.id !== suggestionId));
    setProcessingId(null);
  };

  const handleDismiss = (suggestionId: string) => {
    setSuggestions(suggestions.filter((s) => s.id !== suggestionId));
  };

  const handleViewAffectedEmails = (suggestion: Suggestion) => {
    router.push({
      pathname: '/affected-emails',
      params: {
        title: suggestion.title,
        emails: JSON.stringify(suggestion.affectedEmails || []),
        count: suggestion.emailCount.toString(),
        type: suggestion.type,
      },
    });
  };

  const getIcon = (type: SuggestionType) => {
    switch (type) {
      case 'archive':
        return Archive;
      case 'delete':
        return Trash2;
      case 'move':
        return FolderOpen;
    }
  };

  const getColor = (type: SuggestionType) => {
    switch (type) {
      case 'archive':
        return colors.primary;
      case 'delete':
        return colors.danger;
      case 'move':
        return colors.secondary;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: 'Suggestions',
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
          headerShadowVisible: false,
        }}
      />
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <View style={[styles.headerIcon, { backgroundColor: colors.primary + '20' }]}>
            <Sparkles size={28} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>Smart Suggestions</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            AI-powered recommendations to keep your inbox clean and organized
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {suggestions.length === 0 ? (
            <View style={styles.emptyState}>
              <CheckCircle2 size={64} color={colors.primary} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>All Caught Up!</Text>
              <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
                No suggestions at the moment. Check back later for new recommendations.
              </Text>
            </View>
          ) : (
            suggestions.map((suggestion) => {
              const Icon = getIcon(suggestion.type);
              const color = getColor(suggestion.type);
              const isProcessing = processingId === suggestion.id;

              return (
                <View key={suggestion.id} style={[styles.suggestionCard, { backgroundColor: colors.surface }]}>
                  <TouchableOpacity
                    onPress={() => handleViewAffectedEmails(suggestion)}
                    activeOpacity={0.7}
                    style={styles.cardTouchable}
                  >
                    <View style={styles.suggestionHeader}>
                      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
                        <Icon size={24} color={color} />
                      </View>
                      <View style={styles.suggestionContent}>
                        <Text style={[styles.suggestionTitle, { color: colors.text }]}>{suggestion.title}</Text>
                        <Text style={[styles.suggestionDescription, { color: colors.textSecondary }]}>{suggestion.description}</Text>
                        <View style={styles.metaRow}>
                          <View style={[styles.badge, { backgroundColor: colors.primary + '20' }]}>
                            <Text style={[styles.badgeText, { color: colors.primary }]}>{suggestion.emailCount} emails</Text>
                          </View>
                          <Text style={[styles.reason, { color: colors.textSecondary }]}>{suggestion.reason}</Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>

                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.dismissButton, { backgroundColor: colors.background, borderColor: colors.border }]}
                      onPress={() => handleDismiss(suggestion.id)}
                      disabled={isProcessing}
                      activeOpacity={0.7}
                    >
                      <XCircle size={18} color={colors.textSecondary} />
                      <Text style={[styles.dismissButtonText, { color: colors.textSecondary }]}>Dismiss</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionButton, styles.applyButton, { backgroundColor: color }]}
                      onPress={() => handleApply(suggestion.id)}
                      disabled={isProcessing}
                      activeOpacity={0.7}
                    >
                      {isProcessing ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <>
                          <CheckCircle2 size={18} color="#FFFFFF" />
                          <Text style={styles.applyButtonText}>Apply</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
          <View style={{ height: 100 }} />
        </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: '90%',
  },
  scrollContent: {
    padding: 16,
  },
  suggestionCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  cardTouchable: {
    marginBottom: 12,
  },
  suggestionHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  suggestionDescription: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  reason: {
    fontSize: 12,
    fontStyle: 'italic' as const,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  dismissButton: {
    borderWidth: 1,
  },
  dismissButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  applyButton: {
    flex: 1.2,
  },
  applyButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});
