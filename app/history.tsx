import React, { useState, useMemo } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
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
import Colors from '@/constants/colors';
import type { HistoryEntry, HistoryActionType } from '@/constants/types';

const ACTION_ICONS: Record<HistoryActionType, React.ComponentType<any>> = {
  email_deleted: Trash2,
  email_archived: Archive,
  email_marked_read: Activity,
  newsletter_unsubscribed: MailX,
  folder_created: FolderPlus,
  rule_created: Settings2,
  sender_blocked: TrendingDown,
  sender_muted: TrendingDown,
  bulk_delete: Trash2,
  bulk_archive: Archive,
};

const ACTION_COLORS: Record<HistoryActionType, string> = {
  email_deleted: Colors.light.danger,
  email_archived: Colors.light.info,
  email_marked_read: Colors.light.success,
  newsletter_unsubscribed: Colors.light.warning,
  folder_created: Colors.light.primary,
  rule_created: Colors.light.secondary,
  sender_blocked: Colors.light.danger,
  sender_muted: Colors.light.textSecondary,
  bulk_delete: Colors.light.danger,
  bulk_archive: Colors.light.info,
};

const ACTION_LABELS: Record<HistoryActionType, string> = {
  email_deleted: 'Deleted',
  email_archived: 'Archived',
  email_marked_read: 'Marked Read',
  newsletter_unsubscribed: 'Unsubscribed',
  folder_created: 'Created Folder',
  rule_created: 'Created Rule',
  sender_blocked: 'Blocked Sender',
  sender_muted: 'Muted Sender',
  bulk_delete: 'Bulk Deleted',
  bulk_archive: 'Bulk Archived',
};

export default function HistoryScreen() {
  const { entries, getStats, clearHistory } = useHistory();
  const [filter, setFilter] = useState<HistoryActionType | 'all'>('all');
  const insets = useSafeAreaInsets();
  
  const stats = useMemo(() => getStats(), [getStats]);

  const filteredEntries = useMemo(() => {
    if (filter === 'all') return entries;
    return entries.filter(e => e.type === filter);
  }, [entries, filter]);

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMins = Math.floor(diffMs / (1000 * 60));
        return diffMins === 0 ? 'Just now' : `${diffMins}m ago`;
      }
      return `${diffHours}h ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks}w ago`;
    }
    
    return date.toLocaleDateString();
  };

  const renderHistoryItem = (entry: HistoryEntry) => {
    const Icon = ACTION_ICONS[entry.type];
    const color = ACTION_COLORS[entry.type];
    const label = ACTION_LABELS[entry.type];

    return (
      <View key={entry.id} style={styles.historyItem}>
        <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
          <Icon size={20} color={color} />
        </View>
        <View style={styles.historyContent}>
          <Text style={styles.historyLabel}>{label}</Text>
          <Text style={styles.historyDescription} numberOfLines={2}>
            {entry.description}
          </Text>
          {entry.metadata?.count && entry.metadata.count > 1 && (
            <Text style={styles.countBadge}>{entry.metadata.count} items</Text>
          )}
        </View>
        <Text style={styles.historyTime}>{formatDate(entry.timestamp)}</Text>
      </View>
    );
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear all history? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: clearHistory 
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'History',
          headerShown: true,
          headerRight: () => (
            <TouchableOpacity onPress={handleClearHistory}>
              <Trash2 size={22} color={Colors.light.danger} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Summary (60 Days)</Text>
          
          <View style={styles.summaryGrid}>
            <View style={styles.summaryCard}>
              <View style={[styles.summaryIcon, { backgroundColor: Colors.light.danger + '20' }]}>
                <Trash2 size={24} color={Colors.light.danger} />
              </View>
              <Text style={styles.summaryValue}>{stats.deletedEmails}</Text>
              <Text style={styles.summaryLabel}>Emails Deleted</Text>
            </View>

            <View style={styles.summaryCard}>
              <View style={[styles.summaryIcon, { backgroundColor: Colors.light.info + '20' }]}>
                <Archive size={24} color={Colors.light.info} />
              </View>
              <Text style={styles.summaryValue}>{stats.archivedEmails}</Text>
              <Text style={styles.summaryLabel}>Emails Archived</Text>
            </View>

            <View style={styles.summaryCard}>
              <View style={[styles.summaryIcon, { backgroundColor: Colors.light.warning + '20' }]}>
                <MailX size={24} color={Colors.light.warning} />
              </View>
              <Text style={styles.summaryValue}>{stats.unsubscribedCount}</Text>
              <Text style={styles.summaryLabel}>Unsubscribed</Text>
            </View>

            <View style={styles.summaryCard}>
              <View style={[styles.summaryIcon, { backgroundColor: Colors.light.primary + '20' }]}>
                <FolderPlus size={24} color={Colors.light.primary} />
              </View>
              <Text style={styles.summaryValue}>{stats.foldersCreated}</Text>
              <Text style={styles.summaryLabel}>Folders Created</Text>
            </View>
          </View>
        </View>

        <View style={styles.filterSection}>
          <Text style={styles.sectionTitle}>Filter by Action</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            <TouchableOpacity
              style={[styles.filterChip, filter === 'all' && styles.filterChipActive]}
              onPress={() => setFilter('all')}
            >
              <Text style={[styles.filterChipText, filter === 'all' && styles.filterChipTextActive]}>
                All ({entries.length})
              </Text>
            </TouchableOpacity>
            
            {Object.entries(ACTION_LABELS).map(([type, label]) => {
              const count = entries.filter(e => e.type === type).length;
              if (count === 0) return null;
              
              return (
                <TouchableOpacity
                  key={type}
                  style={[styles.filterChip, filter === type && styles.filterChipActive]}
                  onPress={() => setFilter(type as HistoryActionType)}
                >
                  <Text style={[styles.filterChipText, filter === type && styles.filterChipTextActive]}>
                    {label} ({count})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          
          {filteredEntries.length === 0 ? (
            <View style={styles.emptyState}>
              <Calendar size={48} color={Colors.light.textSecondary} />
              <Text style={styles.emptyText}>No history yet</Text>
              <Text style={styles.emptySubtext}>
                Your actions will appear here
              </Text>
            </View>
          ) : (
            filteredEntries.map(renderHistoryItem)
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    padding: 16,
  },

  summarySection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    minWidth: 150,
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
  filterSection: {
    marginBottom: 24,
  },
  filterScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  filterChip: {
    backgroundColor: Colors.light.surface,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  filterChipActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  historySection: {
    marginBottom: 24,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyContent: {
    flex: 1,
    gap: 4,
  },
  historyLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
  },
  historyDescription: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    lineHeight: 18,
  },
  countBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.primary,
    marginTop: 2,
  },
  historyTime: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },

});
