import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Sparkles, Send, Loader } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRorkAgent, createRorkTool } from '@/lib/rork-sdk';
import { z } from 'zod';

import { useTheme } from '@/contexts/ThemeContext';

export default function AIAssistantScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
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
                {message.parts.map((part, i) => {
                  if (part.type === 'text') {
                    return (
                      <View
                        key={`${message.id}-${i}`}
                        style={[
                          styles.messageBubble,
                          message.role === 'user' 
                            ? { ...styles.userBubble, backgroundColor: colors.primary } 
                            : { ...styles.assistantBubble, backgroundColor: colors.surface },
                        ]}
                      >
                        <Text
                          style={[
                            styles.messageText,
                            message.role === 'user' ? styles.userText : { color: colors.text },
                          ]}
                        >
                          {part.text}
                        </Text>
                      </View>
                    );
                  }
                  
                  if (part.type === 'tool') {
                    return (
                      <View key={`${message.id}-${i}`} style={[styles.toolBubble, { backgroundColor: colors.secondary + '15' }]}>
                        <Sparkles size={16} color={colors.secondary} />
                        <Text style={[styles.toolText, { color: colors.secondary }]}>
                          {part.state === 'input-streaming' || part.state === 'input-available'
                            ? `Calling ${part.toolName}...`
                            : part.state === 'output-available'
                            ? `Completed ${part.toolName}`
                            : `Error in ${part.toolName}`}
                        </Text>
                      </View>
                    );
                  }
                  
                  return null;
                })}
              </View>
            ))}
            
            {isTyping && (
              <View style={[styles.messageBubble, styles.assistantBubble, { backgroundColor: colors.surface }]}>
                <View style={styles.typingIndicator}>
                  <View style={[styles.typingDot, styles.typingDot1, { backgroundColor: colors.textSecondary }]} />
                  <View style={[styles.typingDot, styles.typingDot2, { backgroundColor: colors.textSecondary }]} />
                  <View style={[styles.typingDot, styles.typingDot3, { backgroundColor: colors.textSecondary }]} />
                </View>
              </View>
            )}
            
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

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 16,
  },
  contentContainer: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    padding: 16,
  },
  welcomeCard: {
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  welcomeIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  suggestionsContainer: {
    gap: 12,
  },
  suggestionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  suggestionCard: {
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  suggestionText: {
    fontSize: 15,
    fontWeight: '500',
  },
  messagesContainer: {
    padding: 16,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
  },
  userBubble: {
    alignSelf: 'flex-end',
  },
  assistantBubble: {
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: '#FFFFFF',
  },
  assistantText: {},
  toolBubble: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  toolText: {
    fontSize: 14,
    fontWeight: '600',
  },
  typingIndicator: {
    flexDirection: 'row',
    gap: 6,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  typingDot1: {
    opacity: 0.4,
  },
  typingDot2: {
    opacity: 0.6,
  },
  typingDot3: {
    opacity: 0.8,
  },
  inputContainer: {
    padding: 16,
    borderTopWidth: 1,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  input: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    paddingTop: 6,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
