import React, { useMemo } from 'react';
import { View, TouchableOpacity, FlatList } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { Search, Clock, TrendingUp } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { searchStyles } from '../styles/searchStyles';
import type { EmailMessage } from '@/constants/types';

interface SearchSuggestionsProps {
  query: string;
  searchHistory: string[];
  emails: EmailMessage[];
  onSelect: (term: string) => void;
  maxSuggestions?: number;
}

/**
 * SearchSuggestions - Shows autocomplete suggestions based on query, history, and email data
 * 
 * @example
 * <SearchSuggestions
 *   query="invoice"
 *   searchHistory={history}
 *   emails={allEmails}
 *   onSelect={handleSelect}
 * />
 */
export function SearchSuggestions({
  query,
  searchHistory,
  emails,
  onSelect,
  maxSuggestions = 5,
}: SearchSuggestionsProps) {
  const { colors } = useTheme();

  const suggestions = useMemo(() => {
    if (!query.trim() || query.length < 2) {
      return [];
    }

    const lowerQuery = query.toLowerCase();
    const suggestionsSet = new Set<string>();

    // 1. Suggest from search history
    searchHistory
      .filter(term => term.toLowerCase().includes(lowerQuery) && term.toLowerCase() !== lowerQuery)
      .slice(0, 2)
      .forEach(term => suggestionsSet.add(term));

    // 2. Suggest from email subjects (common words)
    const subjectWords = new Set<string>();
    emails.forEach(email => {
      if (email.subject) {
        const words = email.subject.toLowerCase().split(/\s+/);
        words.forEach(word => {
          if (word.length >= 3 && word.includes(lowerQuery) && !word.toLowerCase().startsWith('re:') && !word.toLowerCase().startsWith('fw:')) {
            subjectWords.add(word);
          }
        });
      }
    });
    
    Array.from(subjectWords).slice(0, 3).forEach(word => suggestionsSet.add(word));

    // 3. Suggest from sender names
    const senderNames = new Set<string>();
    emails.forEach(email => {
      const sender = email.from.split('<')[0].trim().toLowerCase();
      if (sender && sender.includes(lowerQuery)) {
        senderNames.add(email.from.split('<')[0].trim());
      }
    });
    
    Array.from(senderNames).slice(0, 2).forEach(name => suggestionsSet.add(name));

    // Convert to array and limit results
    return Array.from(suggestionsSet).slice(0, maxSuggestions);
  }, [query, searchHistory, emails, maxSuggestions]);

  if (suggestions.length === 0) {
    return null;
  }

  const renderSuggestion = ({ item }: { item: string }) => {
    // Determine icon based on source (simplified - could be enhanced)
    const isFromHistory = searchHistory.includes(item);
    const Icon = isFromHistory ? Clock : TrendingUp;

    return (
      <TouchableOpacity
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`Search for ${item}`}
        accessibilityHint="Double tap to use this search suggestion"
        style={[searchStyles.suggestionItem, { borderBottomColor: colors.border }]}
        onPress={() => onSelect(item)}
      >
        <View style={[searchStyles.suggestionIcon, { backgroundColor: colors.surface }]}>
          <Icon size={16} color={colors.textSecondary} />
        </View>
        <AppText style={[searchStyles.suggestionText, { color: colors.text }]} numberOfLines={1} dynamicTypeStyle="body">
          {item}
        </AppText>
      </TouchableOpacity>
    );
  };

  return (
    <View style={searchStyles.suggestionsSection}>
      <AppText style={[searchStyles.suggestionsTitle, { color: colors.textSecondary }]} dynamicTypeStyle="caption">
        Suggestions
      </AppText>
      <FlatList
        data={suggestions}
        renderItem={renderSuggestion}
        keyExtractor={(item, index) => `${item}-${index}`}
        scrollEnabled={false}
      />
    </View>
  );
}

