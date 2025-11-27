import React from 'react';
import { View, TouchableOpacity, Modal, ScrollView, TextInput } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { X } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { modalStyles } from '../styles/modalStyles';
import { mockContacts } from '../constants';

interface ContactFilterModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (contact: { name: string; email: string }) => void;
  type: 'from' | 'to';
  searchQuery: string;
  onSearchChange: (query: string) => void;
  contacts?: Array<{ name: string; email: string; initial: string; color: string }>;
}

export function ContactFilterModal({
  visible,
  onClose,
  onSelect,
  type,
  searchQuery,
  onSearchChange,
  contacts = mockContacts,
}: ContactFilterModalProps) {
  const { colors } = useTheme();

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchQuery.toLowerCase())
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
            <AppText style={[modalStyles.modalTitle, { color: colors.text }]} dynamicTypeStyle="title2">
              {type === 'to' ? 'To' : 'From'}
            </AppText>
            <TouchableOpacity onPress={() => {
              onClose();
              onSearchChange('');
            }}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          <View style={[modalStyles.modalSearchContainer, { backgroundColor: colors.background }]}>
            <TextInput
              style={[modalStyles.modalSearchInput, { color: colors.text }]}
              placeholder="Type a name or email address"
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={onSearchChange}
            />
          </View>
          <ScrollView style={modalStyles.modalList}>
            <AppText style={[modalStyles.modalSectionTitle, { color: colors.textSecondary }]} dynamicTypeStyle="headline">Suggestions</AppText>
            {filteredContacts.map((contact, index) => (
              <TouchableOpacity
                key={index}
                style={[modalStyles.modalItem, { borderBottomColor: colors.border }]}
                onPress={() => {
                  onSelect({ name: contact.name, email: contact.email });
                  onClose();
                  onSearchChange('');
                }}
              >
                <View style={[modalStyles.contactAvatar, { backgroundColor: contact.color }]}>
                  <AppText style={modalStyles.contactInitial} dynamicTypeStyle="body">{contact.initial}</AppText>
                </View>
                <View style={modalStyles.contactInfo}>
                  <AppText style={[modalStyles.contactName, { color: colors.text }]} dynamicTypeStyle="body">{contact.name}</AppText>
                  <AppText style={[modalStyles.contactEmail, { color: colors.textSecondary }]} dynamicTypeStyle="caption">{contact.email}</AppText>
                </View>
              </TouchableOpacity>
            ))}
            
            {searchQuery.length === 0 && (
              <>
                <AppText style={[modalStyles.modalSectionTitle, { color: colors.textSecondary }]} dynamicTypeStyle="headline">All contacts</AppText>
                <AppText style={[modalStyles.contactSectionLetter, { color: colors.text }]} dynamicTypeStyle="headline">J</AppText>
                {contacts.filter(c => c.name.startsWith('J')).map((contact, index) => (
                  <TouchableOpacity
                    key={`all-${index}`}
                    style={[modalStyles.modalItem, { borderBottomColor: colors.border }]}
                    onPress={() => {
                      onSelect({ name: contact.name, email: contact.email });
                      onClose();
                      onSearchChange('');
                    }}
                  >
                    <View style={[modalStyles.contactAvatar, { backgroundColor: contact.color }]}>
                      <AppText style={modalStyles.contactInitial} dynamicTypeStyle="body">{contact.initial}</AppText>
                    </View>
                    <View style={modalStyles.contactInfo}>
                      <AppText style={[modalStyles.contactName, { color: colors.text }]} dynamicTypeStyle="body">{contact.name}</AppText>
                      <AppText style={[modalStyles.contactEmail, { color: colors.textSecondary }]} dynamicTypeStyle="caption">{contact.email}</AppText>
                    </View>
                  </TouchableOpacity>
                ))}
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

