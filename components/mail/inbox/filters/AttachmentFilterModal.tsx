import React from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { X, Paperclip, File, FileEdit } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { modalStyles } from '../styles/modalStyles';

interface AttachmentFilterModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (type: string) => void;
}

export function AttachmentFilterModal({
  visible,
  onClose,
  onSelect,
}: AttachmentFilterModalProps) {
  const { colors } = useTheme();

  const attachmentTypes = [
    { id: 'any', label: 'Has any attachment', icon: Paperclip },
    { id: 'documents', label: 'Documents', icon: File },
    { id: 'slides', label: 'Slides', icon: FileEdit },
    { id: 'sheets', label: 'Sheets', icon: FileEdit },
    { id: 'images', label: 'Images', icon: File },
    { id: 'pdfs', label: 'PDFs', icon: File },
    { id: 'videos', label: 'Videos', icon: File },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={modalStyles.modalOverlay}>
        <View style={[modalStyles.modalContent, { backgroundColor: colors.surface }]}>
          <View style={[modalStyles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[modalStyles.modalTitle, { color: colors.text }]}>Attachment</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          <ScrollView style={modalStyles.modalList}>
            {attachmentTypes.map((type) => {
              const Icon = type.icon;
              return (
                <TouchableOpacity
                  key={type.id}
                  style={[modalStyles.modalItem, { borderBottomColor: colors.border }]}
                  onPress={() => {
                    onSelect(type.id);
                    onClose();
                  }}
                >
                  <Icon size={20} color={colors.primary} />
                  <Text style={[modalStyles.modalItemText, { color: colors.text }]}>{type.label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

