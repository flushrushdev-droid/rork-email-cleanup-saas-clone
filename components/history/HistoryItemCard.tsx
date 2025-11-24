import React from 'react';
import { View, Text } from 'react-native';
import { Trash2, Archive, Activity, MailX, FolderPlus, Settings2, TrendingDown } from 'lucide-react-native';
import type { HistoryEntry, HistoryActionType } from '@/constants/types';
import { createHistoryStyles } from '@/styles/app/history';

interface HistoryItemCardProps {
  entry: HistoryEntry;
  getActionColor: (type: HistoryActionType) => string;
  formatDate: (timestamp: string) => string;
  colors: any;
}

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

export const ACTION_LABELS: Record<HistoryActionType, string> = {
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

export function HistoryItemCard({ entry, getActionColor, formatDate, colors }: HistoryItemCardProps) {
  const styles = createHistoryStyles(colors);
  const Icon = ACTION_ICONS[entry.type];
  const color = getActionColor(entry.type);
  const label = ACTION_LABELS[entry.type];

  return (
    <View style={[styles.historyItem, { backgroundColor: colors.surface }]}>
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <Icon size={20} color={color} />
      </View>
      <View style={styles.historyContent}>
        <Text style={[styles.historyLabel, { color: colors.text }]}>{label}</Text>
        <Text style={[styles.historyDescription, { color: colors.textSecondary }]} numberOfLines={2}>
          {entry.description}
        </Text>
        {entry.metadata?.count && entry.metadata.count > 1 && (
          <Text style={[styles.countBadge, { color: colors.primary }]}>{entry.metadata.count} items</Text>
        )}
      </View>
      <Text style={[styles.historyTime, { color: colors.textSecondary }]}>{formatDate(entry.timestamp)}</Text>
    </View>
  );
}

