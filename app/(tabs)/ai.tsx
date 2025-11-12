import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Sparkles, Send, Loader } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRorkAgent, createRorkTool } from '@rork-ai/toolkit-sdk';
import { z } from 'zod';

import Colors from '@/constants/colors';

export default function AIAssistantScreen() {
  const insets = useSafeAreaInsets();
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
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.titleContainer}>
          <Sparkles size={28} color={Colors.light.primary} />
          <Text style={styles.title}>AI Assistant</Text>
        </View>
        <Text style={styles.subtitle}>Your intelligent email helper</Text>
      </View>

      <View style={styles.contentContainer}>
        {messages.length === 0 ? (
          <ScrollView contentContainerStyle={styles.emptyContainer}>
            <View style={styles.welcomeCard}>
              <View style={styles.welcomeIcon}>
                <Sparkles size={48} color={Colors.light.primary} />
              </View>
              <Text style={styles.welcomeTitle}>Welcome to your AI Assistant</Text>
              <Text style={styles.welcomeText}>
                I can help you manage your emails, create rules, prioritize messages, and save time.
              </Text>
            </View>

            <View style={styles.suggestionsContainer}>
              <Text style={styles.suggestionsTitle}>Try asking:</Text>
              {suggestions.map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionCard}
                  onPress={() => setInput(suggestion)}
                >
                  <Text style={styles.suggestionText}>{suggestion}</Text>
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
                          message.role === 'user' ? styles.userBubble : styles.assistantBubble,
                        ]}
                      >
                        <Text
                          style={[
                            styles.messageText,
                            message.role === 'user' ? styles.userText : styles.assistantText,
                          ]}
                        >
                          {part.text}
                        </Text>
                      </View>
                    );
                  }
                  
                  if (part.type === 'tool') {
                    return (
                      <View key={`${message.id}-${i}`} style={styles.toolBubble}>
                        <Sparkles size={16} color={Colors.light.secondary} />
                        <Text style={styles.toolText}>
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
              <View style={[styles.messageBubble, styles.assistantBubble]}>
                <View style={styles.typingIndicator}>
                  <View style={[styles.typingDot, styles.typingDot1]} />
                  <View style={[styles.typingDot, styles.typingDot2]} />
                  <View style={[styles.typingDot, styles.typingDot3]} />
                </View>
              </View>
            )}
            
            <View style={{ height: 20 }} />
          </ScrollView>
        )}
      </View>

      <View style={[styles.inputContainer, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.inputBox}>
          <TextInput
            style={styles.input}
            placeholder="Ask me anything about your emails..."
            value={input}
            onChangeText={setInput}
            placeholderTextColor={Colors.light.textSecondary}
            multiline
            maxLength={500}
          />
          <TouchableOpacity 
            testID="ai-send"
            style={[styles.sendButton, !input.trim() && styles.sendButtonDisabled]}
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
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
    color: Colors.light.text,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
  },
  contentContainer: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    padding: 16,
  },
  welcomeCard: {
    backgroundColor: Colors.light.surface,
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
    backgroundColor: Colors.light.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  suggestionsContainer: {
    gap: 12,
  },
  suggestionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  suggestionCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: Colors.light.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  suggestionText: {
    fontSize: 15,
    color: Colors.light.text,
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
    backgroundColor: Colors.light.primary,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.light.surface,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: '#FFFFFF',
  },
  assistantText: {
    color: Colors.light.text,
  },
  toolBubble: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.light.secondary + '15',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  toolText: {
    fontSize: 14,
    color: Colors.light.secondary,
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
    backgroundColor: Colors.light.textSecondary,
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
    backgroundColor: Colors.light.background,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: Colors.light.surface,
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
    color: Colors.light.text,
    maxHeight: 100,
    paddingTop: 6,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
