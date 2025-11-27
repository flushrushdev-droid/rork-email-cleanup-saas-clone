import { StyleSheet } from 'react-native';
import type { ThemeColors } from '@/constants/colors';

export function createAIStyles(colors: ThemeColors) {
  return StyleSheet.create({
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
}


