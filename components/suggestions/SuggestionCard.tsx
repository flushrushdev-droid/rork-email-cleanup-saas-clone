import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { XCircle, CheckCircle2 } from 'lucide-react-native';
import { createSuggestionsStyles } from '@/styles/app/suggestions';
import { getSuggestionIcon, getSuggestionColor } from '@/utils/suggestionUtils';
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

interface SuggestionCardProps {
  suggestion: Suggestion;
  isProcessing: boolean;
  onViewAffectedEmails: () => void;
  onDismiss: () => void;
  onApply: () => void;
  colors: any;
}

export function SuggestionCard({
  suggestion,
  isProcessing,
  onViewAffectedEmails,
  onDismiss,
  onApply,
  colors,
}: SuggestionCardProps) {
  const styles = createSuggestionsStyles(colors);
  const Icon = getSuggestionIcon(suggestion.type);
  const color = getSuggestionColor(suggestion.type, colors);

  return (
    <View key={suggestion.id} style={[styles.suggestionCard, { backgroundColor: colors.surface }]}>
      <TouchableOpacity
        onPress={onViewAffectedEmails}
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
          onPress={onDismiss}
          disabled={isProcessing}
          activeOpacity={0.7}
        >
          <XCircle size={18} color={colors.textSecondary} />
          <Text style={[styles.dismissButtonText, { color: colors.textSecondary }]}>Dismiss</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.applyButton, { backgroundColor: color }]}
          onPress={onApply}
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
}

