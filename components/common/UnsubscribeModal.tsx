import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { X } from 'lucide-react-native';
import { createSenderStyles } from '@/styles/app/senders';

interface UnsubscribeModalProps {
  visible: boolean;
  email: string;
  onConfirm: () => void;
  onCancel: () => void;
  colors: any;
}

export function UnsubscribeModal({ visible, email, onConfirm, onCancel, colors }: UnsubscribeModalProps) {
  const styles = React.useMemo(() => createSenderStyles(colors), [colors]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Unsubscribe</Text>
            <TouchableOpacity onPress={onCancel}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.modalMessage, { color: colors.textSecondary }]}>
            Are you sure you want to unsubscribe from all emails from:
          </Text>

          <View style={[styles.emailBadge, { backgroundColor: colors.surface }]}>
            <Text style={[styles.emailBadgeText, { color: colors.text }]}>{email}</Text>
          </View>

          <Text style={[styles.modalWarning, { color: colors.textSecondary }]}>
            This will automatically unsubscribe you from their mailing list.
          </Text>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.surface }]}
              onPress={onCancel}
            >
              <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.danger }]}
              onPress={onConfirm}
            >
              <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>Unsubscribe</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

