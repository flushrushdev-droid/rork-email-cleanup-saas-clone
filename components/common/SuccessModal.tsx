import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { createUnsubscribeStyles } from '@/styles/app/unsubscribe';

interface SuccessModalProps {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
  colors: any;
}

export function SuccessModal({ visible, title, message, onClose, colors }: SuccessModalProps) {
  const styles = React.useMemo(() => createUnsubscribeStyles(colors), [colors]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          <View style={styles.successIconContainer}>
            <View style={[styles.successIcon, { backgroundColor: colors.success + '20' }]}>
              <Text style={[styles.successCheckmark, { color: colors.success }]}>✓</Text>
            </View>
          </View>
          
          <Text style={[styles.modalTitle, { color: colors.text, textAlign: 'center' }]}>{title}</Text>
          
          <Text style={[styles.modalMessage, { color: colors.textSecondary, textAlign: 'center' }]}>
            {message}
          </Text>

          <TouchableOpacity
            style={[styles.successButton, { backgroundColor: colors.success }]}
            onPress={onClose}
          >
            <Text style={styles.successButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

