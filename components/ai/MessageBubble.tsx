import React from 'react';
import { View } from 'react-native';
import { AppText } from '@/components/common/AppText';
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
        <AppText
          style={[
            styles.messageText,
            role === 'user' ? styles.userText : { color: colors.text },
          ]}
          dynamicTypeStyle="body"
        >
          {part.text}
        </AppText>
      </View>
    );
  }
  
  if (part.type === 'tool') {
    return (
      <View style={[styles.toolBubble, { backgroundColor: colors.secondary + '15' }]}>
        <Sparkles size={16} color={colors.secondary} />
        <AppText style={[styles.toolText, { color: colors.secondary }]} dynamicTypeStyle="caption">
          {part.state === 'input-streaming' || part.state === 'input-available'
            ? `Calling ${part.toolName}...`
            : part.state === 'output-available'
            ? `Completed ${part.toolName}`
            : `Error in ${part.toolName}`}
        </AppText>
      </View>
    );
  }
  
  return null;
}

