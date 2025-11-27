import React, { useState, useMemo } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { 
  Trash2, 
  Archive, 
  MailX, 
  FolderPlus, 
  Settings2, 
  TrendingDown,
  Calendar,
  Activity,
} from 'lucide-react-native';
import { useHistory } from '@/contexts/HistoryContext';
import { useTheme } from '@/contexts/ThemeContext';
import type { HistoryEntry, HistoryActionType } from '@/constants/types';
import { formatRelativeDate } from '@/utils/relativeDateFormat';
import { createHistoryStyles } from '@/styles/app/history';
import { HistoryItemCard, ACTION_LABELS } from '@/components/history/HistoryItemCard';
import { useEnhancedToast } from '@/hooks/useEnhancedToast';
import { EmptyState } from '@/components/common/EmptyState';

export default function HistoryScreen() {
  const { entries, getStats, clearHistory } = useHistory();
  const { colors } = useTheme();
  const [filter, setFilter] = useState<HistoryActionType | 'all'>('all');
  const insets = useSafeAreaInsets();
  const styles = React.useMemo(() => createHistoryStyles(colors), [colors]);
  const { showWarning } = useEnhancedToast();
  
  const stats = useMemo(() => getStats(), [getStats]);

  const filteredEntries = useMemo(() => {
    if (filter === 'all') return entries;
    return entries.filter(e => e.type === filter);
  }, [entries, filter]);


  const getActionColor = (type: HistoryActionType): string => {
    const colorMap: Record<HistoryActionType, keyof typeof colors> = {
      email_deleted: 'danger',
      email_archived: 'info',
      email_marked_read: 'success',
      newsletter_unsubscribed: 'warning',
      folder_created: 'primary',
      rule_created: 'secondary',
      sender_blocked: 'danger',
      sender_muted: 'textSecondary',
      bulk_delete: 'danger',
      bulk_archive: 'info',
    };
    return colors[colorMap[type]];
  };


  const handleClearHistory = () => {
    showWarning('Are you sure you want to clear all history? This cannot be undone.', {
      action: {
        label: 'Clear',
        style: 'destructive',
        onPress: clearHistory,
      },
      duration: 0,
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: 'History',
          headerShown: true,
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
        }}
      />

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 16 }]} showsVerticalScrollIndicator={false}>

        <TouchableOpacity 
          style={[styles.clearHistoryButton, { 
            backgroundColor: colors.surface,
            borderColor: colors.danger + '30',
          }]}
          onPress={handleClearHistory}
          activeOpacity={0.7}
        >
          <Trash2 size={20} color={colors.danger} />
          <AppText style={[styles.clearHistoryText, { color: colors.danger }]} dynamicTypeStyle="headline">Clear History</AppText>
        </TouchableOpacity>

        <View style={styles.summarySection}>
          <AppText style={[styles.sectionTitle, { color: colors.text }]} dynamicTypeStyle="headline">Summary (60 Days)</AppText>
          
          <View style={styles.summaryGrid}>
            <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
              <View style={[styles.summaryIcon, { backgroundColor: colors.danger + '20' }]}>
                <Trash2 size={24} color={colors.danger} />
              </View>
              <AppText style={[styles.summaryValue, { color: colors.text }]} dynamicTypeStyle="title2">{stats.deletedEmails}</AppText>
              <AppText style={[styles.summaryLabel, { color: colors.textSecondary }]} dynamicTypeStyle="caption">Emails Deleted</AppText>
            </View>

            <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
              <View style={[styles.summaryIcon, { backgroundColor: colors.info + '20' }]}>
                <Archive size={24} color={colors.info} />
              </View>
              <AppText style={[styles.summaryValue, { color: colors.text }]} dynamicTypeStyle="title2">{stats.archivedEmails}</AppText>
              <AppText style={[styles.summaryLabel, { color: colors.textSecondary }]} dynamicTypeStyle="caption">Emails Archived</AppText>
            </View>

            <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
              <View style={[styles.summaryIcon, { backgroundColor: colors.warning + '20' }]}>
                <MailX size={24} color={colors.warning} />
              </View>
              <AppText style={[styles.summaryValue, { color: colors.text }]} dynamicTypeStyle="title2">{stats.unsubscribedCount}</AppText>
              <AppText style={[styles.summaryLabel, { color: colors.textSecondary }]} dynamicTypeStyle="caption">Unsubscribed</AppText>
            </View>

            <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
              <View style={[styles.summaryIcon, { backgroundColor: colors.primary + '20' }]}>
                <FolderPlus size={24} color={colors.primary} />
              </View>
              <AppText style={[styles.summaryValue, { color: colors.text }]} dynamicTypeStyle="title2">{stats.foldersCreated}</AppText>
              <AppText style={[styles.summaryLabel, { color: colors.textSecondary }]} dynamicTypeStyle="caption">Folders Created</AppText>
            </View>
          </View>
        </View>

        <View style={styles.filterSection}>
          <AppText style={[styles.sectionTitle, { color: colors.text }]} dynamicTypeStyle="headline">Filter by Action</AppText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            <TouchableOpacity
              style={[
                styles.filterChip,
                { backgroundColor: colors.surface, borderColor: colors.border },
                filter === 'all' && { backgroundColor: colors.primary, borderColor: colors.primary }
              ]}
              onPress={() => setFilter('all')}
            >
              <AppText style={[
                styles.filterChipText,
                { color: colors.text },
                filter === 'all' && styles.filterChipTextActive
              ]} dynamicTypeStyle="caption">
                All ({entries.length})
              </AppText>
            </TouchableOpacity>
            
            {Object.entries(ACTION_LABELS).map(([type, label]) => {
              const count = entries.filter(e => e.type === type).length;
              if (count === 0) return null;
              
              return (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.filterChip,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                    filter === type && { backgroundColor: colors.primary, borderColor: colors.primary }
                  ]}
                  onPress={() => setFilter(type as HistoryActionType)}
                >
                  <AppText style={[
                    styles.filterChipText,
                    { color: colors.text },
                    filter === type && styles.filterChipTextActive
                  ]} dynamicTypeStyle="caption">
                    {label} ({count})
                  </AppText>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.historySection}>
          <AppText style={[styles.sectionTitle, { color: colors.text }]} dynamicTypeStyle="headline">Recent Activity</AppText>
          
          {filteredEntries.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No history yet"
              description="Your actions will appear here"
              iconSize={48}
              style={styles.emptyState}
            />
          ) : (
            filteredEntries.map((entry) => (
              <HistoryItemCard
                key={entry.id}
                entry={entry}
                getActionColor={getActionColor}
                formatDate={formatRelativeDate}
                colors={colors}
              />
            ))
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}
