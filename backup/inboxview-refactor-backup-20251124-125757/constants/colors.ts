const lightColors = {
  primary: '#007AFF',
  primaryDark: '#0051D5',
  secondary: '#5856D6',
  success: '#34C759',
  warning: '#FF9500',
  danger: '#FF3B30',
  info: '#5AC8FA',
  
  background: '#F2F2F7',
  surface: '#FFFFFF',
  surfaceSecondary: '#F9F9FB',
  
  text: '#000000',
  textSecondary: '#8E8E93',
  textTertiary: '#C7C7CC',
  
  border: '#E5E5EA',
  divider: '#D1D1D6',
  
  chart: {
    blue: '#007AFF',
    purple: '#5856D6',
    pink: '#FF2D55',
    orange: '#FF9500',
    yellow: '#FFCC00',
    green: '#34C759',
    teal: '#5AC8FA',
    indigo: '#5856D6',
    red: '#FF3B30',
  },
  
  status: {
    actionRequired: '#FF3B30',
    waiting: '#FF9500',
    fyi: '#5AC8FA',
    lowValue: '#8E8E93',
  },
  
  category: {
    invoices: '#FF9500',
    receipts: '#34C759',
    travel: '#5AC8FA',
    hr: '#5856D6',
    legal: '#FF2D55',
    personal: '#007AFF',
    promotions: '#FFCC00',
    social: '#FF6482',
    system: '#8E8E93',
  }
};

const darkColors = {
  primary: '#0A84FF',
  primaryDark: '#0969DA',
  secondary: '#5E5CE6',
  success: '#32D74B',
  warning: '#FF9F0A',
  danger: '#FF453A',
  info: '#64D2FF',
  
  background: '#000000',
  surface: '#1C1C1E',
  surfaceSecondary: '#2C2C2E',
  
  text: '#FFFFFF',
  textSecondary: '#98989D',
  textTertiary: '#48484A',
  
  border: '#38383A',
  divider: '#48484A',
  
  chart: {
    blue: '#0A84FF',
    purple: '#5E5CE6',
    pink: '#FF375F',
    orange: '#FF9F0A',
    yellow: '#FFD60A',
    green: '#32D74B',
    teal: '#64D2FF',
    indigo: '#5E5CE6',
    red: '#FF453A',
  },
  
  status: {
    actionRequired: '#FF453A',
    waiting: '#FF9F0A',
    fyi: '#64D2FF',
    lowValue: '#98989D',
  },
  
  category: {
    invoices: '#FF9F0A',
    receipts: '#32D74B',
    travel: '#64D2FF',
    hr: '#5E5CE6',
    legal: '#FF375F',
    personal: '#0A84FF',
    promotions: '#FFD60A',
    social: '#FF6482',
    system: '#98989D',
  }
};

export default {
  light: {
    ...lightColors,
    tint: lightColors.primary,
    tabIconDefault: lightColors.textSecondary,
    tabIconSelected: lightColors.primary,
  },
  dark: {
    ...darkColors,
    tint: darkColors.primary,
    tabIconDefault: darkColors.textSecondary,
    tabIconSelected: darkColors.primary,
  },
};
