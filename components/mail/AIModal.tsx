import React, { useState } from 'react';
import { Text, View, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { EdgeInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { AIDropdown } from './ai/AIDropdown';
import { createAIStyles } from './ai/styles';

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
  const [aiPrompt, setAiPrompt] = useState('');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const styles = createAIStyles(colors);

  const handleClose = () => {
    setOpenDropdown(null);
    onClose();
  };

  const handleToggleDropdown = (dropdown: string) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown);
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
              <AIDropdown
                label="Format"
                value={aiFormat}
                options={['professional', 'casual', 'formal', 'creative']}
                onSelect={setAiFormat}
                isOpen={openDropdown === 'format'}
                onToggle={() => handleToggleDropdown('format')}
                colors={colors}
              />
              <AIDropdown
                label="Tone"
                value={aiTone}
                options={['friendly', 'professional', 'confident', 'empathetic']}
                onSelect={setAiTone}
                isOpen={openDropdown === 'tone'}
                onToggle={() => handleToggleDropdown('tone')}
                colors={colors}
              />
              <AIDropdown
                label="Length"
                value={aiLength}
                options={['short', 'medium', 'long']}
                onSelect={setAiLength}
                isOpen={openDropdown === 'length'}
                onToggle={() => handleToggleDropdown('length')}
                colors={colors}
              />
            </View>
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

// Styles are now in components/mail/ai/styles.ts
