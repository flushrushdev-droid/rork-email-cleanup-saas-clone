import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Search, BellOff, CheckCircle, XCircle, Clock, Mail, AlertCircle, X } from 'lucide-react-native';

import Colors from '@/constants/colors';
import { mockSenders } from '@/mocks/emailData';
import { useHistory } from '@/contexts/HistoryContext';
import { useTheme } from '@/contexts/ThemeContext';

type UnsubscribeStatus = 'pending' | 'success' | 'failed';

interface UnsubscribeItem {
  id: string;
  sender: string;
  email: string;
  method: 'list-unsubscribe' | 'auto-reply';
  status: UnsubscribeStatus;
  date: Date;
}

export default function UnsubscribeManagerScreen() {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<'available' | 'history'>('available');
  const { addHistoryEntry } = useHistory();
  const [unsubscribeModalVisible, setUnsubscribeModalVisible] = useState(false);
  const [unsubscribeEmail, setUnsubscribeEmail] = useState('');
  const [unsubscribeSenderId, setUnsubscribeSenderId] = useState('');
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  
  const [unsubscribeHistory] = useState<UnsubscribeItem[]>([
    {
      id: '1',
      sender: 'Medium Daily Digest',
      email: 'newsletters@medium.com',
      method: 'list-unsubscribe',
      status: 'success',
      date: new Date(Date.now() - 86400000),
    },
    {
      id: '2',
      sender: 'Marketing Newsletter',
      email: 'deals@retailer.com',
      method: 'auto-reply',
      status: 'pending',
      date: new Date(Date.now() - 3600000),
    },
  ]);

  const availableSenders = mockSenders
    .filter((sender) => sender.hasUnsubscribe && sender.isMarketing)
    .filter((sender) =>
      sender.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sender.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const handleUnsubscribe = (senderId: string) => {
    console.log('Unsubscribing from:', senderId);
    const sender = mockSenders.find(s => s.id === senderId);
    if (sender) {
      setUnsubscribeEmail(sender.email);
      setUnsubscribeSenderId(senderId);
      setUnsubscribeModalVisible(true);
    }
  };

  const confirmUnsubscribe = () => {
    const sender = mockSenders.find(s => s.id === unsubscribeSenderId);
    if (sender) {
      addHistoryEntry(
        'newsletter_unsubscribed',
        `Unsubscribed from ${sender.displayName || sender.email}`,
        {
          senderEmail: sender.email,
          senderName: sender.displayName,
        }
      );
    }
    setUnsubscribeModalVisible(false);
    setSuccessModalVisible(true);
  };

  const getStatusIcon = (status: UnsubscribeStatus) => {
    switch (status) {
      case 'success':
        return <CheckCircle size={20} color={colors.success} />;
      case 'failed':
        return <XCircle size={20} color={colors.danger} />;
      case 'pending':
        return <Clock size={20} color={colors.warning} />;
    }
  };

  const getStatusColor = (status: UnsubscribeStatus) => {
    switch (status) {
      case 'success':
        return colors.success;
      case 'failed':
        return colors.danger;
      case 'pending':
        return colors.warning;
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Unsubscribe Manager',
          headerStyle: {
            backgroundColor: colors.surface,
          },
          headerTintColor: colors.text,
        }}
      />
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Unsubscribe Manager</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Take control of your inbox</Text>
        </View>

        <View style={styles.searchContainer}>
          <View style={[styles.searchBox, { backgroundColor: colors.surface }]}>
            <Search size={20} color={colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search senders..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={colors.textSecondary}
            />
          </View>
        </View>

        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, { backgroundColor: colors.surface }, selectedTab === 'available' && { backgroundColor: colors.primary }]}
            onPress={() => setSelectedTab('available')}
          >
            <Text style={[styles.tabText, { color: selectedTab === 'available' ? '#FFFFFF' : colors.text }]}>
              Available ({availableSenders.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, { backgroundColor: colors.surface }, selectedTab === 'history' && { backgroundColor: colors.primary }]}
            onPress={() => setSelectedTab('history')}
          >
            <Text style={[styles.tabText, { color: selectedTab === 'history' ? '#FFFFFF' : colors.text }]}>
              History ({unsubscribeHistory.length})
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {selectedTab === 'available' ? (
            <>
              <View style={[styles.infoCard, { backgroundColor: colors.info + '15' }]}>
                <AlertCircle size={20} color={colors.info} />
                <Text style={[styles.infoText, { color: colors.info }]}>
                  One-click unsubscribe with automatic fallback to polite email templates
                </Text>
              </View>

              {availableSenders.map((sender) => (
                <View key={sender.id} style={[styles.senderCard, { backgroundColor: colors.surface }]}>
                  <View style={styles.senderHeader}>
                    <View style={styles.senderInfo}>
                      <View style={[styles.senderAvatar, { backgroundColor: colors.primary + '20' }]}>
                        <Mail size={20} color={colors.primary} />
                      </View>
                      <View style={styles.senderDetails}>
                        <Text style={[styles.senderName, { color: colors.text }]} numberOfLines={1}>
                          {sender.displayName || sender.email}
                        </Text>
                        <Text style={[styles.senderEmail, { color: colors.textSecondary }]} numberOfLines={1}>
                          {sender.email}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={[styles.senderStats, { borderColor: colors.border }]}>
                    <View style={styles.statItem}>
                      <Text style={[styles.statValue, { color: colors.text }]}>{sender.totalEmails}</Text>
                      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Emails</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={[styles.statValue, { color: colors.text }]}>{sender.frequency}/mo</Text>
                      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Frequency</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={[styles.statValue, { color: colors.text }]}>{sender.noiseScore.toFixed(1)}</Text>
                      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Noise</Text>
                    </View>
                  </View>

                  <View style={[styles.methodBadge, { backgroundColor: colors.background }]}>
                    <Text style={[styles.methodText, { color: colors.textSecondary }]}>
                      Method: {sender.hasUnsubscribe ? 'List-Unsubscribe' : 'Auto-Reply'}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.unsubscribeButton, { backgroundColor: colors.danger }]}
                    onPress={() => handleUnsubscribe(sender.id)}
                  >
                    <BellOff size={18} color="#FFFFFF" />
                    <Text style={styles.unsubscribeButtonText}>Unsubscribe</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </>
          ) : (
            <>
              {unsubscribeHistory.map((item) => (
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
              ))}
            </>
          )}
          <View style={{ height: 40 }} />
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
            <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
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
                style={[styles.modalButton, { backgroundColor: colors.success }]}
                onPress={() => setSuccessModalVisible(false)}
              >
                <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.light.textSecondary,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchBox: {
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
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: Colors.light.surface,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: Colors.light.primary,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.text,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.light.info + '15',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: Colors.light.info,
    lineHeight: 20,
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
  senderHeader: {
    marginBottom: 16,
  },
  senderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  senderAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
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
  senderStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.light.border,
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  methodBadge: {
    backgroundColor: Colors.light.background,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  methodText: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
  unsubscribeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.light.danger,
    borderRadius: 10,
    paddingVertical: 12,
  },
  unsubscribeButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  historyCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  historyInfo: {
    flex: 1,
    paddingRight: 12,
  },
  historySender: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 2,
  },
  historyEmail: {
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  historyMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: Colors.light.border,
  },
  historyMethod: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  historyDate: {
    fontSize: 12,
    color: Colors.light.textSecondary,
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
    fontWeight: '700',
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
    fontWeight: '600',
    textAlign: 'center',
  },
  modalWarning: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
    fontStyle: 'italic',
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
    fontWeight: '600',
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
    fontWeight: '700',
  },
});
