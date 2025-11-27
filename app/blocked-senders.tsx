import React, { useState } from 'react';
import { Text, View, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Search, UserX, Mail } from 'lucide-react-native';
import { Stack, useRouter } from 'expo-router';

import { mockSenders } from '@/mocks/emailData';
import { useTheme } from '@/contexts/ThemeContext';
import { EmptyState } from '@/components/common/EmptyState';
import { createBlockedSendersStyles } from '@/styles/app/blocked-senders';
import { useEnhancedToast } from '@/hooks/useEnhancedToast';

export default function BlockedSendersScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const { showSuccess, showWarning } = useEnhancedToast();

  const blockedSenders = mockSenders.filter(sender => sender.isBlocked);

  const filteredSenders = blockedSenders.filter((sender) =>
    sender.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sender.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUnblock = (senderId: string, senderEmail: string) => {
    showWarning(`Unblock ${senderEmail}? Future emails will be delivered normally.`, {
      action: {
        label: 'Unblock',
        onPress: () => {
          showSuccess(`${senderEmail} has been unblocked`);
        },
      },
      duration: 0,
    });
  };

  const handleViewSenderEmails = (senderId: string) => {
    router.push({ pathname: '/sender-emails', params: { senderId } });
  };

  const styles = React.useMemo(() => createBlockedSendersStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Blocked Senders', 
          headerShown: true,
          headerStyle: {
            backgroundColor: colors.surface,
          },
          headerTintColor: colors.text,
          headerShadowVisible: false,
        }} 
      />
      
      <View style={styles.searchContainer}>
        <View style={[styles.searchBox, { backgroundColor: colors.surface }]}>
          <Search size={20} color={colors.textSecondary} />
          <TextInput
            testID="blocked-senders-search"
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search blocked senders..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.textSecondary}
          />
        </View>
      </View>

      {filteredSenders.length === 0 ? (
        <EmptyState
          icon={UserX}
          title="No Blocked Senders"
          description={searchQuery 
            ? 'No blocked senders match your search'
            : 'You haven\'t blocked any senders yet'}
          showIconContainer={true}
          style={styles.emptyState}
        />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={[styles.countText, { color: colors.textSecondary }]}>{filteredSenders.length} blocked sender{filteredSenders.length !== 1 ? 's' : ''}</Text>
          
          {filteredSenders.map((sender) => (
            <View key={sender.id} style={[styles.senderCard, { backgroundColor: colors.surface }]}>
              <TouchableOpacity
                testID={`blocked-sender-card-${sender.id}`}
                onPress={() => handleViewSenderEmails(sender.id)}
                activeOpacity={0.7}
              >
                <View style={styles.senderHeader}>
                  <View style={styles.senderInfo}>
                    <View style={[styles.senderAvatar, { backgroundColor: colors.danger }]}>
                      <Text style={styles.senderInitial}>
                        {sender.displayName?.[0] || sender.email[0].toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.senderDetails}>
                      <Text style={[styles.senderName, { color: colors.text }]} numberOfLines={1}>
                        {sender.displayName || sender.email}
                      </Text>
                      <Text style={[styles.senderEmail, { color: colors.textSecondary }]} numberOfLines={1}>{sender.email}</Text>
                    </View>
                  </View>
                </View>

                <View style={[styles.statsRow, { borderColor: colors.border }]}>
                  <View style={styles.statBox}>
                    <Mail size={16} color={colors.textSecondary} />
                    <Text style={[styles.statValue, { color: colors.text }]}>{sender.totalEmails}</Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Blocked Emails</Text>
                  </View>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                testID={`unblock-${sender.id}`}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`Unblock ${sender.email}`}
                accessibilityHint="Double tap to unblock this sender and allow their emails"
                style={[styles.unblockButton, { backgroundColor: colors.primary }]}
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

