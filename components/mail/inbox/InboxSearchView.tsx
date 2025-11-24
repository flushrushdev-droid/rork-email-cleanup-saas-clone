import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import type { EmailMessage } from '@/constants/types';
import { searchStyles } from './styles/searchStyles';
import { emailListStyles } from './styles/emailListStyles';
import { SearchHistory } from './search/SearchHistory';
import { ActiveFilters } from './search/ActiveFilters';
import { getFilteredSearchResults } from './utils/searchUtils';
import { getInitial } from './utils/avatarUtils';

interface InboxSearchViewProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onClose: () => void;
  filteredEmails: EmailMessage[];
  appliedLabelFilter: string | null;
  appliedAttachmentFilter: string | null;
  appliedContactFilter: { name: string; email: string } | null;
  onClearLabelFilter: () => void;
  onClearAttachmentFilter: () => void;
  onClearContactFilter: () => void;
  onEmailPress: (email: EmailMessage) => void;
  searchHistory: string[];
  onActiveFilterModalChange: (modal: 'labels' | 'from' | 'to' | 'attachment' | null) => void;
}

export function InboxSearchView({
  searchQuery,
  onSearchChange,
  onClose,
  filteredEmails,
  appliedLabelFilter,
  appliedAttachmentFilter,
  appliedContactFilter,
  onClearLabelFilter,
  onClearAttachmentFilter,
  onClearContactFilter,
  onEmailPress,
  searchHistory,
  onActiveFilterModalChange,
}: InboxSearchViewProps) {
  const { colors } = useTheme();

  const handleClose = () => {
    onClose();
    onClearLabelFilter();
    onClearAttachmentFilter();
    onClearContactFilter();
  };

  const handleEmailPress = (email: EmailMessage) => {
    handleClose();
    onEmailPress(email);
  };

  const results = getFilteredSearchResults(
    filteredEmails,
    searchQuery,
    appliedLabelFilter,
    appliedAttachmentFilter,
    appliedContactFilter
  );

  const showHistory = searchQuery.length === 0 && 
    searchHistory.length > 0 && 
    !appliedLabelFilter && 
    !appliedAttachmentFilter && 
    !appliedContactFilter;

  const showResults = searchQuery.length > 0 || 
    appliedLabelFilter || 
    appliedAttachmentFilter || 
    appliedContactFilter;

  return (
    <View style={[searchStyles.searchView, { backgroundColor: colors.background }]}>
      <View style={[searchStyles.searchHeader, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={handleClose} style={searchStyles.backButton}>
          <X size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={[searchStyles.searchInputContainer, { backgroundColor: colors.surface }]}>
          <Search size={18} color={colors.textSecondary} />
          <TextInput
            style={[searchStyles.searchInput, { color: colors.text }]}
            placeholder="Search in emails"
            value={searchQuery}
            onChangeText={onSearchChange}
            placeholderTextColor={colors.textSecondary}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => onSearchChange('')}>
              <X size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={searchStyles.searchContent} showsVerticalScrollIndicator={false}>
        <View style={searchStyles.filterRow}>
          <TouchableOpacity
            style={[searchStyles.filterButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => onActiveFilterModalChange('labels')}
          >
            <Text style={[searchStyles.filterButtonText, { color: colors.text }]}>Labels</Text>
            <Text style={[searchStyles.filterArrow, { color: colors.textSecondary }]}>▼</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[searchStyles.filterButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => onActiveFilterModalChange('from')}
          >
            <Text style={[searchStyles.filterButtonText, { color: colors.text }]}>From</Text>
            <Text style={[searchStyles.filterArrow, { color: colors.textSecondary }]}>▼</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[searchStyles.filterButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => onActiveFilterModalChange('to')}
          >
            <Text style={[searchStyles.filterButtonText, { color: colors.text }]}>To</Text>
            <Text style={[searchStyles.filterArrow, { color: colors.textSecondary }]}>▼</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[searchStyles.filterButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => onActiveFilterModalChange('attachment')}
          >
            <Text style={[searchStyles.filterButtonText, { color: colors.text }]}>Attachment</Text>
            <Text style={[searchStyles.filterArrow, { color: colors.textSecondary }]}>▼</Text>
          </TouchableOpacity>
        </View>

        {showHistory && (
          <SearchHistory history={searchHistory} onSelect={onSearchChange} />
        )}

        {showResults && (
          <View style={searchStyles.searchResults}>
            <ActiveFilters
              labelFilter={appliedLabelFilter}
              attachmentFilter={appliedAttachmentFilter}
              contactFilter={appliedContactFilter}
              onClearLabel={onClearLabelFilter}
              onClearAttachment={onClearAttachmentFilter}
              onClearContact={onClearContactFilter}
            />
            <Text style={[searchStyles.resultsTitle, { color: colors.text }]}>
              {results.length} results
            </Text>
            {results.slice(0, 50).map((email) => {
              const senderName = email.from.split('<')[0].trim() || email.from;
              const senderInitial = getInitial(senderName);
              const senderColor = `hsl(${senderInitial.charCodeAt(0) * 137.5 % 360}, 70%, 50%)`;

              return (
                <TouchableOpacity
                  key={email.id}
                  style={[searchStyles.searchResultItem, { borderBottomColor: colors.border }]}
                  onPress={() => handleEmailPress(email)}
                >
                  <View style={[emailListStyles.senderAvatar, { backgroundColor: senderColor }]}>
                    <Text style={emailListStyles.senderInitial}>{senderInitial}</Text>
                  </View>
                  <View style={searchStyles.searchResultContent}>
                    <Text style={[searchStyles.searchResultSubject, { color: colors.text }]} numberOfLines={1}>
                      {email.subject}
                    </Text>
                    <Text style={[searchStyles.searchResultFrom, { color: colors.textSecondary }]} numberOfLines={1}>
                      {email.from}
                    </Text>
                    <Text style={[searchStyles.searchResultSnippet, { color: colors.textSecondary }]} numberOfLines={2}>
                      {email.snippet}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

