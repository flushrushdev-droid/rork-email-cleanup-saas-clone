import React from 'react';
import { View, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { X, Inbox, FolderOpen, Plus } from 'lucide-react-native';
import { router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import type { FilterType, SmartFolder } from './types';
import { sidebarStyles } from './styles/sidebarStyles';
import { iconMap } from './constants';

interface InboxSidebarProps {
  isVisible: boolean;
  onClose: () => void;
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  smartFolders: SmartFolder[];
  customFolders: Array<{ id: string; name: string; color: string; count: number }>;
  folderCounts: Record<string, number>;
  onCreateFolder: () => void;
  insets: { top: number; bottom: number; left: number; right: number };
  sidebarSlideAnim: Animated.Value;
}

export function InboxSidebar({
  isVisible,
  onClose,
  activeFilter,
  onFilterChange,
  smartFolders,
  customFolders,
  folderCounts,
  onCreateFolder,
  insets,
  sidebarSlideAnim,
}: InboxSidebarProps) {
  const { colors } = useTheme();

  const handleFilterChange = (filter: FilterType) => {
    onFilterChange(filter);
    onClose();
  };

  const handleFolderPress = (folder: { name: string; category?: string; color: string; isCustom?: boolean }) => {
    router.push({
      pathname: '/folder-details',
      params: {
        folderName: folder.name,
        category: folder.category || '',
        folderColor: folder.color,
        ...(folder.isCustom ? { isCustom: '1' } : {}),
      },
    });
    onClose();
  };

  return (
    <>
      <Animated.View style={[
        sidebarStyles.sidebar,
        { backgroundColor: colors.background, left: sidebarSlideAnim, paddingTop: insets.top }
      ]}>
        <View style={[sidebarStyles.sidebarHeader, { borderBottomColor: colors.border }]}>
          <AppText style={[sidebarStyles.sidebarTitle, { color: colors.text }]} dynamicTypeStyle="title2">Filters & Folders</AppText>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={sidebarStyles.sidebarContent} showsVerticalScrollIndicator={false}>
          {/* Mail Filters Section */}
          <View style={sidebarStyles.sidebarSection}>
            <View style={sidebarStyles.sectionHeader}>
              <Inbox size={20} color={colors.primary} />
              <AppText style={[sidebarStyles.sectionTitle, { color: colors.text }]} dynamicTypeStyle="headline">Mail</AppText>
            </View>
            
            {(['all', 'unread', 'starred', 'drafts', 'drafts-ai', 'sent', 'archived', 'trash'] as const).map((filter) => {
              const count = folderCounts[filter] || 0;
              return (
                <TouchableOpacity
                  key={filter}
                  testID={`sidebar-filter-${filter}`}
                  style={[
                    sidebarStyles.sidebarItem,
                    { backgroundColor: activeFilter === filter ? colors.primary + '15' : 'transparent' }
                  ]}
                  onPress={() => handleFilterChange(filter)}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <AppText style={[
                      sidebarStyles.sidebarItemText,
                      { color: activeFilter === filter ? colors.primary : colors.text }
                    ]} dynamicTypeStyle="body">
                      {filter === 'drafts-ai' ? 'Drafts By AI' : filter.charAt(0).toUpperCase() + filter.slice(1)}
                    </AppText>
                    {activeFilter === filter && (
                      <View style={[sidebarStyles.activeIndicator, { backgroundColor: colors.primary, marginLeft: 8 }]} />
                    )}
                  </View>
                  <View style={[sidebarStyles.folderBadge, { backgroundColor: activeFilter === filter ? colors.primary : colors.surface }]}>
                    <AppText style={[
                      sidebarStyles.folderBadgeText,
                      { color: activeFilter === filter ? colors.surface : colors.textSecondary }
                    ]} dynamicTypeStyle="caption">
                      {count}
                    </AppText>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* My Folders (custom) Section */}
          {customFolders.length > 0 && (
            <View style={sidebarStyles.sidebarSection}>
              <View style={sidebarStyles.sectionHeader}>
                <FolderOpen size={20} color={colors.secondary} />
                <AppText style={[sidebarStyles.sectionTitle, { color: colors.text }]} dynamicTypeStyle="headline">My Folders</AppText>
              </View>
              {customFolders.map((folder) => (
                <TouchableOpacity
                  key={folder.id}
                  testID={`sidebar-folder-custom-${folder.id}`}
                  style={sidebarStyles.sidebarItem}
                  onPress={() => handleFolderPress({ ...folder, isCustom: true })}
                >
                  <View style={sidebarStyles.folderItemContent}>
                    <View style={[sidebarStyles.folderIcon, { backgroundColor: (folder.color || colors.primary) + '20' }]}>
                      <FolderOpen size={16} color={folder.color || colors.primary} />
                    </View>
                    <AppText style={[sidebarStyles.sidebarItemText, { color: colors.text }]} dynamicTypeStyle="body">{folder.name}</AppText>
                  </View>
                  <View style={[sidebarStyles.folderBadge, { backgroundColor: folder.color || colors.primary }]}>
                    <AppText style={sidebarStyles.folderBadgeText} dynamicTypeStyle="caption">{folder.count ?? 0}</AppText>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Smart Folders Section */}
          {smartFolders.length > 0 && (
            <View style={sidebarStyles.sidebarSection}>
              <View style={sidebarStyles.sectionHeader}>
                <FolderOpen size={20} color={colors.secondary} />
                <AppText style={[sidebarStyles.sectionTitle, { color: colors.text }]} dynamicTypeStyle="headline">Folders</AppText>
              </View>

              {smartFolders.map((folder) => {
                const Icon = iconMap[folder.icon] || FolderOpen;
                return (
                  <TouchableOpacity
                    key={folder.id}
                    testID={`sidebar-folder-${folder.id}`}
                    style={sidebarStyles.sidebarItem}
                    onPress={() => handleFolderPress(folder)}
                  >
                    <View style={sidebarStyles.folderItemContent}>
                      <View style={[sidebarStyles.folderIcon, { backgroundColor: folder.color + '20' }]}>
                        <Icon size={16} color={folder.color} />
                      </View>
                      <AppText style={[sidebarStyles.sidebarItemText, { color: colors.text }]} dynamicTypeStyle="body">{folder.name}</AppText>
                    </View>
                    <View style={[sidebarStyles.folderBadge, { backgroundColor: folder.color }]}>
                      <AppText style={sidebarStyles.folderBadgeText} dynamicTypeStyle="caption">{folder.count}</AppText>
                    </View>
                  </TouchableOpacity>
                );
              })}

              <TouchableOpacity
                testID="sidebar-create-folder"
                style={[sidebarStyles.sidebarItem, { borderTopWidth: 1, borderTopColor: colors.border, marginTop: 8, paddingTop: 16 }]}
                onPress={() => {
                  onCreateFolder();
                  onClose();
                }}
              >
                <View style={sidebarStyles.folderItemContent}>
                  <View style={[sidebarStyles.folderIcon, { backgroundColor: colors.primary + '20' }]}>
                    <Plus size={16} color={colors.primary} />
                  </View>
                  <AppText style={[sidebarStyles.sidebarItemText, { color: colors.primary }]} dynamicTypeStyle="body">Create Folder</AppText>
                </View>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </Animated.View>

      {/* Overlay */}
      {isVisible && (
        <TouchableOpacity
          style={sidebarStyles.sidebarOverlay}
          activeOpacity={1}
          onPress={onClose}
        />
      )}
    </>
  );
}

