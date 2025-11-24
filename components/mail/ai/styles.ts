import { StyleSheet } from 'react-native';

/**
 * Creates AI modal styles based on theme colors
 */
export function createAIStyles(colors: any) {
  return StyleSheet.create({
    // Modal styles
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
    // Prompt styles
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
    // Dropdown styles
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
    // Button styles
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
}


