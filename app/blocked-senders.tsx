import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Search, UserX, Mail } from 'lucide-react-native';
import { Stack, useRouter } from 'expo-router';

import Colors from '@/constants/colors';
import { mockSenders } from '@/mocks/emailData';

export default function BlockedSendersScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const blockedSenders = mockSenders.filter(sender => sender.isBlocked);

  const filteredSenders = blockedSenders.filter((sender) =>
    sender.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sender.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUnblock = (senderId: string, senderEmail: string) => {
    Alert.alert(
      'Unblock Sender',
      `Unblock ${senderEmail}? Future emails will be delivered normally.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unblock',
          onPress: () => {
            Alert.alert('Success', `${senderEmail} has been unblocked`);
          },
        },
      ]
    );
  };

  const handleViewSenderEmails = (senderId: string) => {
    router.push({ pathname: '/sender-emails', params: { senderId } });
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Blocked Senders', headerShown: true }} />
      
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Search size={20} color={Colors.light.textSecondary} />
          <TextInput
            testID="blocked-senders-search"
            style={styles.searchInput}
            placeholder="Search blocked senders..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.light.textSecondary}
          />
        </View>
      </View>

      {filteredSenders.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <UserX size={64} color={Colors.light.textSecondary} />
          </View>
          <Text style={styles.emptyTitle}>No Blocked Senders</Text>
          <Text style={styles.emptyDescription}>
            {searchQuery 
              ? 'No blocked senders match your search'
              : 'You haven\'t blocked any senders yet'}
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.countText}>{filteredSenders.length} blocked sender{filteredSenders.length !== 1 ? 's' : ''}</Text>
          
          {filteredSenders.map((sender) => (
            <View key={sender.id} style={styles.senderCard}>
              <TouchableOpacity
                testID={`blocked-sender-card-${sender.id}`}
                onPress={() => handleViewSenderEmails(sender.id)}
                activeOpacity={0.7}
              >
                <View style={styles.senderHeader}>
                  <View style={styles.senderInfo}>
                    <View style={[styles.senderAvatar, { backgroundColor: Colors.light.danger }]}>
                      <Text style={styles.senderInitial}>
                        {sender.displayName?.[0] || sender.email[0].toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.senderDetails}>
                      <Text style={styles.senderName} numberOfLines={1}>
                        {sender.displayName || sender.email}
                      </Text>
                      <Text style={styles.senderEmail} numberOfLines={1}>{sender.email}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.statsRow}>
                  <View style={styles.statBox}>
                    <Mail size={16} color={Colors.light.textSecondary} />
                    <Text style={styles.statValue}>{sender.totalEmails}</Text>
                    <Text style={styles.statLabel}>Blocked Emails</Text>
                  </View>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                testID={`unblock-${sender.id}`}
                style={styles.unblockButton}
                onPress={() => handleUnblock(sender.id, sender.email)}
              >
                <Text style={styles.unblockButtonText}>Unblock Sender</Text>
              </TouchableOpacity>
            </View>
          ))}
          <View style={{ height: 80 }} />
        </ScrollView>
      )}
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
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.light.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  countText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.textSecondary,
    marginBottom: 12,
    paddingHorizontal: 4,
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
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.light.border,
  },
  statBox: {
    alignItems: 'center',
    gap: 6,
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
  unblockButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
  },
  unblockButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
