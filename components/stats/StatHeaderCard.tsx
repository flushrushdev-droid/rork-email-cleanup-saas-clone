/**
 * Stat Header Card Component
 * 
 * Displays a header card with icon, count, and description for stat detail screens.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { LucideIcon } from 'lucide-react-native';
import type { ThemeColors } from '@/constants/colors';

export interface StatHeaderCardProps {
  icon: LucideIcon;
  count: string | number;
  description: string;
  color: string;
  colors: ThemeColors;
  styles: ReturnType<typeof createStyles>;
}

function createStyles() {
  return StyleSheet.create({
    headerCard: {
      borderRadius: 20,
      padding: 24,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 24,
      width: '100%',
      alignSelf: 'stretch',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 5,
    },
    headerIcon: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: 'rgba(255,255,255,0.2)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    headerCount: {
      fontSize: 48,
      fontWeight: '800',
      color: '#FFFFFF',
      marginBottom: 8,
    },
    headerDescription: {
      fontSize: 16,
      color: 'rgba(255,255,255,0.9)',
      textAlign: 'center',
      lineHeight: 22,
    },
  });
}

export function StatHeaderCard({
  icon: IconComponent,
  count,
  description,
  color,
  colors,
}: StatHeaderCardProps) {
  const styles = React.useMemo(() => createStyles(), []);

  return (
    <View style={[styles.headerCard, { backgroundColor: color }]}>
      <View style={styles.headerIcon}>
        <IconComponent size={32} color={colors.surface} />
      </View>
      <AppText style={styles.headerCount} dynamicTypeStyle="title1">
        {count}
      </AppText>
      <AppText style={styles.headerDescription} dynamicTypeStyle="body">
        {description}
      </AppText>
    </View>
  );
}

