import React from 'react';
import { Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Mail } from 'lucide-react-native';

import { useTheme } from '@/contexts/ThemeContext';
import { createAffectedEmailsStyles } from '@/styles/app/affected-emails';
import { getSuggestionIcon, getSuggestionColor } from '@/utils/suggestionUtils';
import type { SuggestionType } from '@/utils/suggestionUtils';

export default function AffectedEmailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { colors } = useTheme();
  const title = params.title as string;
  const emails = JSON.parse(params.emails as string) as string[];
  const count = params.count as string;
  const type = params.type as SuggestionType;

  const Icon = getSuggestionIcon(type);
  const color = getSuggestionColor(type, colors);
  const styles = React.useMemo(() => createAffectedEmailsStyles(colors), [colors]);

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

