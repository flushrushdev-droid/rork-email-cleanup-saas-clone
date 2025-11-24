import React from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, TextInput } from 'react-native';
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
            <Text style={[modalStyles.modalTitle, { color: colors.text }]}>
              {type === 'to' ? 'To' : 'From'}
            </Text>
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
            <Text style={[modalStyles.modalSectionTitle, { color: colors.textSecondary }]}>Suggestions</Text>
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
                  <Text style={modalStyles.contactInitial}>{contact.initial}</Text>
                </View>
                <View style={modalStyles.contactInfo}>
                  <Text style={[modalStyles.contactName, { color: colors.text }]}>{contact.name}</Text>
                  <Text style={[modalStyles.contactEmail, { color: colors.textSecondary }]}>{contact.email}</Text>
                </View>
              </TouchableOpacity>
            ))}
            
            {searchQuery.length === 0 && (
              <>
                <Text style={[modalStyles.modalSectionTitle, { color: colors.textSecondary }]}>All contacts</Text>
                <Text style={[modalStyles.contactSectionLetter, { color: colors.text }]}>J</Text>
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
                      <Text style={modalStyles.contactInitial}>{contact.initial}</Text>
                    </View>
                    <View style={modalStyles.contactInfo}>
                      <Text style={[modalStyles.contactName, { color: colors.text }]}>{contact.name}</Text>
                      <Text style={[modalStyles.contactEmail, { color: colors.textSecondary }]}>{contact.email}</Text>
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

