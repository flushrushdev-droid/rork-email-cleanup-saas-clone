import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { Sparkles, ChevronDown } from 'lucide-react-native';
import { EdgeInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';

type AIModalProps = {
  visible: boolean;
  onClose: () => void;
  onGenerate: (format: string, tone: string, length: string, prompt: string) => void;
  insets: EdgeInsets;
};

export function AIModal({ visible, onClose, onGenerate, insets }: AIModalProps) {
  const [aiFormat, setAiFormat] = useState('professional');
  const [aiTone, setAiTone] = useState('friendly');
  const [aiLength, setAiLength] = useState('medium');
  const [showFormatDropdown, setShowFormatDropdown] = useState(false);
  const [showToneDropdown, setShowToneDropdown] = useState(false);
  const [showLengthDropdown, setShowLengthDropdown] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');

  const handleClose = () => {
    setShowFormatDropdown(false);
    setShowToneDropdown(false);
    setShowLengthDropdown(false);
    onClose();
  };

  const handleGenerate = () => {
    onGenerate(aiFormat, aiTone, aiLength, aiPrompt);
    handleClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.aiModalOverlay}>
        <TouchableOpacity 
          style={styles.aiModalBackdrop}
          activeOpacity={1}
          onPress={handleClose}
        />
        <View style={[styles.aiModalContent, { paddingBottom: insets.bottom + 24 }]}>
          <View style={styles.aiModalHandle} />
          
          <Text style={styles.aiModalTitle}>Write with AI</Text>
          
          <ScrollView 
            style={styles.aiModalScroll}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          >
            <View style={styles.aiPromptContainer}>
              <TextInput
                style={styles.aiPromptInput}
                placeholder="What's on your mind?"
                placeholderTextColor={Colors.light.textSecondary}
                value={aiPrompt}
                onChangeText={setAiPrompt}
                multiline
              />
            </View>
            
            <View style={styles.aiOptionsContainer}>
              <View style={styles.aiOption}>
                <Text style={styles.aiDropdownLabel}>Format</Text>
                <TouchableOpacity
                  style={styles.aiDropdownButton}
                  onPress={() => {
                    setShowFormatDropdown(!showFormatDropdown);
                    setShowToneDropdown(false);
                    setShowLengthDropdown(false);
                  }}
                >
                  <Text style={styles.aiDropdownValue}>{aiFormat}</Text>
                  <ChevronDown size={16} color={Colors.light.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={styles.aiOption}>
                <Text style={styles.aiDropdownLabel}>Tone</Text>
                <TouchableOpacity
                  style={styles.aiDropdownButton}
                  onPress={() => {
                    setShowToneDropdown(!showToneDropdown);
                    setShowFormatDropdown(false);
                    setShowLengthDropdown(false);
                  }}
                >
                  <Text style={styles.aiDropdownValue}>{aiTone}</Text>
                  <ChevronDown size={16} color={Colors.light.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={styles.aiOption}>
                <Text style={styles.aiDropdownLabel}>Length</Text>
                <TouchableOpacity
                  style={styles.aiDropdownButton}
                  onPress={() => {
                    setShowLengthDropdown(!showLengthDropdown);
                    setShowFormatDropdown(false);
                    setShowToneDropdown(false);
                  }}
                >
                  <Text style={styles.aiDropdownValue}>{aiLength}</Text>
                  <ChevronDown size={16} color={Colors.light.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>
            
            {showFormatDropdown && (
              <View style={styles.aiDropdownOverlay}>
                {['professional', 'casual', 'formal', 'creative'].map((format) => (
                  <TouchableOpacity
                    key={format}
                    style={styles.aiDropdownItem}
                    onPress={() => {
                      setAiFormat(format);
                      setShowFormatDropdown(false);
                    }}
                  >
                    <Text style={[styles.aiDropdownItemText, aiFormat === format && styles.aiDropdownItemTextActive]}>
                      {format}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {showToneDropdown && (
              <View style={styles.aiDropdownOverlay}>
                {['friendly', 'professional', 'confident', 'empathetic'].map((tone) => (
                  <TouchableOpacity
                    key={tone}
                    style={styles.aiDropdownItem}
                    onPress={() => {
                      setAiTone(tone);
                      setShowToneDropdown(false);
                    }}
                  >
                    <Text style={[styles.aiDropdownItemText, aiTone === tone && styles.aiDropdownItemTextActive]}>
                      {tone}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {showLengthDropdown && (
              <View style={styles.aiDropdownOverlay}>
                {['short', 'medium', 'long'].map((length) => (
                  <TouchableOpacity
                    key={length}
                    style={styles.aiDropdownItem}
                    onPress={() => {
                      setAiLength(length);
                      setShowLengthDropdown(false);
                    }}
                  >
                    <Text style={[styles.aiDropdownItemText, aiLength === length && styles.aiDropdownItemTextActive]}>
                      {length}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>
          
          <TouchableOpacity
            style={styles.aiGenerateButton}
            onPress={handleGenerate}
          >
            <Sparkles size={20} color="#FFFFFF" />
            <Text style={styles.aiGenerateButtonText}>Generate</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  aiModalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  aiModalBackdrop: {
    flex: 1,
  },
  aiModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  aiModalScroll: {
    flexGrow: 0,
  },
  aiModalHandle: {
    width: 36,
    height: 5,
    backgroundColor: '#E5E5EA',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 20,
  },
  aiModalTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 20,
  },
  aiPromptContainer: {
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    minHeight: 80,
  },
  aiPromptInput: {
    fontSize: 16,
    color: Colors.light.text,
    lineHeight: 22,
  },
  aiOptionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  aiOption: {
    flex: 1,
  },
  aiDropdownButton: {
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  aiDropdownLabel: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginBottom: 8,
    fontWeight: '500',
  },
  aiDropdownValue: {
    fontSize: 15,
    color: Colors.light.text,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  aiDropdownOverlay: {
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
  aiDropdownItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  aiDropdownItemText: {
    fontSize: 15,
    color: Colors.light.text,
    textTransform: 'capitalize',
  },
  aiDropdownItemTextActive: {
    color: Colors.light.primary,
    fontWeight: '600',
  },
  aiGenerateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 12,
  },
  aiGenerateButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
