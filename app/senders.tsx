import React, { useState } from 'react';
import { Text, View, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
import { Search, Archive, BellOff, Tag, Trash2 } from 'lucide-react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';

import { useTheme } from '@/contexts/ThemeContext';
import { mockSenders } from '@/mocks/emailData';
import { useSenderFilters } from '@/hooks/useSenderFilters';
import { SenderCard } from '@/components/senders/SenderCard';
import { SenderFilters } from '@/components/senders/SenderFilters';
import { UnsubscribeModal } from '@/components/common/UnsubscribeModal';
import { createSenderStyles } from '@/styles/app/senders';
import { useEnhancedToast } from '@/hooks/useEnhancedToast';
import { createScopedLogger } from '@/utils/logger';

const sendersLogger = createScopedLogger('Senders');

export default function SendersScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ q?: string }>();
  const [unsubscribeModalVisible, setUnsubscribeModalVisible] = useState(false);
  const [unsubscribeEmail, setUnsubscribeEmail] = useState('');
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const { showSuccess, showError, showWarning, showInfo } = useEnhancedToast();

  const senderFilters = useSenderFilters({
    allSenders: mockSenders,
    initialSearchQuery: params?.q && typeof params.q === 'string' ? params.q : '',
  });

  const styles = React.useMemo(() => createSenderStyles(colors), [colors]);

  const handleDelete = (senderId: string, senderEmail: string) => {
    showWarning(`Move all emails from ${senderEmail} to trash?`, {
      action: {
        label: 'Delete',
        style: 'destructive',
        onPress: () => {
          try {
            // Small delay to ensure the warning toast is dismissed first
            setTimeout(() => {
              showSuccess(`Emails from ${senderEmail} moved to trash`);
            }, 200);
          } catch (error) {
            sendersLogger.error('Error deleting emails', error);
          }
        },
      },
      duration: 0,
    });
  };

  const handlePermanentDelete = (senderId: string, senderEmail: string) => {
    showError(`Permanently delete all emails from ${senderEmail}? This action cannot be undone.`, {
      action: {
        label: 'Delete Forever',
        style: 'destructive',
        onPress: () => {
          try {
            // Small delay to ensure the error toast is dismissed first
            setTimeout(() => {
              showSuccess(`All emails from ${senderEmail} permanently deleted`);
            }, 200);
          } catch (error) {
            sendersLogger.error('Error permanently deleting emails', error);
          }
        },
      },
      duration: 0,
    });
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
    showInfo(`${action} ${senderFilters.selectedSenders.length} senders`, { duration: 2000 });
  };

  const handleBlockSender = (senderId: string, senderEmail: string) => {
    showWarning(`Block all emails from ${senderEmail}? All future emails will be automatically moved to spam.`, {
      action: {
        label: 'Block',
        style: 'destructive',
        onPress: () => {
          try {
            // Small delay to ensure the warning toast is dismissed first
            setTimeout(() => {
              showSuccess(`${senderEmail} has been blocked`);
            }, 200);
          } catch (error) {
            sendersLogger.error('Error blocking sender', error);
          }
        },
      },
      duration: 0,
    });
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
            accessible={true}
            accessibilityLabel="Search senders"
            accessibilityHint="Enter search terms to find senders by name or email address"
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
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`Mute ${senderFilters.selectedSenders.length} selected senders`}
              accessibilityHint="Double tap to mute notifications from selected senders"
              style={styles.bulkButton}
              onPress={() => handleBulk('mute')}
            >
              <BellOff size={18} color={colors.surface} />
            </TouchableOpacity>
            <TouchableOpacity
              testID="bulk-label"
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`Label ${senderFilters.selectedSenders.length} selected senders`}
              accessibilityHint="Double tap to apply labels to selected senders"
              style={styles.bulkButton}
              onPress={() => handleBulk('label')}
            >
              <Tag size={18} color={colors.surface} />
            </TouchableOpacity>
            <TouchableOpacity
              testID="bulk-archive"
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`Archive emails from ${senderFilters.selectedSenders.length} selected senders`}
              accessibilityHint="Double tap to archive emails from selected senders"
              style={styles.bulkButton}
              onPress={() => handleBulk('archive')}
            >
              <Archive size={18} color={colors.surface} />
            </TouchableOpacity>
            <TouchableOpacity
              testID="bulk-delete"
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`Delete emails from ${senderFilters.selectedSenders.length} selected senders`}
              accessibilityHint="Double tap to delete emails from selected senders"
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
              <Text style={[styles.successButtonText, { color: colors.surface, fontSize: 16, fontWeight: '600' }]}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
