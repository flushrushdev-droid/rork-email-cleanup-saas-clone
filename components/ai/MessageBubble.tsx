import React from 'react';
import { View, Text } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { createAIStyles } from '@/styles/app/ai';

interface MessageBubbleProps {
  part: {
    type: 'text' | 'tool';
    text?: string;
    state?: string;
    toolName?: string;
  };
  role: 'user' | 'assistant';
  colors: any;
}

export function MessageBubble({ part, role, colors }: MessageBubbleProps) {
  const styles = createAIStyles(colors);

  if (part.type === 'text' && part.text) {
    return (
      <View
        style={[
          styles.messageBubble,
          role === 'user' 
            ? { ...styles.userBubble, backgroundColor: colors.primary } 
            : { ...styles.assistantBubble, backgroundColor: colors.surface },
        ]}
      >
        <Text
          style={[
            styles.messageText,
            role === 'user' ? styles.userText : { color: colors.text },
          ]}
        >
          {part.text}
        </Text>
      </View>
    );
  }
  
  if (part.type === 'tool') {
    return (
      <View style={[styles.toolBubble, { backgroundColor: colors.secondary + '15' }]}>
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
}

