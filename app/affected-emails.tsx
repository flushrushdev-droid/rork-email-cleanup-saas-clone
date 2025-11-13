import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Mail, Archive, Trash2, FolderOpen } from 'lucide-react-native';

import { useTheme } from '@/contexts/ThemeContext';

type SuggestionType = 'archive' | 'delete' | 'move';

export default function AffectedEmailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { colors } = useTheme();
  const title = params.title as string;
  const emails = JSON.parse(params.emails as string) as string[];
  const count = params.count as string;
  const type = params.type as SuggestionType;

  const getIcon = () => {
    switch (type) {
      case 'archive':
        return Archive;
      case 'delete':
        return Trash2;
      case 'move':
        return FolderOpen;
    }
  };

  const getColor = () => {
    switch (type) {
      case 'archive':
        return colors.primary;
      case 'delete':
        return colors.danger;
      case 'move':
        return colors.secondary;
    }
  };

  const Icon = getIcon();
  const color = getColor();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Affected Emails',
          headerStyle: {
            backgroundColor: colors.surface,
          },
          headerTintColor: colors.text,
        }}
      />
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={[styles.headerIcon, { backgroundColor: color + '20' }]}>
            <Icon size={28} color={color} />
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>
            {count} emails will be affected by this action
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>Email Senders</Text>
          {emails.map((email, index) => (
            <TouchableOpacity
              key={index}
              style={styles.emailCard}
              onPress={() => {
                router.push({
                  pathname: '/sender-emails',
                  params: {
                    senderEmail: email,
                    senderName: email.split('@')[0],
                  },
                });
              }}
              activeOpacity={0.7}
            >
              <View style={styles.emailIcon}>
                <Mail size={20} color={colors.textSecondary} />
              </View>
              <View style={styles.emailContent}>
                <Text style={styles.emailAddress}>{email}</Text>
                <Text style={styles.emailMeta}>
                  {Math.floor(parseInt(count) / emails.length)} emails
                </Text>
              </View>
            </TouchableOpacity>
          ))}
          <View style={{ height: 100 }} />
        </ScrollView>
      </View>
    </>
  );
}

function createStyles(colors: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      padding: 20,
      backgroundColor: colors.surface,
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerIcon: {
      width: 64,
      height: 64,
      borderRadius: 32,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    title: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 15,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
    },
    scrollContent: {
      padding: 16,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12,
      marginTop: 4,
    },
    emailCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 10,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    emailIcon: {
      width: 40,
      height: 40,
      borderRadius: 10,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emailContent: {
      flex: 1,
    },
    emailAddress: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 2,
    },
    emailMeta: {
      fontSize: 13,
      color: colors.textSecondary,
    },
  });
}
