import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Search, SlidersHorizontal, TrendingUp, Mail, HardDrive, Archive, BellOff, Tag, Trash2, Trash } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';

import Colors from '@/constants/colors';
import { mockSenders, calculateSavings, formatBytes, getNoiseColor } from '@/mocks/emailData';

type FilterType = 'all' | 'marketing' | 'high-noise' | 'trusted';
type SortType = 'noise' | 'volume' | 'size' | 'engagement';

export default function SendersScreen() {
  const router = useRouter();
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
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Top Senders', headerShown: true }} />
      
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Search size={20} color={Colors.light.textSecondary} />
          <TextInput
            testID="senders-search"
            style={styles.searchInput}
            placeholder="Search senders..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.light.textSecondary}
          />
        </View>
        <TouchableOpacity style={styles.filterButton} onPress={() => Alert.alert('Filters', 'Advanced filters coming soon')}>
          <SlidersHorizontal size={20} color={Colors.light.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
        <TouchableOpacity
          style={[styles.filterChip, filter === 'all' && styles.filterChipActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterChipText, filter === 'all' && styles.filterChipTextActive]}>
            All ({mockSenders.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, filter === 'marketing' && styles.filterChipActive]}
          onPress={() => setFilter('marketing')}
        >
          <Text style={[styles.filterChipText, filter === 'marketing' && styles.filterChipTextActive]}>
            Marketing ({mockSenders.filter(s => s.isMarketing).length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, filter === 'high-noise' && styles.filterChipActive]}
          onPress={() => setFilter('high-noise')}
        >
          <Text style={[styles.filterChipText, filter === 'high-noise' && styles.filterChipTextActive]}>
            High Noise ({mockSenders.filter(s => s.noiseScore >= 7).length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, filter === 'trusted' && styles.filterChipActive]}
          onPress={() => setFilter('trusted')}
        >
          <Text style={[styles.filterChipText, filter === 'trusted' && styles.filterChipTextActive]}>
            Trusted ({mockSenders.filter(s => s.isTrusted).length})
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sortScroll}>
          {(['noise', 'volume', 'size', 'engagement'] as SortType[]).map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.sortChip, sortBy === type && styles.sortChipActive]}
              onPress={() => setSortBy(type)}
            >
              <Text style={[styles.sortChipText, sortBy === type && styles.sortChipTextActive]}>
                {type === 'noise' ? 'Noise Score' : type === 'volume' ? 'Email Count' : type === 'size' ? 'Storage' : 'Engagement'}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {selectedSenders.length > 0 && (
        <View style={styles.bulkActions}>
          <Text style={styles.bulkText}>{selectedSenders.length} selected</Text>
          <View style={styles.bulkButtons}>
            <TouchableOpacity testID="bulk-mute" style={styles.bulkButton} onPress={() => handleBulk('mute')}>
              <BellOff size={18} color={Colors.light.text} />
            </TouchableOpacity>
            <TouchableOpacity testID="bulk-label" style={styles.bulkButton} onPress={() => handleBulk('label')}>
              <Tag size={18} color={Colors.light.text} />
            </TouchableOpacity>
            <TouchableOpacity testID="bulk-archive" style={styles.bulkButton} onPress={() => handleBulk('archive')}>
              <Archive size={18} color={Colors.light.text} />
            </TouchableOpacity>
            <TouchableOpacity testID="bulk-delete" style={styles.bulkButton} onPress={() => handleBulk('delete')}>
              <Trash2 size={18} color={Colors.light.danger} />
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
              style={[styles.senderCard, isSelected && styles.senderCardSelected]}
            >
              <TouchableOpacity
                testID={`sender-card-${sender.id}`}
                onPress={() => handleViewSenderEmails(sender.id)}
                onLongPress={() => toggleSender(sender.id)}
                activeOpacity={0.7}
              >
              <View style={styles.senderHeader}>
                <View style={styles.senderInfo}>
                  <View style={[styles.senderAvatar, { backgroundColor: sender.isTrusted ? Colors.light.success : sender.isBlocked ? Colors.light.danger : Colors.light.primary }]}>
                    <Text style={styles.senderInitial}>{sender.displayName?.[0] || sender.email[0].toUpperCase()}</Text>
                  </View>
                  <View style={styles.senderDetails}>
                    <Text style={styles.senderName} numberOfLines={1}>{sender.displayName || sender.email}</Text>
                    <Text style={styles.senderEmail} numberOfLines={1}>{sender.email}</Text>
                  </View>
                </View>
                <View style={[styles.noiseBadge, { backgroundColor: getNoiseColor(sender.noiseScore) + '20' }]}>
                  <Text style={[styles.noiseScore, { color: getNoiseColor(sender.noiseScore) }]}>
                    {sender.noiseScore.toFixed(1)}
                  </Text>
                </View>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Mail size={16} color={Colors.light.textSecondary} />
                  <Text style={styles.statValue}>{sender.totalEmails}</Text>
                  <Text style={styles.statLabel}>Emails</Text>
                </View>
                <View style={styles.statBox}>
                  <HardDrive size={16} color={Colors.light.textSecondary} />
                  <Text style={styles.statValue}>{formatBytes(sender.totalSize)}</Text>
                  <Text style={styles.statLabel}>Storage</Text>
                </View>
                <View style={styles.statBox}>
                  <TrendingUp size={16} color={Colors.light.textSecondary} />
                  <Text style={styles.statValue}>{sender.engagementRate}%</Text>
                  <Text style={styles.statLabel}>Engagement</Text>
                </View>
              </View>

              <LinearGradient
                colors={['#F2F2F7', '#E5E5EA']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.savingsBar}
              >
                <View style={styles.savingItem}>
                  <Text style={styles.savingLabel}>Potential Savings:</Text>
                  <Text style={styles.savingValue}>{savings.time} min • {savings.space} MB</Text>
                </View>
              </LinearGradient>

              </TouchableOpacity>

              <View style={styles.actions}>
                {sender.hasUnsubscribe && (
                  <TouchableOpacity testID={`unsubscribe-${sender.id}`} style={[styles.actionButton, styles.actionButtonPrimary]} onPress={() => handleUnsubscribe(sender.email)}>
                    <BellOff size={16} color="#FFFFFF" />
                    <Text style={styles.actionButtonPrimaryText}>Unsubscribe</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity testID={`delete-${sender.id}`} style={styles.actionButton} onPress={() => handleDelete(sender.id, sender.email)}>
                  <Trash size={16} color={Colors.light.text} />
                  <Text style={styles.actionButtonText}>Delete</Text>
                </TouchableOpacity>
                <TouchableOpacity testID={`permanent-delete-${sender.id}`} style={[styles.actionButton, styles.actionButtonDanger]} onPress={() => handlePermanentDelete(sender.id, sender.email)}>
                  <Trash2 size={16} color="#FFFFFF" />
                  <Text style={styles.actionButtonDangerText}>Delete Forever</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                testID={`block-${sender.id}`}
                style={styles.blockButton} 
                onPress={() => handleBlockSender(sender.id, sender.email)}
              >
                <Text style={styles.blockButtonText}>Block Sender</Text>
              </TouchableOpacity>
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
    backgroundColor: Colors.light.background,
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
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.light.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filtersScroll: {
    paddingHorizontal: 16,
    marginBottom: 12,
    flexGrow: 0,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.light.surface,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: Colors.light.primary,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  sortLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.textSecondary,
  },
  sortScroll: {
    flex: 1,
    flexGrow: 0,
  },
  sortChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.light.surface,
    marginRight: 8,
  },
  sortChipActive: {
    backgroundColor: Colors.light.secondary,
  },
  sortChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.light.text,
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
    backgroundColor: Colors.light.secondary,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
  },
  bulkText: {
    fontSize: 14,
    fontWeight: '600',
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
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  senderCardSelected: {
    borderWidth: 2,
    borderColor: Colors.light.primary,
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
    fontWeight: '700',
    color: '#FFFFFF',
  },
  senderDetails: {
    flex: 1,
  },
  senderName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 2,
  },
  senderEmail: {
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  noiseBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  noiseScore: {
    fontSize: 16,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.light.border,
  },
  statBox: {
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
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
    fontWeight: '500',
    color: Colors.light.textSecondary,
  },
  savingValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.text,
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
    backgroundColor: Colors.light.background,
  },
  actionButtonPrimary: {
    backgroundColor: Colors.light.primary,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.text,
  },
  actionButtonPrimaryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  actionButtonDanger: {
    backgroundColor: Colors.light.danger,
  },
  actionButtonDangerText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  blockButton: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: Colors.light.danger,
    alignItems: 'center',
  },
  blockButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
