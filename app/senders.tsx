import React, { useState } from 'react';
import { Text, View, ScrollView, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { Search, Archive, BellOff, Tag, Trash2 } from 'lucide-react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';

import { useTheme } from '@/contexts/ThemeContext';
import { mockSenders } from '@/mocks/emailData';
import { useSenderFilters } from '@/hooks/useSenderFilters';
import { SenderCard } from '@/components/senders/SenderCard';
import { SenderFilters } from '@/components/senders/SenderFilters';
import { UnsubscribeModal } from '@/components/common/UnsubscribeModal';
import { createSenderStyles } from '@/styles/app/senders';

export default function SendersScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ q?: string }>();
  const [unsubscribeModalVisible, setUnsubscribeModalVisible] = useState(false);
  const [unsubscribeEmail, setUnsubscribeEmail] = useState('');
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  const senderFilters = useSenderFilters({
    allSenders: mockSenders,
    initialSearchQuery: params?.q && typeof params.q === 'string' ? params.q : '',
  });

  const styles = React.useMemo(() => createSenderStyles(colors), [colors]);

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
    Alert.alert('Bulk action', `${action} ${senderFilters.selectedSenders.length} senders`);
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
            value={senderFilters.searchQuery}
            onChangeText={senderFilters.setSearchQuery}
            placeholderTextColor={colors.textSecondary}
          />
        </View>
      </View>

      <SenderFilters
        filter={senderFilters.filter}
        onFilterChange={senderFilters.setFilter}
        sortBy={senderFilters.sortBy}
        onSortChange={senderFilters.setSortBy}
        allSenders={mockSenders}
        colors={colors}
      />

      {senderFilters.selectedSenders.length > 0 && (
        <View style={[styles.bulkActions, { backgroundColor: colors.secondary }]}>
          <Text style={styles.bulkText}>{senderFilters.selectedSenders.length} selected</Text>
          <View style={styles.bulkButtons}>
            <TouchableOpacity
              testID="bulk-mute"
              style={styles.bulkButton}
              onPress={() => handleBulk('mute')}
            >
              <BellOff size={18} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity
              testID="bulk-label"
              style={styles.bulkButton}
              onPress={() => handleBulk('label')}
            >
              <Tag size={18} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity
              testID="bulk-archive"
              style={styles.bulkButton}
              onPress={() => handleBulk('archive')}
            >
              <Archive size={18} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity
              testID="bulk-delete"
              style={styles.bulkButton}
              onPress={() => handleBulk('delete')}
            >
              <Trash2 size={18} color={colors.danger} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {senderFilters.filteredSenders.map((sender) => (
          <SenderCard
              key={sender.id}
            sender={sender}
            isSelected={senderFilters.selectedSenders.includes(sender.id)}
                onPress={() => handleViewSenderEmails(sender.id)}
            onLongPress={() => senderFilters.toggleSender(sender.id)}
            onUnsubscribe={handleUnsubscribe}
            onDelete={handleDelete}
            onPermanentDelete={handlePermanentDelete}
            onBlock={handleBlockSender}
            onViewEmails={() => handleViewSenderEmails(sender.id)}
            colors={colors}
          />
        ))}
        <View style={{ height: 80 }} />
      </ScrollView>

      <UnsubscribeModal
        visible={unsubscribeModalVisible}
        email={unsubscribeEmail}
        onConfirm={confirmUnsubscribe}
        onCancel={() => setUnsubscribeModalVisible(false)}
        colors={colors}
      />

      <Modal
        visible={successModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSuccessModalVisible(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.7)' }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface, borderRadius: 20, padding: 24 }]}>
            <View style={styles.successIconContainer}>
              <View style={[styles.successIcon, { backgroundColor: colors.success + '20', width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' }]}>
                <Text style={[styles.successCheckmark, { color: colors.success, fontSize: 48, fontWeight: '700' }]}>✓</Text>
              </View>
            </View>
            
            <Text style={[styles.modalTitle, { color: colors.text, textAlign: 'center', fontSize: 24, fontWeight: '700', marginBottom: 16 }]}>Success!</Text>
            
            <Text style={[styles.modalMessage, { color: colors.textSecondary, textAlign: 'center', fontSize: 16, lineHeight: 24, marginBottom: 24 }]}>
              You have been unsubscribed from {unsubscribeEmail}
            </Text>

            <TouchableOpacity
              style={[styles.successButton, { backgroundColor: colors.success, width: '100%', paddingVertical: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }]}
              onPress={() => setSuccessModalVisible(false)}
            >
              <Text style={[styles.successButtonText, { color: '#FFFFFF', fontSize: 16, fontWeight: '600' }]}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
