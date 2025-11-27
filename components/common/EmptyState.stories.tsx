import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { storiesOf } from '@storybook/react-native';
import { Inbox, Mail, FolderOpen, Search } from 'lucide-react-native';
import { EmptyState } from './EmptyState';
import { ThemeProvider } from '@/contexts/ThemeContext';

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#F2F2F7',
    flex: 1,
  },
  section: {
    marginBottom: 30,
    minHeight: 300,
  },
});

storiesOf('Common/EmptyState', module)
  .addDecorator((story) => (
    <ThemeProvider>
      <ScrollView style={styles.container}>
        {story()}
      </ScrollView>
    </ThemeProvider>
  ))
  .add('Basic Empty State', () => (
    <View style={styles.section}>
      <EmptyState
        icon={Inbox}
        title="No emails"
        description="Your inbox is empty. New emails will appear here."
      />
    </View>
  ))
  .add('With Action Button', () => (
    <View style={styles.section}>
      <EmptyState
        icon={Mail}
        title="No emails found"
        description="Try adjusting your search or filters to find what you're looking for."
        actionLabel="Clear Filters"
        onAction={() => console.log('Clear filters clicked')}
      />
    </View>
  ))
  .add('With Icon Container', () => (
    <View style={styles.section}>
      <EmptyState
        icon={FolderOpen}
        title="No folders"
        description="Create your first folder to organize your emails."
        showIconContainer={true}
        actionLabel="Create Folder"
        onAction={() => console.log('Create folder clicked')}
      />
    </View>
  ))
  .add('Custom Icon Size', () => (
    <View style={styles.section}>
      <EmptyState
        icon={Search}
        title="No results"
        description="We couldn't find anything matching your search."
        iconSize={80}
        actionLabel="Try Again"
        onAction={() => console.log('Try again clicked')}
      />
    </View>
  ))
  .add('Custom Icon Color', () => (
    <View style={styles.section}>
      <EmptyState
        icon={Inbox}
        title="Empty Inbox"
        description="All caught up! Your inbox is empty."
        iconColor="#007AFF"
      />
    </View>
  ));

