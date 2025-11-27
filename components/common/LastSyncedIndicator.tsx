import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { AppText } from './AppText';
import { RefreshCw, Clock } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { formatRelativeDate } from '@/utils/relativeDateFormat';

interface LastSyncedIndicatorProps {
  lastSyncedAt: Date | null;
  onSyncPress?: () => void;
  isSyncing?: boolean;
}

/**
 * LastSyncedIndicator - Displays the last sync time and allows manual sync
 * 
 * Shows when the mailbox was last synced and provides a sync button
 * 
 * @example
 * <LastSyncedIndicator
 *   lastSyncedAt={lastSyncTime}
 *   onSyncPress={handleSync}
 *   isSyncing={isSyncing}
 * />
 */
export function LastSyncedIndicator({
  lastSyncedAt,
  onSyncPress,
  isSyncing = false,
}: LastSyncedIndicatorProps) {
  const { colors } = useTheme();

  if (!lastSyncedAt) {
    return null;
  }

  const relativeTime = formatRelativeDate(lastSyncedAt);
  const syncLabel = isSyncing ? 'Syncing...' : 'Sync now';

  return (
    <View
      style={[styles.container, { borderBottomColor: colors.border }]}
      accessible={true}
      accessibilityRole="text"
      accessibilityLabel={`Last synced ${relativeTime}`}
    >
      <View style={styles.content}>
        <Clock size={14} color={colors.textSecondary} />
        <AppText style={[styles.text, { color: colors.textSecondary }]} dynamicTypeStyle="caption">
          Last synced {relativeTime}
        </AppText>
      </View>
      {onSyncPress && (
        <TouchableOpacity
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={syncLabel}
          accessibilityHint="Double tap to sync your mailbox"
          onPress={onSyncPress}
          disabled={isSyncing}
          style={[
            styles.syncButton,
            {
              backgroundColor: colors.surface,
              opacity: isSyncing ? 0.5 : 1,
            },
          ]}
        >
          <RefreshCw
            size={14}
            color={colors.primary}
            style={isSyncing ? styles.rotating : undefined}
          />
          <AppText style={[styles.syncText, { color: colors.primary }]} dynamicTypeStyle="caption">
            {syncLabel}
          </AppText>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  text: {
    fontSize: 12,
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  syncText: {
    fontSize: 12,
    fontWeight: '600',
  },
  rotating: {
    // Animation can be added if needed
  },
});

