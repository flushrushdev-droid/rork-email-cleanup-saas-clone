import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
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
      <Text style={[searchStyles.historyTitle, { color: colors.text }]}>Recent email searches</Text>
      {history.map((term, index) => (
        <TouchableOpacity
          key={index}
          style={[searchStyles.historyItem, { borderBottomColor: colors.border }]}
          onPress={() => onSelect(term)}
        >
          <View style={[searchStyles.historyIcon, { backgroundColor: colors.surface }]}>
            <Search size={16} color={colors.textSecondary} />
          </View>
          <Text style={[searchStyles.historyText, { color: colors.text }]}>{term}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

