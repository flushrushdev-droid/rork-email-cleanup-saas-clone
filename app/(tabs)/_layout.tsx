import { Tabs } from 'expo-router';
import { Activity, Sparkles, Settings, Wrench, Mail } from 'lucide-react-native';
import React from 'react';

import { useTheme } from '@/contexts/ThemeContext';

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabIconDefault,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          // Limit scaling for tab bar labels to prevent UI breaking
          maxFontSizeMultiplier: 1.15,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Overview',
          tabBarIcon: ({ color, size }) => <Activity size={size} color={color} />,
          tabBarAccessibilityLabel: 'Overview',
          tabBarAccessibilityHint: 'Double tap to view your email overview and statistics',
        }}
      />
      <Tabs.Screen
        name="mail"
        options={{
          title: 'Mail',
          tabBarIcon: ({ color, size }) => <Mail size={size} color={color} />,
          tabBarAccessibilityLabel: 'Mail',
          tabBarAccessibilityHint: 'Double tap to view your inbox',
        }}
      />
      <Tabs.Screen
        name="ai"
        options={{
          title: 'AI Assistant',
          tabBarIcon: ({ color, size }) => <Sparkles size={size} color={color} />,
          tabBarAccessibilityLabel: 'AI Assistant',
          tabBarAccessibilityHint: 'Double tap to open AI assistant',
        }}
      />
      <Tabs.Screen
        name="tools"
        options={{
          title: 'Tools',
          tabBarIcon: ({ color, size }) => <Wrench size={size} color={color} />,
          tabBarAccessibilityLabel: 'Tools',
          tabBarAccessibilityHint: 'Double tap to view available tools and utilities',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
          tabBarAccessibilityLabel: 'Settings',
          tabBarAccessibilityHint: 'Double tap to view app settings and preferences',
        }}
      />
      <Tabs.Screen
        name="folders"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
