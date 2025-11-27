import React from 'react';
import { View, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { Search, X } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import type { EmailMessage } from '@/constants/types';
import { searchStyles } from './styles/searchStyles';
import { emailListStyles } from './styles/emailListStyles';
import { SearchHistory } from './search/SearchHistory';
import { SearchSuggestions } from './search/SearchSuggestions';
import { SearchResultHighlight } from './search/SearchResultHighlight';
import { ActiveFilters } from './search/ActiveFilters';
import { getFilteredSearchResults } from './utils/searchUtils';
import { getInitial } from './utils/avatarUtils';
import { EmptyState } from '@/components/common/EmptyState';

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

  // Show suggestions when typing and no filters, but only if we don't have results yet
  const showSuggestions = searchQuery.length >= 2 && 
    results.length === 0 && 
    !appliedLabelFilter && 
    !appliedAttachmentFilter && 
    !appliedContactFilter;

  // Show results when we have a query or filters applied and results exist
  const showResults = (searchQuery.length > 0 || 
    appliedLabelFilter || 
    appliedAttachmentFilter || 
    appliedContactFilter) && (results.length > 0 || !showSuggestions);

  return (
    <View style={[searchStyles.searchView, { backgroundColor: colors.background }]}>
      <View style={[searchStyles.searchHeader, { borderBottomColor: colors.border }]}>
        <TouchableOpacity 
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Close search"
          accessibilityHint="Double tap to close search and return to inbox"
          onPress={handleClose} 
          style={searchStyles.backButton}
        >
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
            accessible={true}
            accessibilityLabel="Search emails"
            accessibilityHint="Enter search terms to find emails by subject, sender, or content"
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Clear search"
              accessibilityHint="Double tap to clear the search query"
              onPress={() => onSearchChange('')}
            >
              <X size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={searchStyles.searchContent} showsVerticalScrollIndicator={false}>
        <View style={searchStyles.filterRow}>
          <TouchableOpacity
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Filter by labels"
            accessibilityHint="Double tap to filter search results by labels"
            style={[searchStyles.filterButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => onActiveFilterModalChange('labels')}
          >
            <AppText style={[searchStyles.filterButtonText, { color: colors.text }]} dynamicTypeStyle="body">Labels</AppText>
            <AppText style={[searchStyles.filterArrow, { color: colors.textSecondary }]} dynamicTypeStyle="caption">▼</AppText>
          </TouchableOpacity>
          <TouchableOpacity
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Filter by sender"
            accessibilityHint="Double tap to filter search results by sender"
            style={[searchStyles.filterButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => onActiveFilterModalChange('from')}
          >
            <AppText style={[searchStyles.filterButtonText, { color: colors.text }]} dynamicTypeStyle="body">From</AppText>
            <AppText style={[searchStyles.filterArrow, { color: colors.textSecondary }]} dynamicTypeStyle="caption">▼</AppText>
          </TouchableOpacity>
          <TouchableOpacity
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Filter by recipient"
            accessibilityHint="Double tap to filter search results by recipient"
            style={[searchStyles.filterButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => onActiveFilterModalChange('to')}
          >
            <AppText style={[searchStyles.filterButtonText, { color: colors.text }]} dynamicTypeStyle="body">To</AppText>
            <AppText style={[searchStyles.filterArrow, { color: colors.textSecondary }]} dynamicTypeStyle="caption">▼</AppText>
          </TouchableOpacity>
          <TouchableOpacity
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Filter by attachments"
            accessibilityHint="Double tap to filter search results by attachments"
            style={[searchStyles.filterButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => onActiveFilterModalChange('attachment')}
          >
            <AppText style={[searchStyles.filterButtonText, { color: colors.text }]} dynamicTypeStyle="body">Attachment</AppText>
            <AppText style={[searchStyles.filterArrow, { color: colors.textSecondary }]} dynamicTypeStyle="caption">▼</AppText>
          </TouchableOpacity>
        </View>

        {showHistory && (
          <SearchHistory history={searchHistory} onSelect={onSearchChange} />
        )}

        {showSuggestions && (
          <SearchSuggestions
            query={searchQuery}
            searchHistory={searchHistory}
            emails={filteredEmails}
            onSelect={onSearchChange}
          />
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
            {results.length === 0 ? (
              <EmptyState
                icon={Search}
                title="No search results"
                description="Try adjusting your search terms or filters"
                iconSize={48}
                style={searchStyles.emptyState}
              />
            ) : (
              <>
                <AppText style={[searchStyles.resultsTitle, { color: colors.text }]} dynamicTypeStyle="headline">
                  {results.length} results
                </AppText>
                {results.slice(0, 50).map((email) => {
              const senderName = email.from.split('<')[0].trim() || email.from;
              const senderInitial = getInitial(senderName);
              const senderColor = `hsl(${senderInitial.charCodeAt(0) * 137.5 % 360}, 70%, 50%)`;

              return (
                <TouchableOpacity
                  key={email.id}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={`Email from ${email.from.split('<')[0].trim() || email.from}, subject: ${email.subject || 'No subject'}`}
                  accessibilityHint="Double tap to view this email"
                  style={[searchStyles.searchResultItem, { borderBottomColor: colors.border }]}
                  onPress={() => handleEmailPress(email)}
                >
                  <View style={[emailListStyles.senderAvatar, { backgroundColor: senderColor }]}>
                    <AppText style={emailListStyles.senderInitial} dynamicTypeStyle="body">{senderInitial}</AppText>
                  </View>
                  <View style={searchStyles.searchResultContent}>
                    <SearchResultHighlight
                      text={email.subject || 'No subject'}
                      searchQuery={searchQuery}
                      style={[searchStyles.searchResultSubject, { color: colors.text }]}
                      highlightStyle={{ backgroundColor: colors.primary + '30', fontWeight: '600' as const }}
                      numberOfLines={1}
                    />
                    <SearchResultHighlight
                      text={email.from}
                      searchQuery={searchQuery}
                      style={[searchStyles.searchResultFrom, { color: colors.textSecondary }]}
                      highlightStyle={{ backgroundColor: colors.primary + '30', fontWeight: '600' as const }}
                      numberOfLines={1}
                    />
                    <SearchResultHighlight
                      text={email.snippet}
                      searchQuery={searchQuery}
                      style={[searchStyles.searchResultSnippet, { color: colors.textSecondary }]}
                      highlightStyle={{ backgroundColor: colors.primary + '30', fontWeight: '600' as const }}
                      numberOfLines={2}
                    />
                  </View>
                </TouchableOpacity>
              );
            })}
              </>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

