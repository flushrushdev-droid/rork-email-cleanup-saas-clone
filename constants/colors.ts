const colors = {
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

export default {
  light: {
    ...colors,
    tint: colors.primary,
    tabIconDefault: colors.textSecondary,
    tabIconSelected: colors.primary,
  },
};
