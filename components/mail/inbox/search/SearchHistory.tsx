import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { Search } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { searchStyles } from '../styles/searchStyles';

interface SearchHistoryProps {
  history: string[];
  onSelect: (term: string) => void;
}

export function SearchHistory({ history, onSelect }: SearchHistoryProps) {
  const { colors } = useTheme();

  if (history.length === 0) {
    return null;
  }

  return (
    <View style={searchStyles.historySection}>
      <AppText style={[searchStyles.historyTitle, { color: colors.text }]} dynamicTypeStyle="headline">Recent email searches</AppText>
      {history.map((term, index) => (
        <TouchableOpacity
          key={index}
          style={[searchStyles.historyItem, { borderBottomColor: colors.border }]}
          onPress={() => onSelect(term)}
        >
          <View style={[searchStyles.historyIcon, { backgroundColor: colors.surface }]}>
            <Search size={16} color={colors.textSecondary} />
          </View>
          <AppText style={[searchStyles.historyText, { color: colors.text }]} dynamicTypeStyle="body">{term}</AppText>
        </TouchableOpacity>
      ))}
    </View>
  );
}

