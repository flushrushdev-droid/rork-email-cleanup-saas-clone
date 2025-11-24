import React from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, TextInput } from 'react-native';
import { X, Search, Star, Clock, Bookmark, Send, Calendar, FileEdit, Mail, ShoppingBag } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { modalStyles } from '../styles/modalStyles';

interface LabelsFilterModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (labelId: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function LabelsFilterModal({
  visible,
  onClose,
  onSelect,
  searchQuery,
  onSearchChange,
}: LabelsFilterModalProps) {
  const { colors } = useTheme();

  const labels = [
    { id: 'starred', label: 'Starred', icon: Star },
    { id: 'snoozed', label: 'Snoozed', icon: Clock },
    { id: 'important', label: 'Important', icon: Bookmark },
    { id: 'sent', label: 'Sent', icon: Send },
    { id: 'scheduled', label: 'Scheduled', icon: Calendar },
    { id: 'drafts', label: 'Drafts', icon: FileEdit },
    { id: 'all', label: 'All mail', icon: Mail },
    { id: 'purchases', label: 'Purchases', icon: ShoppingBag },
  ];

  const filteredLabels = labels.filter(label =>
    label.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={() => {
        onClose();
        onSearchChange('');
      }}
    >
      <View style={modalStyles.modalOverlay}>
        <View style={[modalStyles.modalContent, { backgroundColor: colors.surface }]}>
          <View style={[modalStyles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[modalStyles.modalTitle, { color: colors.text }]}>Labels</Text>
            <TouchableOpacity onPress={() => {
              onClose();
              onSearchChange('');
            }}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          <View style={[modalStyles.modalSearchContainer, { backgroundColor: colors.background }]}>
            <Search size={18} color={colors.textSecondary} />
            <TextInput
              style={[modalStyles.modalSearchInput, { color: colors.text }]}
              placeholder="Search for labels"
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={onSearchChange}
            />
          </View>
          <ScrollView style={modalStyles.modalList}>
            {filteredLabels.map((label) => {
              const Icon = label.icon;
              return (
                <TouchableOpacity
                  key={label.id}
                  style={[modalStyles.modalItem, { borderBottomColor: colors.border }]}
                  onPress={() => {
                    onSelect(label.id);
                    onClose();
                    onSearchChange('');
                  }}
                >
                  <Icon size={20} color={colors.textSecondary} />
                  <Text style={[modalStyles.modalItemText, { color: colors.text }]}>{label.label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

