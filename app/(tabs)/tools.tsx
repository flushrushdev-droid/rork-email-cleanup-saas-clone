import React from 'react';
import { Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { MailX, ChevronRight, Sparkles, Users, UserX, FileText, Shield, Calendar } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/contexts/ThemeContext';
import { createToolsStyles } from '@/styles/app/tools';

export default function ToolsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = React.useMemo(() => createToolsStyles(colors), [colors]);

  const tools = [
    {
      id: 'calendar',
      title: 'Calendar',
      description: 'Schedule and manage your meetings',
      icon: Calendar,
      color: '#5856D6',
      route: '/calendar' as const,
    },
    {
      id: 'notes',
      title: 'Notes',
      description: 'Quick notes and reminders for emails',
      icon: FileText,
      color: '#34C759',
      route: '/notes' as const,
    },
    {
      id: 'suggestions',
      title: 'Suggestions',
      description: 'Smart recommendations for your inbox',
      icon: Sparkles,
      color: '#FFA500',
      route: '/suggestions' as const,
    },
    {
      id: 'automation-rules',
      title: 'Automation Rules',
      description: 'Create smart email workflows',
      icon: Shield,
      color: '#34C759',
      route: '/rules' as const,
    },
    {
      id: 'unsubscribe',
      title: 'Unsubscribe Manager',
      description: 'Manage newsletter subscriptions',
      icon: MailX,
      color: '#FF3B30',
      route: '/unsubscribe' as const,
    },
    {
      id: 'top-senders',
      title: 'Top Senders',
      description: 'Manage and analyze your top email senders',
      icon: Users,
      color: '#007AFF',
      route: '/senders' as const,
    },
    {
      id: 'blocked-senders',
      title: 'Blocked Senders',
      description: 'Manage and unblock blocked senders',
      icon: UserX,
      color: '#FF3B30',
      route: '/blocked-senders' as const,
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={[styles.title, { color: colors.text }]}>Tools</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Manage your inbox efficiently</Text>
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 80 }]} showsVerticalScrollIndicator={false}>
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <TouchableOpacity
              key={tool.id}
              testID={`tool-${tool.id}`}
              style={[styles.toolCard, { backgroundColor: colors.surface }]}
              onPress={() => {
                if ('route' in tool) {
                  router.push(tool.route);
                }
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: tool.color + '20' }]}>
                <Icon size={28} color={tool.color} />
              </View>
              <View style={styles.toolContent}>
                <Text style={[styles.toolTitle, { color: colors.text }]}>{tool.title}</Text>
                <Text style={[styles.toolDescription, { color: colors.textSecondary }]}>{tool.description}</Text>
              </View>
              <ChevronRight size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

