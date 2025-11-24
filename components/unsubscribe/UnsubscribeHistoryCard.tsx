import React from 'react';
import { View, Text } from 'react-native';
import { createUnsubscribeStyles } from '@/styles/app/unsubscribe';
import type { UnsubscribeItem, UnsubscribeStatus } from '@/hooks/useUnsubscribe';

interface UnsubscribeHistoryCardProps {
  item: UnsubscribeItem;
  getStatusIcon: (status: UnsubscribeStatus) => React.ReactElement;
  getStatusColor: (status: UnsubscribeStatus) => string;
  colors: any;
}

export function UnsubscribeHistoryCard({ item, getStatusIcon, getStatusColor, colors }: UnsubscribeHistoryCardProps) {
  const styles = React.useMemo(() => createUnsubscribeStyles(colors), [colors]);

  return (
    <View key={item.id} style={[styles.historyCard, { backgroundColor: colors.surface }]}>
      <View style={styles.historyHeader}>
        <View style={styles.historyInfo}>
          <Text style={[styles.historySender, { color: colors.text }]}>{item.sender}</Text>
          <Text style={[styles.historyEmail, { color: colors.textSecondary }]}>{item.email}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          {getStatusIcon(item.status)}
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status}
          </Text>
        </View>
      </View>
      <View style={[styles.historyMeta, { borderColor: colors.border }]}>
        <Text style={[styles.historyMethod, { color: colors.textSecondary }]}>Method: {item.method}</Text>
        <Text style={[styles.historyDate, { color: colors.textSecondary }]}>
          {new Date(item.date).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </Text>
      </View>
    </View>
  );
}

