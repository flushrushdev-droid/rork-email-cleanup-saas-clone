import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { History, MailX, ChevronRight, Sparkles, Users, UserX, FileText, Shield } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import Colors from '@/constants/colors';

export default function ToolsScreen() {
  const router = useRouter();

  const tools = [
    {
      id: 'automation-rules',
      title: 'Automation Rules',
      description: 'Create smart email workflows',
      icon: Shield,
      color: Colors.light.success,
      route: '/rules' as const,
    },
    {
      id: 'history',
      title: 'History',
      description: 'View app activity from the past 60 days',
      icon: History,
      color: Colors.light.secondary,
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
      color: Colors.light.danger,
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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tools</Text>
        <Text style={styles.subtitle}>Manage your inbox efficiently</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <TouchableOpacity
              key={tool.id}
              testID={`tool-${tool.id}`}
              style={styles.toolCard}
              onPress={() => router.push(tool.route)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: tool.color + '20' }]}>
                <Icon size={28} color={tool.color} />
              </View>
              <View style={styles.toolContent}>
                <Text style={styles.toolTitle}>{tool.title}</Text>
                <Text style={styles.toolDescription}>{tool.description}</Text>
              </View>
              <ChevronRight size={20} color={Colors.light.textSecondary} />
            </TouchableOpacity>
          );
        })}
        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
  },
  scrollContent: {
    padding: 16,
  },
  toolCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
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
    color: Colors.light.text,
    marginBottom: 4,
  },
  toolDescription: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 20,
  },
});
