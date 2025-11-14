import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { Sparkles, ChevronDown } from 'lucide-react-native';
import { EdgeInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';

type AIModalProps = {
  visible: boolean;
  onClose: () => void;
  onGenerate: (format: string, tone: string, length: string, prompt: string) => void;
  insets: EdgeInsets;
};

export function AIModal({ visible, onClose, onGenerate, insets }: AIModalProps) {
  const { colors } = useTheme();
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
        <View style={[styles.aiModalContent, { paddingBottom: insets.bottom + 24, backgroundColor: colors.background }]}>
          <View style={[styles.aiModalHandle, { backgroundColor: colors.border }]} />
          
          <Text style={[styles.aiModalTitle, { color: colors.text }]}>Write with AI</Text>
          
          <ScrollView 
            style={styles.aiModalScroll}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          >
            <View style={[styles.aiPromptContainer, { backgroundColor: colors.surface }]}>
              <TextInput
                style={[styles.aiPromptInput, { color: colors.text }]}
                placeholder="What's on your mind?"
                placeholderTextColor={colors.textSecondary}
                value={aiPrompt}
                onChangeText={setAiPrompt}
                multiline
              />
            </View>
            
            <View style={styles.aiOptionsContainer}>
              <View style={styles.aiOption}>
                <Text style={[styles.aiDropdownLabel, { color: colors.textSecondary }]}>Format</Text>
                <TouchableOpacity
                  style={[styles.aiDropdownButton, { backgroundColor: colors.surface }]}
                  onPress={() => {
                    setShowFormatDropdown(!showFormatDropdown);
                    setShowToneDropdown(false);
                    setShowLengthDropdown(false);
                  }}
                >
                  <Text style={[styles.aiDropdownValue, { color: colors.text }]}>{aiFormat}</Text>
                  <ChevronDown size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={styles.aiOption}>
                <Text style={[styles.aiDropdownLabel, { color: colors.textSecondary }]}>Tone</Text>
                <TouchableOpacity
                  style={[styles.aiDropdownButton, { backgroundColor: colors.surface }]}
                  onPress={() => {
                    setShowToneDropdown(!showToneDropdown);
                    setShowFormatDropdown(false);
                    setShowLengthDropdown(false);
                  }}
                >
                  <Text style={[styles.aiDropdownValue, { color: colors.text }]}>{aiTone}</Text>
                  <ChevronDown size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={styles.aiOption}>
                <Text style={[styles.aiDropdownLabel, { color: colors.textSecondary }]}>Length</Text>
                <TouchableOpacity
                  style={[styles.aiDropdownButton, { backgroundColor: colors.surface }]}
                  onPress={() => {
                    setShowLengthDropdown(!showLengthDropdown);
                    setShowFormatDropdown(false);
                    setShowToneDropdown(false);
                  }}
                >
                  <Text style={[styles.aiDropdownValue, { color: colors.text }]}>{aiLength}</Text>
                  <ChevronDown size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>
            
            {showFormatDropdown && (
              <View style={[styles.aiDropdownOverlay, { backgroundColor: colors.surface }]}>
                {['professional', 'casual', 'formal', 'creative'].map((format) => (
                  <TouchableOpacity
                    key={format}
                    style={[styles.aiDropdownItem, { borderBottomColor: colors.border }]}
                    onPress={() => {
                      setAiFormat(format);
                      setShowFormatDropdown(false);
                    }}
                  >
                    <Text style={[styles.aiDropdownItemText, { color: colors.text }, aiFormat === format && { color: colors.primary, fontWeight: '600' as const }]}>
                      {format}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {showToneDropdown && (
              <View style={[styles.aiDropdownOverlay, { backgroundColor: colors.surface }]}>
                {['friendly', 'professional', 'confident', 'empathetic'].map((tone) => (
                  <TouchableOpacity
                    key={tone}
                    style={[styles.aiDropdownItem, { borderBottomColor: colors.border }]}
                    onPress={() => {
                      setAiTone(tone);
                      setShowToneDropdown(false);
                    }}
                  >
                    <Text style={[styles.aiDropdownItemText, { color: colors.text }, aiTone === tone && { color: colors.primary, fontWeight: '600' as const }]}>
                      {tone}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {showLengthDropdown && (
              <View style={[styles.aiDropdownOverlay, { backgroundColor: colors.surface }]}>
                {['short', 'medium', 'long'].map((length) => (
                  <TouchableOpacity
                    key={length}
                    style={[styles.aiDropdownItem, { borderBottomColor: colors.border }]}
                    onPress={() => {
                      setAiLength(length);
                      setShowLengthDropdown(false);
                    }}
                  >
                    <Text style={[styles.aiDropdownItemText, { color: colors.text }, aiLength === length && { color: colors.primary, fontWeight: '600' as const }]}>
                      {length}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>
          
          <TouchableOpacity
            style={[styles.aiGenerateButton, { backgroundColor: colors.primary }]}
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
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 20,
  },
  aiModalTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 20,
  },
  aiPromptContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    minHeight: 80,
  },
  aiPromptInput: {
    fontSize: 16,
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
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  aiDropdownLabel: {
    fontSize: 13,
    marginBottom: 8,
    fontWeight: '500',
  },
  aiDropdownValue: {
    fontSize: 15,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  aiDropdownOverlay: {
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
  },
  aiDropdownItemText: {
    fontSize: 15,
    textTransform: 'capitalize',
  },
  aiGenerateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
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
