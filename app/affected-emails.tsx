import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Mail, Archive, Trash2, FolderOpen } from 'lucide-react-native';

import Colors from '@/constants/colors';

type SuggestionType = 'archive' | 'delete' | 'move';

export default function AffectedEmailsScreen() {
  const params = useLocalSearchParams();
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
        return Colors.light.primary;
      case 'delete':
        return Colors.light.danger;
      case 'move':
        return Colors.light.secondary;
    }
  };

  const Icon = getIcon();
  const color = getColor();

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Affected Emails',
          headerStyle: {
            backgroundColor: Colors.light.surface,
          },
          headerTintColor: Colors.light.text,
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
            <View key={index} style={styles.emailCard}>
              <View style={styles.emailIcon}>
                <Mail size={20} color={Colors.light.textSecondary} />
              </View>
              <View style={styles.emailContent}>
                <Text style={styles.emailAddress}>{email}</Text>
                <Text style={styles.emailMeta}>
                  {Math.floor(parseInt(count) / emails.length)} emails
                </Text>
              </View>
            </View>
          ))}
          <View style={{ height: 100 }} />
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    padding: 20,
    backgroundColor: Colors.light.surface,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
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
    color: Colors.light.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  scrollContent: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 12,
    marginTop: 4,
  },
  emailCard: {
    backgroundColor: Colors.light.surface,
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
    backgroundColor: Colors.light.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emailContent: {
    flex: 1,
  },
  emailAddress: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 2,
  },
  emailMeta: {
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
});
