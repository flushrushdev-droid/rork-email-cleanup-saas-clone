import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { Search, TrendingUp, Mail, HardDrive, Archive, BellOff, Tag, Trash2, Trash, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';

import { useTheme } from '@/contexts/ThemeContext';
import { mockSenders, calculateSavings, formatBytes, getNoiseColor } from '@/mocks/emailData';

type FilterType = 'all' | 'marketing' | 'high-noise' | 'trusted' | 'unread' | 'large-files';
type SortType = 'noise' | 'volume' | 'size' | 'engagement';

export default function SendersScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ q?: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('noise');
  const [selectedSenders, setSelectedSenders] = useState<string[]>([]);
  const [unsubscribeModalVisible, setUnsubscribeModalVisible] = useState(false);
  const [unsubscribeEmail, setUnsubscribeEmail] = useState('');
  const [successModalVisible, setSuccessModalVisible] = useState(false);

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
      if (filter === 'unread') return sender.engagementRate < 50;
      if (filter === 'large-files') return sender.totalSize > 500000000;
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
    setUnsubscribeEmail(email);
    setUnsubscribeModalVisible(true);
  };

  const confirmUnsubscribe = () => {
    setUnsubscribeModalVisible(false);
    // In a real app, this would call an API
    setSuccessModalVisible(true);
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
      
      <View style={styles.searchContainerFull}>
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
      </View>

      <View style={[styles.filtersContainer, { backgroundColor: colors.background }]}>
        <View style={styles.filtersWrap}>
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
          <TouchableOpacity
            style={[styles.filterChip, { backgroundColor: colors.surface }, filter === 'unread' && { backgroundColor: colors.primary }]}
            onPress={() => setFilter('unread')}
          >
            <Text style={[styles.filterChipText, { color: colors.text }, filter === 'unread' && styles.filterChipTextActive]}>
              Unread ({mockSenders.filter(s => s.engagementRate < 50).length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, { backgroundColor: colors.surface }, filter === 'large-files' && { backgroundColor: colors.primary }]}
            onPress={() => setFilter('large-files')}
          >
            <Text style={[styles.filterChipText, { color: colors.text }, filter === 'large-files' && styles.filterChipTextActive]}>
              Large Files ({mockSenders.filter(s => s.totalSize > 500000000).length})
            </Text>
          </TouchableOpacity>
        </View>
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

      <Modal
        visible={unsubscribeModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setUnsubscribeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Unsubscribe</Text>
              <TouchableOpacity onPress={() => setUnsubscribeModalVisible(false)}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <Text style={[styles.modalMessage, { color: colors.textSecondary }]}>
              Are you sure you want to unsubscribe from all emails from:
            </Text>
            
            <View style={[styles.emailBadge, { backgroundColor: colors.surface }]}>
              <Text style={[styles.emailBadgeText, { color: colors.text }]}>{unsubscribeEmail}</Text>
            </View>

            <Text style={[styles.modalWarning, { color: colors.textSecondary }]}>
              This will automatically unsubscribe you from their mailing list.
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.surface }]}
                onPress={() => setUnsubscribeModalVisible(false)}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.danger }]}
                onPress={confirmUnsubscribe}
              >
                <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>Unsubscribe</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={successModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSuccessModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.successIconContainer}>
              <View style={[styles.successIcon, { backgroundColor: colors.success + '20' }]}>
                <Text style={[styles.successCheckmark, { color: colors.success }]}>✓</Text>
              </View>
            </View>
            
            <Text style={[styles.modalTitle, { color: colors.text, textAlign: 'center' }]}>Success!</Text>
            
            <Text style={[styles.modalMessage, { color: colors.textSecondary, textAlign: 'center' }]}>
              You have been unsubscribed from {unsubscribeEmail}
            </Text>

            <TouchableOpacity
              style={[styles.successButton, { backgroundColor: colors.success }]}
              onPress={() => setSuccessModalVisible(false)}
            >
              <Text style={styles.successButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainerFull: {
    paddingHorizontal: 16,
    marginBottom: 16,
    marginTop: 8,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    maxWidth: '86%',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  filtersContainer: {
    paddingBottom: 12,
    paddingHorizontal: 16,
    zIndex: 10,
  },
  filtersWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
  },
  modalMessage: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  emailBadge: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  emailBadgeText: {
    fontSize: 14,
    fontWeight: '600' as const,
    textAlign: 'center',
  },
  modalWarning: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
    fontStyle: 'italic' as const,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  successButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  successIconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successCheckmark: {
    fontSize: 48,
    fontWeight: '700' as const,
  },
});
