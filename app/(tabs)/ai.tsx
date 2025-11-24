import React, { useState } from 'react';
import { Text, View, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Sparkles, Send, Loader } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRorkAgent, createRorkTool } from '@/lib/rork-sdk';
import { z } from 'zod';

import { useTheme } from '@/contexts/ThemeContext';
import { createAIStyles } from '@/styles/app/ai';
import { MessageBubble } from '@/components/ai/MessageBubble';
import { TypingIndicator } from '@/components/ai/TypingIndicator';

export default function AIAssistantScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = React.useMemo(() => createAIStyles(colors), [colors]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

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
          console.log('Prioritized email:', input);
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
          console.log('Created rule:', input);
          return 'Rule created successfully';
        },
      }),
    },
  });

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage = input.trim();
    setInput('');
    setIsTyping(true);
    
    try {
      await sendMessage(userMessage);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsTyping(false);
    }
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
          <Text style={[styles.title, { color: colors.text }]}>AI Assistant</Text>
        </View>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Your intelligent email helper</Text>
      </View>

      <View style={styles.contentContainer}>
        {messages.length === 0 ? (
          <ScrollView contentContainerStyle={styles.emptyContainer}>
            <View style={[styles.welcomeCard, { backgroundColor: colors.surface }]}>
              <View style={[styles.welcomeIcon, { backgroundColor: colors.primary + '15' }]}>
                <Sparkles size={48} color={colors.primary} />
              </View>
              <Text style={[styles.welcomeTitle, { color: colors.text }]}>Welcome to your AI Assistant</Text>
              <Text style={[styles.welcomeText, { color: colors.textSecondary }]}>
                I can help you manage your emails, create rules, prioritize messages, and save time.
              </Text>
            </View>

            <View style={styles.suggestionsContainer}>
              <Text style={[styles.suggestionsTitle, { color: colors.text }]}>Try asking:</Text>
              {suggestions.map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.suggestionCard, { backgroundColor: colors.surface, borderLeftColor: colors.primary }]}
                  onPress={() => setInput(suggestion)}
                >
                  <Text style={[styles.suggestionText, { color: colors.text }]}>{suggestion}</Text>
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
            multiline
            maxLength={500}
          />
          <TouchableOpacity 
            testID="ai-send"
            style={[styles.sendButton, { backgroundColor: colors.primary }, !input.trim() && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!input.trim() || isTyping}
          >
            {isTyping ? (
              <Loader size={20} color="#FFFFFF" />
            ) : (
              <Send size={20} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </View>
      </KeyboardAvoidingView>
    </View>
  );
}

