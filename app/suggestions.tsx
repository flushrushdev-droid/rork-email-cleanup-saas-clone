import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { Sparkles, CheckCircle2, XCircle, Archive, Trash2, FolderOpen } from 'lucide-react-native';

import Colors from '@/constants/colors';

type SuggestionType = 'archive' | 'delete' | 'move';

interface Suggestion {
  id: string;
  type: SuggestionType;
  title: string;
  description: string;
  emailCount: number;
  reason: string;
}

export default function SuggestionsScreen() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([
    {
      id: '1',
      type: 'archive',
      title: 'Archive promotional emails',
      description: 'You have 45 promotional emails from the past 30 days',
      emailCount: 45,
      reason: 'These emails are rarely opened',
    },
    {
      id: '2',
      type: 'delete',
      title: 'Delete old newsletters',
      description: 'Newsletter emails older than 60 days',
      emailCount: 23,
      reason: 'Never opened in the last 2 months',
    },
    {
      id: '3',
      type: 'move',
      title: 'Move social notifications',
      description: 'Social media notifications to a dedicated folder',
      emailCount: 67,
      reason: 'Frequent but low priority',
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
        return Colors.light.primary;
      case 'delete':
        return Colors.light.danger;
      case 'move':
        return Colors.light.secondary;
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Suggestions',
          headerStyle: {
            backgroundColor: Colors.light.surface,
          },
          headerTintColor: Colors.light.text,
        }}
      />
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Sparkles size={28} color={Colors.light.primary} />
          </View>
          <Text style={styles.title}>Smart Suggestions</Text>
          <Text style={styles.subtitle}>
            AI-powered recommendations to keep your inbox clean and organized
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {suggestions.length === 0 ? (
            <View style={styles.emptyState}>
              <CheckCircle2 size={64} color={Colors.light.primary} />
              <Text style={styles.emptyTitle}>All Caught Up!</Text>
              <Text style={styles.emptyDescription}>
                No suggestions at the moment. Check back later for new recommendations.
              </Text>
            </View>
          ) : (
            suggestions.map((suggestion) => {
              const Icon = getIcon(suggestion.type);
              const color = getColor(suggestion.type);
              const isProcessing = processingId === suggestion.id;

              return (
                <View key={suggestion.id} style={styles.suggestionCard}>
                  <View style={styles.suggestionHeader}>
                    <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
                      <Icon size={24} color={color} />
                    </View>
                    <View style={styles.suggestionContent}>
                      <Text style={styles.suggestionTitle}>{suggestion.title}</Text>
                      <Text style={styles.suggestionDescription}>{suggestion.description}</Text>
                      <View style={styles.metaRow}>
                        <View style={styles.badge}>
                          <Text style={styles.badgeText}>{suggestion.emailCount} emails</Text>
                        </View>
                        <Text style={styles.reason}>{suggestion.reason}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.dismissButton]}
                      onPress={() => handleDismiss(suggestion.id)}
                      disabled={isProcessing}
                      activeOpacity={0.7}
                    >
                      <XCircle size={18} color={Colors.light.textSecondary} />
                      <Text style={styles.dismissButtonText}>Dismiss</Text>
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
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    padding: 20,
    backgroundColor: Colors.light.surface,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.light.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: '90%',
  },
  scrollContent: {
    padding: 16,
  },
  suggestionCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  suggestionHeader: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
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
    color: Colors.light.text,
    marginBottom: 4,
  },
  suggestionDescription: {
    fontSize: 14,
    color: Colors.light.textSecondary,
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
    backgroundColor: Colors.light.primary + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  reason: {
    fontSize: 12,
    color: Colors.light.textSecondary,
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
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  dismissButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.textSecondary,
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
    color: Colors.light.text,
    marginTop: 24,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
