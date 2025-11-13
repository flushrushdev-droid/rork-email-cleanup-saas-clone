import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { History, MailX, ChevronRight, Sparkles, Users, UserX, FileText, Shield, Calendar } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/contexts/ThemeContext';
import { useCalendar } from '@/hooks/useCalendar';
import { CalendarSidebar } from '@/components/CalendarSidebar';

export default function ToolsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const calendar = useCalendar();

  const tools = [
    {
      id: 'calendar',
      title: 'Calendar',
      description: 'Schedule and manage your meetings',
      icon: Calendar,
      color: '#5856D6',
      action: 'calendar' as const,
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
      id: 'history',
      title: 'History',
      description: 'View app activity from the past 60 days',
      icon: History,
      color: '#8E8E93',
      route: '/history' as const,
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
    {
      id: 'notes',
      title: 'Notes',
      description: 'Quick notes and reminders for emails',
      icon: FileText,
      color: '#34C759',
      route: '/notes' as const,
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
      id: 'suggestions',
      title: 'Suggestions',
      description: 'Smart recommendations for your inbox',
      icon: Sparkles,
      color: '#FFA500',
      route: '/suggestions' as const,
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
                if ('action' in tool && tool.action === 'calendar') {
                  calendar.toggleCalendar();
                } else if ('route' in tool) {
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

      <CalendarSidebar 
        {...calendar}
        insets={insets}
        colors={colors}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  scrollContent: {
    padding: 16,
  },
  toolCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolContent: {
    flex: 1,
  },
  toolTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  toolDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
});
