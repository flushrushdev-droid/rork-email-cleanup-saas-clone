import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Skeleton } from './Skeleton';
import { useTheme } from '@/contexts/ThemeContext';

interface EmailSkeletonProps {
  /**
   * Number of skeleton items to render
   */
  count?: number;
  /**
   * Custom style for container
   */
  style?: any;
}

/**
 * Skeleton loader for email list items
 * 
 * @example
 * {isLoading ? (
 *   <EmailSkeleton count={5} />
 * ) : (
 *   <EmailList emails={emails} />
 * )}
 */
export function EmailSkeleton({ count = 5, style }: EmailSkeletonProps) {
  const { colors } = useTheme();

  return (
    <View style={style}>
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.container,
            {
              backgroundColor: colors.surface,
              borderLeftColor: colors.border,
            },
          ]}
        >
          {/* Avatar skeleton */}
          <Skeleton width={48} height={48} borderRadius={24} />

          {/* Content area */}
          <View style={styles.content}>
            {/* Header: sender and date */}
            <View style={styles.header}>
              <Skeleton width={120} height={16} borderRadius={4} />
              <Skeleton width={60} height={14} borderRadius={4} />
            </View>

            {/* Subject */}
            <View style={styles.subjectContainer}>
              <Skeleton width="85%" height={16} borderRadius={4} />
              <Skeleton width={16} height={16} borderRadius={4} />
            </View>

            {/* Snippet */}
            <View style={styles.snippetContainer}>
              <Skeleton width="100%" height={14} borderRadius={4} />
              <Skeleton width="75%" height={14} borderRadius={4} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderLeftWidth: 3,
    gap: 12,
    minHeight: 80,
  },
  content: {
    flex: 1,
    gap: 8,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  subjectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  snippetContainer: {
    gap: 4,
  },
});





