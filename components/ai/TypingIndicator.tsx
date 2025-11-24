import React from 'react';
import { View } from 'react-native';
import { createAIStyles } from '@/styles/app/ai';

interface TypingIndicatorProps {
  colors: any;
}

export function TypingIndicator({ colors }: TypingIndicatorProps) {
  const styles = createAIStyles(colors);

  return (
    <View style={[styles.messageBubble, styles.assistantBubble, { backgroundColor: colors.surface }]}>
      <View style={styles.typingIndicator}>
        <View style={[styles.typingDot, styles.typingDot1, { backgroundColor: colors.textSecondary }]} />
        <View style={[styles.typingDot, styles.typingDot2, { backgroundColor: colors.textSecondary }]} />
        <View style={[styles.typingDot, styles.typingDot3, { backgroundColor: colors.textSecondary }]} />
      </View>
    </View>
  );
}

