import React from 'react';
import { Text, View, FlatList, TouchableOpacity, ListRenderItem } from 'react-native';
import { MailX, ChevronRight, Sparkles, Users, UserX, FileText, Shield, Calendar } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/contexts/ThemeContext';
import { createToolsStyles } from '@/styles/app/tools';
import { getOptimizedFlatListProps } from '@/utils/listConfig';

export default function ToolsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = React.useMemo(() => createToolsStyles(colors), [colors]);

  const tools = React.useMemo(() => [
    {
      id: 'calendar',
      title: 'Calendar',
      description: 'Schedule and manage your meetings',
      icon: Calendar,
      color: colors.secondary,
      route: '/calendar' as const,
    },
    {
      id: 'notes',
      title: 'Notes',
      description: 'Quick notes and reminders for emails',
      icon: FileText,
      color: colors.success,
      route: '/notes' as const,
    },
    {
      id: 'suggestions',
      title: 'Suggestions',
      description: 'Smart recommendations for your inbox',
      icon: Sparkles,
      color: colors.warning,
      route: '/suggestions' as const,
    },
    {
      id: 'automation-rules',
      title: 'Automation Rules',
      description: 'Create smart email workflows',
      icon: Shield,
      color: colors.success,
      route: '/rules' as const,
    },
    {
      id: 'unsubscribe',
      title: 'Unsubscribe Manager',
      description: 'Manage newsletter subscriptions',
      icon: MailX,
      color: colors.danger,
      route: '/unsubscribe' as const,
    },
    {
      id: 'top-senders',
      title: 'Top Senders',
      description: 'Manage and analyze your top email senders',
      icon: Users,
      color: colors.primary,
      route: '/senders' as const,
    },
    {
      id: 'blocked-senders',
      title: 'Blocked Senders',
      description: 'Manage and unblock blocked senders',
      icon: UserX,
      color: colors.danger,
      route: '/blocked-senders' as const,
    },
  ], [colors]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text 
          style={[styles.title, { color: colors.text }]}
          accessible={true}
          accessibilityRole="header"
          accessibilityLabel="Tools"
        >
          Tools
        </Text>
        <Text 
          style={[styles.subtitle, { color: colors.textSecondary }]}
          accessible={true}
          accessibilityRole="text"
        >
          Manage your inbox efficiently
        </Text>
      </View>

      <FlatList
        data={tools}
        renderItem={({ item: tool }) => {
          const Icon = tool.icon;
          return (
            <TouchableOpacity
              testID={`tool-${tool.id}`}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={tool.title}
              accessibilityHint={tool.description + '. Double tap to open.'}
              style={[styles.toolCard, { backgroundColor: colors.surface }]}
              onPress={() => {
                if ('route' in tool) {
                  router.push(tool.route);
                }
              }}
              activeOpacity={0.7}
            >
              <View 
                style={[styles.iconContainer, { backgroundColor: tool.color + '20' }]}
                accessible={true}
                accessibilityRole="image"
                accessibilityLabel={`${tool.title} icon`}
              >
                <Icon size={28} color={tool.color} />
              </View>
              <View style={styles.toolContent}>
                <Text 
                  style={[styles.toolTitle, { color: colors.text }]}
                  accessible={true}
                  accessibilityRole="text"
                >
                  {tool.title}
                </Text>
                <Text 
                  style={[styles.toolDescription, { color: colors.textSecondary }]}
                  accessible={true}
                  accessibilityRole="text"
                >
                  {tool.description}
                </Text>
              </View>
              <ChevronRight size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          );
        }}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 80 }]}
        showsVerticalScrollIndicator={false}
        {...getOptimizedFlatListProps()}
      />
    </View>
  );
}

