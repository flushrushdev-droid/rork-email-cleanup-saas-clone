import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Search } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { searchStyles } from './styles/searchStyles';

interface InboxSearchBarProps {
  isSearchFocused: boolean;
  onSearchFocus: () => void;
  searchQuery: string;
}

export function InboxSearchBar({
  isSearchFocused,
  onSearchFocus,
  searchQuery,
}: InboxSearchBarProps) {
  const { colors } = useTheme();

  if (isSearchFocused) {
    return null;
  }

  return (
    <TouchableOpacity
      style={[searchStyles.searchContainer, { backgroundColor: colors.surface }]}
      onPress={onSearchFocus}
      activeOpacity={0.8}
    >
      <Search size={18} color={colors.textSecondary} />
      <Text style={[searchStyles.searchPlaceholder, { color: colors.textSecondary }]}>
        {searchQuery || 'Search mail'}
      </Text>
    </TouchableOpacity>
  );
}

