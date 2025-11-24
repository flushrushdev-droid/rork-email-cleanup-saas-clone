import React, { useState } from 'react';
import { Text, View, ScrollView } from 'react-native';
import { Stack, router } from 'expo-router';
import { Sparkles, CheckCircle2 } from 'lucide-react-native';

import { useTheme } from '@/contexts/ThemeContext';
import { EmptyState } from '@/components/common/EmptyState';
import { createSuggestionsStyles } from '@/styles/app/suggestions';
import { SuggestionCard } from '@/components/suggestions/SuggestionCard';
import type { SuggestionType } from '@/utils/suggestionUtils';

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
  const styles = React.useMemo(() => createSuggestionsStyles(colors), [colors]);
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

  // getIcon and getColor are now in utils/suggestionUtils.ts

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
            <EmptyState
              icon={CheckCircle2}
              title="All Caught Up!"
              description="No suggestions at the moment. Check back later for new recommendations."
              iconColor={colors.primary}
              style={styles.emptyState}
            />
          ) : (
            suggestions.map((suggestion) => (
              <SuggestionCard
                key={suggestion.id}
                suggestion={suggestion}
                isProcessing={processingId === suggestion.id}
                onViewAffectedEmails={() => handleViewAffectedEmails(suggestion)}
                onDismiss={() => handleDismiss(suggestion.id)}
                onApply={() => handleApply(suggestion.id)}
                colors={colors}
              />
            ))
          )}
          <View style={{ height: 100 }} />
        </ScrollView>
    </View>
  );
}

