import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { storiesOf } from '@storybook/react-native';
import { Mail, Archive, Trash2, Clock } from 'lucide-react-native';
import { StatCard } from './StatCard';
import { ThemeProvider } from '@/contexts/ThemeContext';

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#F2F2F7',
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 20,
  },
  section: {
    marginBottom: 30,
  },
});

storiesOf('Common/StatCard', module)
  .addDecorator((story) => (
    <ThemeProvider>
      <ScrollView style={styles.container}>
        {story()}
      </ScrollView>
    </ThemeProvider>
  ))
  .add('Default Variant', () => (
    <View style={styles.section}>
      <View style={styles.row}>
        <StatCard icon={Mail} value="1,234" label="Unread" />
        <StatCard icon={Archive} value="567" label="Archived" />
        <StatCard icon={Trash2} value="89" label="Trashed" />
        <StatCard icon={Clock} value="12" label="Pending" />
      </View>
    </View>
  ))
  .add('Compact Variant', () => (
    <View style={styles.section}>
      <View style={styles.row}>
        <StatCard icon={Mail} value="1,234" label="Unread Emails" variant="compact" />
        <StatCard icon={Archive} value="567" label="Archived Items" variant="compact" />
        <StatCard icon={Trash2} value="89" label="Trashed Items" variant="compact" />
        <StatCard icon={Clock} value="12" label="Pending Actions" variant="compact" />
      </View>
    </View>
  ))
  .add('With Custom Colors', () => (
    <View style={styles.section}>
      <View style={styles.row}>
        <StatCard 
          icon={Mail} 
          value="1,234" 
          label="Unread" 
          iconColor="#007AFF"
          valueColor="#007AFF"
        />
        <StatCard 
          icon={Archive} 
          value="567" 
          label="Archived" 
          iconColor="#34C759"
          valueColor="#34C759"
        />
        <StatCard 
          icon={Trash2} 
          value="89" 
          label="Trashed" 
          iconColor="#FF3B30"
          valueColor="#FF3B30"
        />
      </View>
    </View>
  ))
  .add('Clickable Cards', () => (
    <View style={styles.section}>
      <View style={styles.row}>
        <StatCard 
          icon={Mail} 
          value="1,234" 
          label="Unread" 
          onPress={() => console.log('Unread clicked')}
        />
        <StatCard 
          icon={Archive} 
          value="567" 
          label="Archived" 
          onPress={() => console.log('Archived clicked')}
        />
        <StatCard 
          icon={Trash2} 
          value="89" 
          label="Trashed" 
          onPress={() => console.log('Trashed clicked')}
        />
      </View>
    </View>
  ))
  .add('Numeric Values', () => (
    <View style={styles.section}>
      <View style={styles.row}>
        <StatCard icon={Mail} value={1234} label="Unread" />
        <StatCard icon={Archive} value={567} label="Archived" />
        <StatCard icon={Trash2} value={89} label="Trashed" />
        <StatCard icon={Clock} value={0} label="Pending" />
      </View>
    </View>
  ));

