import { StyleSheet } from 'react-native';

export function createRuleStyles(colors: any) {
  return StyleSheet.create({
    dropdownMenu: {
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      borderRadius: 12,
      marginTop: 4,
      borderWidth: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 5,
      zIndex: 1002,
      maxHeight: 200,
    },
    dropdownOption: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
    },
    dropdownOptionText: {
      fontSize: 14,
      fontWeight: '500',
    },
  });
}


