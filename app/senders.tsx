import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Search, SlidersHorizontal, TrendingUp, Mail, HardDrive, Archive, BellOff, Tag, Trash2, Trash } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';

import { useTheme } from '@/contexts/ThemeContext';
import { mockSenders, calculateSavings, formatBytes, getNoiseColor } from '@/mocks/emailData';

type FilterType = 'all' | 'marketing' | 'high-noise' | 'trusted';
type SortType = 'noise' | 'volume' | 'size' | 'engagement';

export default function SendersScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ q?: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('noise');
  const [selectedSenders, setSelectedSenders] = useState<string[]>([]);

  useEffect(() => {
    if (params?.q && typeof params.q === 'string') {
      setSearchQuery(params.q);
    }
  }, [params?.q]);

  const filteredSenders = mockSenders
    .filter((sender) => {
      if (filter === 'marketing') return sender.isMarketing;
      if (filter === 'high-noise') return sender.noiseScore >= 7;
      if (filter === 'trusted') return sender.isTrusted;
      return true;
    })
    .filter((sender) => 
      sender.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sender.email.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'noise') return b.noiseScore - a.noiseScore;
      if (sortBy === 'volume') return b.totalEmails - a.totalEmails;
      if (sortBy === 'size') return b.totalSize - a.totalSize;
      if (sortBy === 'engagement') return a.engagementRate - b.engagementRate;
      return 0;
    });

  const toggleSender = (senderId: string) => {
    setSelectedSenders((prev) =>
      prev.includes(senderId)
        ? prev.filter((id) => id !== senderId)
        : [...prev, senderId]
    );
  };

  const handleDelete = (senderId: string, senderEmail: string) => {
    Alert.alert(
      'Delete Emails',
      `Move all emails from ${senderEmail} to trash?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Success', `Emails from ${senderEmail} moved to trash`);
          },
        },
      ]
    );
  };

  const handlePermanentDelete = (senderId: string, senderEmail: string) => {
    Alert.alert(
      'Permanently Delete',
      `Permanently delete all emails from ${senderEmail}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Forever',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Success', `All emails from ${senderEmail} permanently deleted`);
          },
        },
      ]
    );
  };

  const handleViewSenderEmails = (senderId: string) => {
    router.push({ pathname: '/sender-emails', params: { senderId } });
  };

  const handleUnsubscribe = (email: string) => {
    router.push({ pathname: '/unsubscribe', params: { q: email } });
  };

  const handleBulk = (action: 'mute' | 'label' | 'archive' | 'delete') => {
    Alert.alert('Bulk action', `${action} ${selectedSenders.length} senders`);
  };

  const handleBlockSender = (senderId: string, senderEmail: string) => {
    Alert.alert(
      'Block Sender',
      `Block all emails from ${senderEmail}? All future emails will be automatically moved to spam.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Success', `${senderEmail} has been blocked`);
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ 
        title: 'Top Senders', 
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          color: colors.text,
        },
      }} />
      
      <View style={styles.searchContainer}>
        <View style={[styles.searchBox, { backgroundColor: colors.surface }]}>
          <Search size={20} color={colors.textSecondary} />
          <TextInput
            testID="senders-search"
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search senders..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.textSecondary}
          />
        </View>
        <TouchableOpacity 
          style={[styles.filterButton, { backgroundColor: colors.surface }]} 
          onPress={() => Alert.alert('Filters', 'Advanced filters coming soon')}
          activeOpacity={0.7}
        >
          <SlidersHorizontal size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={[styles.filtersContainer, { backgroundColor: colors.background }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
          <TouchableOpacity
            style={[styles.filterChip, { backgroundColor: colors.surface }, filter === 'all' && { backgroundColor: colors.primary }]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterChipText, { color: colors.text }, filter === 'all' && styles.filterChipTextActive]}>
              All ({mockSenders.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, { backgroundColor: colors.surface }, filter === 'marketing' && { backgroundColor: colors.primary }]}
            onPress={() => setFilter('marketing')}
          >
            <Text style={[styles.filterChipText, { color: colors.text }, filter === 'marketing' && styles.filterChipTextActive]}>
              Marketing ({mockSenders.filter(s => s.isMarketing).length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, { backgroundColor: colors.surface }, filter === 'high-noise' && { backgroundColor: colors.primary }]}
            onPress={() => setFilter('high-noise')}
          >
            <Text style={[styles.filterChipText, { color: colors.text }, filter === 'high-noise' && styles.filterChipTextActive]}>
              High Noise ({mockSenders.filter(s => s.noiseScore >= 7).length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, { backgroundColor: colors.surface }, filter === 'trusted' && { backgroundColor: colors.primary }]}
            onPress={() => setFilter('trusted')}
          >
            <Text style={[styles.filterChipText, { color: colors.text }, filter === 'trusted' && styles.filterChipTextActive]}>
              Trusted ({mockSenders.filter(s => s.isTrusted).length})
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <View style={[styles.sortContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.sortLabel, { color: colors.textSecondary }]}>Sort by:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sortScroll}>
          {(['noise', 'volume', 'size', 'engagement'] as SortType[]).map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.sortChip, { backgroundColor: colors.surface }, sortBy === type && { backgroundColor: colors.secondary }]}
              onPress={() => setSortBy(type)}
            >
              <Text style={[styles.sortChipText, { color: colors.text }, sortBy === type && styles.sortChipTextActive]}>
                {type === 'noise' ? 'Noise Score' : type === 'volume' ? 'Email Count' : type === 'size' ? 'Storage' : 'Engagement'}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {selectedSenders.length > 0 && (
        <View style={[styles.bulkActions, { backgroundColor: colors.secondary }]}>
          <Text style={styles.bulkText}>{selectedSenders.length} selected</Text>
          <View style={styles.bulkButtons}>
            <TouchableOpacity testID="bulk-mute" style={styles.bulkButton} onPress={() => handleBulk('mute')}>
              <BellOff size={18} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity testID="bulk-label" style={styles.bulkButton} onPress={() => handleBulk('label')}>
              <Tag size={18} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity testID="bulk-archive" style={styles.bulkButton} onPress={() => handleBulk('archive')}>
              <Archive size={18} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity testID="bulk-delete" style={styles.bulkButton} onPress={() => handleBulk('delete')}>
              <Trash2 size={18} color={colors.danger} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {filteredSenders.map((sender, index) => {
          const savings = calculateSavings(sender);
          const isSelected = selectedSenders.includes(sender.id);
          
          return (
            <View
              key={sender.id}
              style={[styles.senderCard, { backgroundColor: colors.surface }, isSelected && { borderColor: colors.primary }]}
            >
              <TouchableOpacity
                testID={`sender-card-${sender.id}`}
                onPress={() => handleViewSenderEmails(sender.id)}
                onLongPress={() => toggleSender(sender.id)}
                activeOpacity={0.7}
              >
              <View style={styles.senderHeader}>
                <View style={styles.senderInfo}>
                  <View style={[styles.senderAvatar, { backgroundColor: sender.isTrusted ? colors.success : sender.isBlocked ? colors.danger : colors.primary }]}>
                    <Text style={styles.senderInitial}>{sender.displayName?.[0] || sender.email[0].toUpperCase()}</Text>
                  </View>
                  <View style={styles.senderDetails}>
                    <Text style={[styles.senderName, { color: colors.text }]} numberOfLines={1}>{sender.displayName || sender.email}</Text>
                    <Text style={[styles.senderEmail, { color: colors.textSecondary }]} numberOfLines={1}>{sender.email}</Text>
                  </View>
                </View>
                <View style={[styles.noiseBadge, { backgroundColor: getNoiseColor(sender.noiseScore) + '20' }]}>
                  <Text style={[styles.noiseScore, { color: getNoiseColor(sender.noiseScore) }]}>
                    {sender.noiseScore.toFixed(1)}
                  </Text>
                </View>
              </View>

              <View style={[styles.statsRow, { borderColor: colors.border }]}>
                <View style={styles.statBox}>
                  <Mail size={16} color={colors.textSecondary} />
                  <Text style={[styles.statValue, { color: colors.text }]}>{sender.totalEmails}</Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Emails</Text>
                </View>
                <View style={styles.statBox}>
                  <HardDrive size={16} color={colors.textSecondary} />
                  <Text style={[styles.statValue, { color: colors.text }]}>{formatBytes(sender.totalSize)}</Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Storage</Text>
                </View>
                <View style={styles.statBox}>
                  <TrendingUp size={16} color={colors.textSecondary} />
                  <Text style={[styles.statValue, { color: colors.text }]}>{sender.engagementRate}%</Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Engagement</Text>
                </View>
              </View>

              <View style={[styles.savingsBar, { backgroundColor: colors.background }]}>
                <View style={styles.savingItem}>
                  <Text style={[styles.savingLabel, { color: colors.textSecondary }]}>Potential Savings:</Text>
                  <Text style={[styles.savingValue, { color: colors.text }]}>{savings.time} min • {savings.space} MB</Text>
                </View>
              </View>

              </TouchableOpacity>

              <View style={styles.actions}>
                {sender.hasUnsubscribe && (
                  <TouchableOpacity testID={`unsubscribe-${sender.id}`} style={[styles.actionButton, { backgroundColor: colors.primary }]} onPress={() => handleUnsubscribe(sender.email)}>
                    <BellOff size={16} color="#FFFFFF" />
                    <Text style={styles.actionButtonPrimaryText}>Unsubscribe</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity testID={`delete-${sender.id}`} style={[styles.actionButton, { backgroundColor: colors.background }]} onPress={() => handleDelete(sender.id, sender.email)}>
                  <Trash size={16} color={colors.text} />
                  <Text style={[styles.actionButtonText, { color: colors.text }]}>Delete</Text>
                </TouchableOpacity>
                <TouchableOpacity testID={`permanent-delete-${sender.id}`} style={[styles.actionButton, { backgroundColor: colors.background, borderColor: colors.danger }]} onPress={() => handlePermanentDelete(sender.id, sender.email)}>
                  <Trash2 size={16} color={colors.danger} />
                  <Text style={[styles.actionButtonDangerText, { color: colors.danger }]}>Delete Forever</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.bottomActions}>
                <TouchableOpacity 
                  testID={`auto-rule-${sender.id}`}
                  style={[styles.autoRuleButton, { backgroundColor: colors.primary }]} 
                  onPress={() => Alert.alert('Auto Rule', `Create automatic rule for ${sender.email}`)}
                >
                  <Text style={styles.autoRuleButtonText}>Auto Rule</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  testID={`block-${sender.id}`}
                  style={[styles.blockButton, { backgroundColor: colors.danger }]} 
                  onPress={() => handleBlockSender(sender.id, sender.email)}
                >
                  <Text style={styles.blockButtonText}>Block Sender</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
    marginTop: 8,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  filtersContainer: {
    paddingBottom: 12,
    zIndex: 10,
  },
  filtersScroll: {
    paddingHorizontal: 16,
    flexGrow: 0,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    gap: 12,
    zIndex: 9,
  },
  sortLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  sortScroll: {
    flex: 1,
    flexGrow: 0,
  },
  sortChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
  },
  sortChipText: {
    fontSize: 13,
    fontWeight: '500' as const,
  },
  sortChipTextActive: {
    color: '#FFFFFF',
  },
  bulkActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
  },
  bulkText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  bulkButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  bulkButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  senderCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },

  senderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  senderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    paddingRight: 50,
  },
  senderAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  senderInitial: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  senderDetails: {
    flex: 1,
  },
  senderName: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  senderEmail: {
    fontSize: 13,
  },
  noiseBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  noiseScore: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  statBox: {
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700' as const,
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  savingsBar: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  savingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  savingLabel: {
    fontSize: 13,
    fontWeight: '500' as const,
  },
  savingValue: {
    fontSize: 14,
    fontWeight: '700' as const,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  actionButtonPrimaryText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  actionButtonDangerText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  bottomActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  blockButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  blockButtonText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  autoRuleButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  autoRuleButtonText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
});
