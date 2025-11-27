import React from 'react';
import { View, StyleSheet } from 'react-native';
import { storiesOf } from '@storybook/react-native';
import { AppText } from './AppText';
import { ThemeProvider } from '@/contexts/ThemeContext';

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#F2F2F7',
  },
  darkContainer: {
    padding: 20,
    backgroundColor: '#000000',
  },
  section: {
    marginBottom: 20,
  },
});

storiesOf('Common/AppText', module)
  .addDecorator((story) => (
    <ThemeProvider>
      <View style={styles.container}>
        {story()}
      </View>
    </ThemeProvider>
  ))
  .add('Basic Text', () => (
    <View style={styles.section}>
      <AppText>Basic text without any styling</AppText>
    </View>
  ))
  .add('Dynamic Type Styles', () => (
    <View style={styles.section}>
      <AppText dynamicTypeStyle="largeTitle" style={{ marginBottom: 10 }}>
        Large Title
      </AppText>
      <AppText dynamicTypeStyle="title1" style={{ marginBottom: 10 }}>
        Title 1
      </AppText>
      <AppText dynamicTypeStyle="title2" style={{ marginBottom: 10 }}>
        Title 2
      </AppText>
      <AppText dynamicTypeStyle="title3" style={{ marginBottom: 10 }}>
        Title 3
      </AppText>
      <AppText dynamicTypeStyle="headline" style={{ marginBottom: 10 }}>
        Headline
      </AppText>
      <AppText dynamicTypeStyle="body" style={{ marginBottom: 10 }}>
        Body text
      </AppText>
      <AppText dynamicTypeStyle="callout" style={{ marginBottom: 10 }}>
        Callout
      </AppText>
      <AppText dynamicTypeStyle="subheadline" style={{ marginBottom: 10 }}>
        Subheadline
      </AppText>
      <AppText dynamicTypeStyle="footnote" style={{ marginBottom: 10 }}>
        Footnote
      </AppText>
      <AppText dynamicTypeStyle="caption1" style={{ marginBottom: 10 }}>
        Caption 1
      </AppText>
      <AppText dynamicTypeStyle="caption2">
        Caption 2
      </AppText>
    </View>
  ))
  .add('With Custom Styling', () => (
    <View style={styles.section}>
      <AppText style={{ fontSize: 24, fontWeight: 'bold', color: '#007AFF', marginBottom: 10 }}>
        Large Blue Bold Text
      </AppText>
      <AppText style={{ fontSize: 16, fontStyle: 'italic', color: '#8E8E93', marginBottom: 10 }}>
        Italic Gray Text
      </AppText>
      <AppText style={{ fontSize: 14, textDecorationLine: 'underline', color: '#FF3B30' }}>
        Underlined Red Text
      </AppText>
    </View>
  ))
  .add('Accessibility', () => (
    <View style={styles.section}>
      <AppText
        accessibilityLabel="This is an accessible text element"
        accessibilityHint="This text provides additional context"
        accessibilityRole="text"
      >
        Accessible Text
      </AppText>
    </View>
  ))
  .add('Dark Mode', () => (
    <ThemeProvider>
      <View style={styles.darkContainer}>
        <AppText dynamicTypeStyle="title1" style={{ color: '#FFFFFF', marginBottom: 10 }}>
          Title in Dark Mode
        </AppText>
        <AppText dynamicTypeStyle="body" style={{ color: '#FFFFFF', marginBottom: 10 }}>
          Body text in dark mode
        </AppText>
        <AppText dynamicTypeStyle="caption1" style={{ color: '#98989D' }}>
          Caption text in dark mode
        </AppText>
      </View>
    </ThemeProvider>
  ));

