import React from 'react';
import { View, Text } from 'react-native';
import { Sparkles, Archive, Trash2, FolderOpen, ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { AccessibleButton } from '@/components/common/AccessibleButton';
import { createOverviewStyles } from '@/styles/app/index';

interface SuggestionsCardProps {
  colors: any;
  router: ReturnType<typeof useRouter>;
}

export function SuggestionsCard({ colors, router }: SuggestionsCardProps) {
  const styles = React.useMemo(() => createOverviewStyles(colors), [colors]);

  return (
    <AccessibleButton
      testID="suggestions-card"
      accessibilityLabel="Suggestions: 3 smart recommendations"
      accessibilityHint="Opens suggestions page with smart recommendations for your inbox"
      style={[styles.suggestionsCard, { backgroundColor: colors.surface }]}
      onPress={() => router.push('/suggestions')}
    >
      <View style={styles.suggestionsHeader}>
        <View style={styles.suggestionsHeaderLeft}>
          <View style={styles.suggestionsIconContainer}>
            <Sparkles size={24} color={colors.warning} />
          </View>
          <View>
            <Text style={[styles.suggestionsTitle, { color: colors.text }]}>Suggestions</Text>
            <Text style={[styles.suggestionsSubtitle, { color: colors.textSecondary }]}>3 smart recommendations</Text>
          </View>
        </View>
        <ChevronRight size={20} color={colors.textSecondary} />
      </View>
      
      <View style={styles.suggestionsList}>
        <View style={styles.suggestionItem}>
          <View style={[styles.suggestionIconSmall, { backgroundColor: colors.primary + '20' }]}>
            <Archive size={14} color={colors.primary} />
          </View>
          <Text style={[styles.suggestionText, { color: colors.text }]} numberOfLines={1}>Archive 45 promotional emails</Text>
        </View>
        <View style={styles.suggestionItem}>
          <View style={[styles.suggestionIconSmall, { backgroundColor: colors.danger + '20' }]}>
            <Trash2 size={14} color={colors.danger} />
          </View>
          <Text style={[styles.suggestionText, { color: colors.text }]} numberOfLines={1}>Delete 23 old newsletters</Text>
        </View>
        <View style={styles.suggestionItem}>
          <View style={[styles.suggestionIconSmall, { backgroundColor: colors.secondary + '20' }]}>
            <FolderOpen size={14} color={colors.secondary} />
          </View>
          <Text style={[styles.suggestionText, { color: colors.text }]} numberOfLines={1}>Move 67 social notifications</Text>
        </View>
      </View>
    </AccessibleButton>
  );
}


