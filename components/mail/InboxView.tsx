import React from 'react';
import { View, Animated } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { InboxViewProps } from './inbox/types';
import { InboxHeader } from './inbox/InboxHeader';
import { InboxSearchBar } from './inbox/InboxSearchBar';
import { InboxSearchView } from './inbox/InboxSearchView';
import { InboxEmailList } from './inbox/InboxEmailList';
import { InboxSidebar } from './inbox/InboxSidebar';
import { InboxSelectionToolbar } from './inbox/InboxSelectionToolbar';
import { AttachmentFilterModal, LabelsFilterModal, ContactFilterModal } from './inbox/filters';
import { containerStyle } from './inbox/styles';
import { defaultSearchHistory } from './inbox/constants';

export function InboxView({
  insets,
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
  filteredEmails,
  drafts,
  smartFolders,
  customFolders,
  folderCounts,
  onEmailPress,
  onStarEmail,
  onLoadDraft,
  onDeleteDraft,
  onArchive,
  onDelete,
  onCreateFolder,
  selectionMode,
  selectedEmails,
  onToggleSelection,
  onSelectAll,
  onCancelSelection,
  onBulkDelete,
  onBulkArchive,
  onBulkMarkRead,
  onBulkMove,
  onCompose,
  onRefresh,
  isRefreshing = false,
  isLoading = false,
}: InboxViewProps) {
  const { colors } = useTheme();
  const [isSidebarVisible, setIsSidebarVisible] = React.useState(false);
  const [isSearchFocused, setIsSearchFocused] = React.useState(false);
  
  // Clear persisted folders on mount (demo mode)
  React.useEffect(() => {
    AsyncStorage.removeItem('custom-folders-v1').catch(() => {});
  }, []);

  const [activeFilterModal, setActiveFilterModal] = React.useState<'labels' | 'from' | 'to' | 'attachment' | null>(null);
  const [labelSearchQuery, setLabelSearchQuery] = React.useState('');
  const [contactSearchQuery, setContactSearchQuery] = React.useState('');
  const [appliedLabelFilter, setAppliedLabelFilter] = React.useState<string | null>(null);
  const [appliedAttachmentFilter, setAppliedAttachmentFilter] = React.useState<string | null>(null);
  const [appliedContactFilter, setAppliedContactFilter] = React.useState<{ name: string; email: string } | null>(null);
  const [searchHistory] = React.useState<string[]>(defaultSearchHistory);
  
  const sidebarSlideAnim = React.useRef(new Animated.Value(-300)).current;

  React.useEffect(() => {
    Animated.timing(sidebarSlideAnim, {
      toValue: isSidebarVisible ? 0 : -300,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [isSidebarVisible, sidebarSlideAnim]);

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  const handleCloseSearch = () => {
    setIsSearchFocused(false);
    setAppliedLabelFilter(null);
    setAppliedAttachmentFilter(null);
    setAppliedContactFilter(null);
  };

  return (
    <View style={[containerStyle.container, { backgroundColor: colors.background }]}>
      <InboxHeader
        insets={insets}
        activeFilter={activeFilter}
        selectionMode={selectionMode}
        selectedEmails={selectedEmails}
        onCancelSelection={onCancelSelection}
        onSelectAll={onSelectAll}
        onToggleSidebar={toggleSidebar}
        onCompose={onCompose}
      />

      {!isSearchFocused && (
        <InboxSearchBar
          isSearchFocused={isSearchFocused}
          onSearchFocus={() => setIsSearchFocused(true)}
          searchQuery={searchQuery}
        />
      )}

      {isSearchFocused ? (
        <InboxSearchView
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          onClose={handleCloseSearch}
          filteredEmails={filteredEmails}
          appliedLabelFilter={appliedLabelFilter}
          appliedAttachmentFilter={appliedAttachmentFilter}
          appliedContactFilter={appliedContactFilter}
          onClearLabelFilter={() => setAppliedLabelFilter(null)}
          onClearAttachmentFilter={() => setAppliedAttachmentFilter(null)}
          onClearContactFilter={() => setAppliedContactFilter(null)}
          onEmailPress={onEmailPress}
          searchHistory={searchHistory}
          onActiveFilterModalChange={setActiveFilterModal}
        />
      ) : (
        <InboxEmailList
          filteredEmails={filteredEmails}
          activeFilter={activeFilter}
          drafts={drafts}
          selectionMode={selectionMode}
          selectedEmails={selectedEmails}
          onEmailPress={onEmailPress}
          onStarEmail={onStarEmail}
          onToggleSelection={onToggleSelection}
          onLoadDraft={onLoadDraft}
          onDeleteDraft={onDeleteDraft}
          onArchive={onArchive}
          onDelete={onDelete}
          insets={insets}
          onRefresh={onRefresh}
          isRefreshing={isRefreshing}
          isLoading={isLoading}
        />
      )}

      {selectionMode && (
        <InboxSelectionToolbar
          selectedCount={selectedEmails.size}
          onArchive={onBulkArchive}
          onDelete={onBulkDelete}
          onMove={onBulkMove}
          onMarkRead={onBulkMarkRead}
          insets={insets}
        />
      )}

      <InboxSidebar
        isVisible={isSidebarVisible}
        onClose={toggleSidebar}
        activeFilter={activeFilter}
        onFilterChange={onFilterChange}
        smartFolders={smartFolders}
        customFolders={customFolders}
        folderCounts={folderCounts}
        onCreateFolder={onCreateFolder}
        insets={insets}
        sidebarSlideAnim={sidebarSlideAnim}
      />

      {/* Filter Modals */}
      <AttachmentFilterModal
        visible={activeFilterModal === 'attachment'}
        onClose={() => setActiveFilterModal(null)}
        onSelect={setAppliedAttachmentFilter}
      />

      <LabelsFilterModal
        visible={activeFilterModal === 'labels'}
        onClose={() => {
          setActiveFilterModal(null);
          setLabelSearchQuery('');
        }}
        onSelect={setAppliedLabelFilter}
        searchQuery={labelSearchQuery}
        onSearchChange={setLabelSearchQuery}
      />

      <ContactFilterModal
        visible={activeFilterModal === 'from' || activeFilterModal === 'to'}
        onClose={() => {
          setActiveFilterModal(null);
          setContactSearchQuery('');
        }}
        onSelect={setAppliedContactFilter}
        type={activeFilterModal === 'to' ? 'to' : 'from'}
        searchQuery={contactSearchQuery}
        onSearchChange={setContactSearchQuery}
      />
    </View>
  );
}
