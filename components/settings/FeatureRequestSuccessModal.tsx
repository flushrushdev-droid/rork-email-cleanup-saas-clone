import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Check } from 'lucide-react-native';
import { createSettingsStyles } from '@/styles/app/settings';

interface FeatureRequestSuccessModalProps {
  visible: boolean;
  onClose: () => void;
  colors: any;
}

export function FeatureRequestSuccessModal({
  visible,
  onClose,
  colors,
}: FeatureRequestSuccessModalProps) {
  const styles = createSettingsStyles(colors);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.successOverlay}>
        <View style={[styles.successContent, { backgroundColor: colors.surface }]}>
          <View style={[styles.successIcon, { backgroundColor: colors.success + '20' }]}>
            <Check size={32} color={colors.success} />
          </View>
          <Text style={[styles.successTitle, { color: colors.text }]}>Thank You!</Text>
          <Text style={[styles.successMessage, { color: colors.textSecondary }]}>
            We truly appreciate your feedback. Our team will review your feature request and work hard to bring your ideas to life!
          </Text>
          <TouchableOpacity
            style={[styles.successButton, { backgroundColor: colors.primary }]}
            onPress={onClose}
          >
            <Text style={styles.successButtonText}>Got it</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

