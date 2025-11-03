import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Search, BellOff, CheckCircle, XCircle, Clock, Mail, AlertCircle } from 'lucide-react-native';

import Colors from '@/constants/colors';
import { mockSenders } from '@/mocks/emailData';
import { useHistory } from '@/contexts/HistoryContext';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<'available' | 'history'>('available');
  const { addHistoryEntry } = useHistory();
  
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
      addHistoryEntry(
        'newsletter_unsubscribed',
        `Unsubscribed from ${sender.displayName || sender.email}`,
        {
          senderEmail: sender.email,
          senderName: sender.displayName,
        }
      );
    }
    alert(`Requested unsubscribe from ${senderId}`);
  };

  const getStatusIcon = (status: UnsubscribeStatus) => {
    switch (status) {
      case 'success':
        return <CheckCircle size={20} color={Colors.light.success} />;
      case 'failed':
        return <XCircle size={20} color={Colors.light.danger} />;
      case 'pending':
        return <Clock size={20} color={Colors.light.warning} />;
    }
  };

  const getStatusColor = (status: UnsubscribeStatus) => {
    switch (status) {
      case 'success':
        return Colors.light.success;
      case 'failed':
        return Colors.light.danger;
      case 'pending':
        return Colors.light.warning;
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Unsubscribe Manager',
          headerStyle: {
            backgroundColor: Colors.light.surface,
          },
          headerTintColor: Colors.light.text,
        }}
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.header}>
          <Text style={styles.title}>Unsubscribe Manager</Text>
          <Text style={styles.subtitle}>Take control of your inbox</Text>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Search size={20} color={Colors.light.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search senders..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={Colors.light.textSecondary}
            />
          </View>
        </View>

        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'available' && styles.tabActive]}
            onPress={() => setSelectedTab('available')}
          >
            <Text style={[styles.tabText, selectedTab === 'available' && styles.tabTextActive]}>
              Available ({availableSenders.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'history' && styles.tabActive]}
            onPress={() => setSelectedTab('history')}
          >
            <Text style={[styles.tabText, selectedTab === 'history' && styles.tabTextActive]}>
              History ({unsubscribeHistory.length})
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {selectedTab === 'available' ? (
            <>
              <View style={styles.infoCard}>
                <AlertCircle size={20} color={Colors.light.info} />
                <Text style={styles.infoText}>
                  One-click unsubscribe with automatic fallback to polite email templates
                </Text>
              </View>

              {availableSenders.map((sender) => (
                <View key={sender.id} style={styles.senderCard}>
                  <View style={styles.senderHeader}>
                    <View style={styles.senderInfo}>
                      <View style={styles.senderAvatar}>
                        <Mail size={20} color={Colors.light.primary} />
                      </View>
                      <View style={styles.senderDetails}>
                        <Text style={styles.senderName} numberOfLines={1}>
                          {sender.displayName || sender.email}
                        </Text>
                        <Text style={styles.senderEmail} numberOfLines={1}>
                          {sender.email}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.senderStats}>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{sender.totalEmails}</Text>
                      <Text style={styles.statLabel}>Emails</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{sender.frequency}/mo</Text>
                      <Text style={styles.statLabel}>Frequency</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{sender.noiseScore.toFixed(1)}</Text>
                      <Text style={styles.statLabel}>Noise</Text>
                    </View>
                  </View>

                  <View style={styles.methodBadge}>
                    <Text style={styles.methodText}>
                      Method: {sender.hasUnsubscribe ? 'List-Unsubscribe' : 'Auto-Reply'}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.unsubscribeButton}
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
                <View key={item.id} style={styles.historyCard}>
                  <View style={styles.historyHeader}>
                    <View style={styles.historyInfo}>
                      <Text style={styles.historySender}>{item.sender}</Text>
                      <Text style={styles.historyEmail}>{item.email}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                      {getStatusIcon(item.status)}
                      <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                        {item.status}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.historyMeta}>
                    <Text style={styles.historyMethod}>Method: {item.method}</Text>
                    <Text style={styles.historyDate}>
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
});
