import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { storiesOf } from '@storybook/react-native';
import { Avatar } from './Avatar';
import { ThemeProvider } from '@/contexts/ThemeContext';

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#F2F2F7',
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  section: {
    marginBottom: 30,
  },
});

storiesOf('Common/Avatar', module)
  .addDecorator((story) => (
    <ThemeProvider>
      <ScrollView style={styles.container}>
        {story()}
      </ScrollView>
    </ThemeProvider>
  ))
  .add('With Initials (Name)', () => (
    <View style={styles.section}>
      <View style={styles.row}>
        <Avatar name="John Doe" size={40} />
        <Avatar name="Jane Smith" size={50} />
        <Avatar name="Bob Johnson" size={60} />
        <Avatar name="Alice Williams" size={80} />
      </View>
    </View>
  ))
  .add('With Initials (Email)', () => (
    <View style={styles.section}>
      <View style={styles.row}>
        <Avatar email="john@example.com" size={40} />
        <Avatar email="jane@example.com" size={50} />
        <Avatar email="bob@example.com" size={60} />
      </View>
    </View>
  ))
  .add('Different Sizes', () => (
    <View style={styles.section}>
      <View style={styles.row}>
        <Avatar name="User" size={24} />
        <Avatar name="User" size={32} />
        <Avatar name="User" size={40} />
        <Avatar name="User" size={48} />
        <Avatar name="User" size={64} />
        <Avatar name="User" size={80} />
      </View>
    </View>
  ))
  .add('With Profile Picture', () => (
    <View style={styles.section}>
      <View style={styles.row}>
        <Avatar 
          picture="https://i.pravatar.cc/150?img=1" 
          name="John Doe" 
          size={40} 
        />
        <Avatar 
          picture="https://i.pravatar.cc/150?img=2" 
          name="Jane Smith" 
          size={50} 
        />
        <Avatar 
          picture="https://i.pravatar.cc/150?img=3" 
          name="Bob Johnson" 
          size={60} 
        />
      </View>
    </View>
  ))
  .add('Custom Colors', () => (
    <View style={styles.section}>
      <View style={styles.row}>
        <Avatar name="User" size={50} backgroundColor="#FF3B30" />
        <Avatar name="User" size={50} backgroundColor="#34C759" />
        <Avatar name="User" size={50} backgroundColor="#007AFF" />
        <Avatar name="User" size={50} backgroundColor="#FF9500" />
        <Avatar name="User" size={50} backgroundColor="#5856D6" />
      </View>
    </View>
  ))
  .add('Single Initial', () => (
    <View style={styles.section}>
      <View style={styles.row}>
        <Avatar name="John" size={50} />
        <Avatar name="A" size={50} />
        <Avatar email="test@example.com" size={50} />
      </View>
    </View>
  ));

