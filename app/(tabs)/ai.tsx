import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { Sparkles, Send, Loader } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRorkAgent, createRorkTool } from '@/lib/rork-sdk';
import { z } from 'zod';

import { useTheme } from '@/contexts/ThemeContext';
import { createAIStyles } from '@/styles/app/ai';
import { MessageBubble } from '@/components/ai/MessageBubble';
import { TypingIndicator } from '@/components/ai/TypingIndicator';
import { createScopedLogger } from '@/utils/logger';
import { triggerButtonHaptic } from '@/utils/haptics';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useEnhancedToast } from '@/hooks/useEnhancedToast';

const aiLogger = createScopedLogger('AI Assistant');

export default function AIAssistantScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = React.useMemo(() => createAIStyles(colors), [colors]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const { handleAsync } = useErrorHandler({ showAlert: true });
  const { showError: showErrorToast } = useEnhancedToast();

  const { messages, sendMessage } = useRorkAgent({
    tools: {
      prioritizeEmail: createRorkTool({
        description: 'Classify email priority level',
        zodSchema: z.object({
          subject: z.string().describe('Email subject'),
          priority: z.enum(['action', 'later', 'fyi', 'low']).describe('Priority level'),
          reason: z.string().describe('Reason for this priority'),
        }),
        execute(input) {
          aiLogger.debug('Prioritized email', input);
          return 'Email prioritized successfully';
        },
      }),
      createRule: createRorkTool({
        description: 'Create an email automation rule',
        zodSchema: z.object({
          name: z.string().describe('Rule name'),
          condition: z.string().describe('When to apply the rule'),
          action: z.string().describe('What action to take'),
        }),
        execute(input) {
          aiLogger.debug('Created rule', input);
          return 'Rule created successfully';
        },
      }),
    },
  });

  const handleSend = async () => {
    if (!input.trim()) return;
    
    await triggerButtonHaptic();
    
    const userMessage = input.trim();
    setInput('');
    setIsTyping(true);
    
    const result = await handleAsync(async () => {
      return await sendMessage(userMessage);
    }, {
      showAlert: true,
      onError: (error) => {
        showErrorToast('Failed to send message. Please try again.');
        // Restore input on error so user doesn't lose their message
        setInput(userMessage);
      },
    });
    
    setIsTyping(false);
  };

  const suggestions = [
    'Summarize my unread emails',
    'What are my top time wasters?',
    'Create a rule to archive old newsletters',
    'Help me unsubscribe from marketing emails',
  ];

  return (
    <View style={[styles.outerContainer, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView 
        style={[styles.container, { backgroundColor: colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.titleContainer}>
          <Sparkles size={28} color={colors.primary} />
          <AppText style={[styles.title, { color: colors.text }]} dynamicTypeStyle="title1">AI Assistant</AppText>
        </View>
        <AppText style={[styles.subtitle, { color: colors.textSecondary }]} dynamicTypeStyle="body">Your intelligent email helper</AppText>
      </View>

      <View style={styles.contentContainer}>
        {messages.length === 0 ? (
          <ScrollView contentContainerStyle={styles.emptyContainer}>
            <View style={[styles.welcomeCard, { backgroundColor: colors.surface }]}>
              <View style={[styles.welcomeIcon, { backgroundColor: colors.primary + '15' }]}>
                <Sparkles size={48} color={colors.primary} />
              </View>
              <AppText style={[styles.welcomeTitle, { color: colors.text }]} dynamicTypeStyle="headline">Welcome to your AI Assistant</AppText>
              <AppText style={[styles.welcomeText, { color: colors.textSecondary }]} dynamicTypeStyle="body">
                I can help you manage your emails, create rules, prioritize messages, and save time.
              </AppText>
            </View>

            <View style={styles.suggestionsContainer}>
              <AppText style={[styles.suggestionsTitle, { color: colors.text }]} dynamicTypeStyle="headline">Try asking:</AppText>
              {suggestions.map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.suggestionCard, { backgroundColor: colors.surface, borderLeftColor: colors.primary }]}
                  onPress={() => setInput(suggestion)}
                >
                  <AppText style={[styles.suggestionText, { color: colors.text }]} dynamicTypeStyle="body">{suggestion}</AppText>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        ) : (
          <ScrollView 
            contentContainerStyle={styles.messagesContainer}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((message) => (
              <View key={message.id}>
                {message.parts.map((part, i) => (
                  <MessageBubble
                    key={`${message.id}-${i}`}
                    part={part}
                    role={message.role}
                    colors={colors}
                  />
                ))}
              </View>
            ))}
            
            {isTyping && <TypingIndicator colors={colors} />}
            
            <View style={{ height: 20 }} />
          </ScrollView>
        )}
      </View>

      <View style={[styles.inputContainer, { paddingBottom: insets.bottom + 16, backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <View style={[styles.inputBox, { backgroundColor: colors.surface }]}>
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Ask me anything about your emails..."
            value={input}
            onChangeText={setInput}
            placeholderTextColor={colors.textSecondary}
            accessible={true}
            accessibilityLabel="AI Assistant input"
            accessibilityHint="Enter your question or request for the AI assistant"
            multiline
            maxLength={500}
          />
          <TouchableOpacity 
            testID="ai-send"
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={isTyping ? 'AI is typing' : 'Send message'}
            accessibilityHint="Double tap to send your message to the AI assistant"
            accessibilityState={{ disabled: !input.trim() || isTyping, busy: isTyping }}
            style={[styles.sendButton, { backgroundColor: colors.primary }, !input.trim() && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!input.trim() || isTyping}
          >
            {isTyping ? (
              <Loader size={20} color={colors.surface} />
            ) : (
              <Send size={20} color={colors.surface} />
            )}
          </TouchableOpacity>
        </View>
      </View>
      </KeyboardAvoidingView>
    </View>
  );
}

