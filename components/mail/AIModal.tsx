import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, StyleSheet } from 'react-native';
import { Sparkles, ChevronDown } from 'lucide-react-native';
import Colors from '@/constants/colors';

type AIModalProps = {
  visible: boolean;
  aiPrompt: string;
  aiFormat: string;
  aiTone: string;
  aiLength: string;
  showFormatDropdown: boolean;
  showToneDropdown: boolean;
  showLengthDropdown: boolean;
  insets: { bottom: number };
  onClose: () => void;
  onPromptChange: (text: string) => void;
  onFormatToggle: () => void;
  onToneToggle: () => void;
  onLengthToggle: () => void;
  onFormatSelect: (format: string) => void;
  onToneSelect: (tone: string) => void;
  onLengthSelect: (length: string) => void;
  onGenerate: () => void;
};

export function AIModal({
  visible,
  aiPrompt,
  aiFormat,
  aiTone,
  aiLength,
  showFormatDropdown,
  showToneDropdown,
  showLengthDropdown,
  insets,
  onClose,
  onPromptChange,
  onFormatToggle,
  onToneToggle,
  onLengthToggle,
  onFormatSelect,
  onToneSelect,
  onLengthSelect,
  onGenerate,
}: AIModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity 
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={[styles.modalContent, { paddingBottom: insets.bottom + 24 }]}>
          <View style={styles.modalHandle} />
          
          <Text style={styles.modalTitle}>Write with AI</Text>
          
          <ScrollView 
            style={styles.modalScroll}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          >
            <View style={styles.promptContainer}>
              <TextInput
                style={styles.promptInput}
                placeholder="What's on your mind?"
                placeholderTextColor={Colors.light.textSecondary}
                value={aiPrompt}
                onChangeText={onPromptChange}
                multiline
              />
            </View>
            
            <View style={styles.optionsContainer}>
              <View style={styles.option}>
                <Text style={styles.dropdownLabel}>Format</Text>
                <TouchableOpacity style={styles.dropdownButton} onPress={onFormatToggle}>
                  <Text style={styles.dropdownValue}>{aiFormat}</Text>
                  <ChevronDown size={16} color={Colors.light.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={styles.option}>
                <Text style={styles.dropdownLabel}>Tone</Text>
                <TouchableOpacity style={styles.dropdownButton} onPress={onToneToggle}>
                  <Text style={styles.dropdownValue}>{aiTone}</Text>
                  <ChevronDown size={16} color={Colors.light.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={styles.option}>
                <Text style={styles.dropdownLabel}>Length</Text>
                <TouchableOpacity style={styles.dropdownButton} onPress={onLengthToggle}>
                  <Text style={styles.dropdownValue}>{aiLength}</Text>
                  <ChevronDown size={16} color={Colors.light.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>
            
            {showFormatDropdown && (
              <View style={styles.dropdownOverlay}>
                {['professional', 'casual', 'formal', 'creative'].map((format) => (
                  <TouchableOpacity
                    key={format}
                    style={styles.dropdownItem}
                    onPress={() => onFormatSelect(format)}
                  >
                    <Text style={[styles.dropdownItemText, aiFormat === format && styles.dropdownItemTextActive]}>
                      {format}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {showToneDropdown && (
              <View style={styles.dropdownOverlay}>
                {['friendly', 'professional', 'confident', 'empathetic'].map((tone) => (
                  <TouchableOpacity
                    key={tone}
                    style={styles.dropdownItem}
                    onPress={() => onToneSelect(tone)}
                  >
                    <Text style={[styles.dropdownItemText, aiTone === tone && styles.dropdownItemTextActive]}>
                      {tone}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {showLengthDropdown && (
              <View style={styles.dropdownOverlay}>
                {['short', 'medium', 'long'].map((length) => (
                  <TouchableOpacity
                    key={length}
                    style={styles.dropdownItem}
                    onPress={() => onLengthSelect(length)}
                  >
                    <Text style={[styles.dropdownItemText, aiLength === length && styles.dropdownItemTextActive]}>
                      {length}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>
          
          <TouchableOpacity style={styles.generateButton} onPress={onGenerate}>
            <Sparkles size={20} color="#FFFFFF" />
            <Text style={styles.generateButtonText}>Generate</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modalBackdrop: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalScroll: {
    flexGrow: 0,
  },
  modalHandle: {
    width: 36,
    height: 5,
    backgroundColor: '#E5E5EA',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.light.text,
    marginBottom: 20,
  },
  promptContainer: {
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    minHeight: 80,
  },
  promptInput: {
    fontSize: 16,
    color: Colors.light.text,
    lineHeight: 22,
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  option: {
    flex: 1,
  },
  dropdownButton: {
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownLabel: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginBottom: 8,
    fontWeight: '500' as const,
  },
  dropdownValue: {
    fontSize: 15,
    color: Colors.light.text,
    fontWeight: '500' as const,
    textTransform: 'capitalize' as const,
  },
  dropdownOverlay: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  dropdownItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  dropdownItemText: {
    fontSize: 15,
    color: Colors.light.text,
    textTransform: 'capitalize' as const,
  },
  dropdownItemTextActive: {
    color: Colors.light.primary,
    fontWeight: '600' as const,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 12,
  },
  generateButtonText: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
});
