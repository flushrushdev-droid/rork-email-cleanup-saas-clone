import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Skeleton } from './Skeleton';
import { useTheme } from '@/contexts/ThemeContext';

interface CardSkeletonProps {
  /**
   * Number of skeleton cards to render
   */
  count?: number;
  /**
   * Card variant: 'default' (vertical) or 'compact' (horizontal)
   */
  variant?: 'default' | 'compact';
  /**
   * Custom style for container
   */
  style?: any;
}

/**
 * Skeleton loader for stat cards
 * 
 * @example
 * {isLoading ? (
 *   <CardSkeleton count={3} variant="compact" />
 * ) : (
 *   <StatCards stats={stats} />
 * )}
 */
export function CardSkeleton({ count = 3, variant = 'default', style }: CardSkeletonProps) {
  const { colors } = useTheme();

  if (variant === 'compact') {
    return (
      <View style={[styles.compactContainer, style]}>
        {Array.from({ length: count }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.compactCard,
              {
                backgroundColor: colors.surface,
              },
            ]}
          >
            {/* Icon skeleton */}
            <Skeleton width={18} height={18} borderRadius={4} />
            
            {/* Content */}
            <View style={styles.compactContent}>
              <Skeleton width={40} height={18} borderRadius={4} />
              <Skeleton width={60} height={12} borderRadius={4} />
            </View>
          </View>
        ))}
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
            },
          ]}
        >
          {/* Icon skeleton */}
          <Skeleton width={20} height={20} borderRadius={4} />
          
          {/* Value skeleton */}
          <Skeleton width={50} height={18} borderRadius={4} />
          
          {/* Label skeleton */}
          <Skeleton width={70} height={12} borderRadius={4} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  card: {
    alignItems: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 8,
    minWidth: 100,
  },
  compactContainer: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  compactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 8,
    flex: 1,
    minWidth: 120,
  },
  compactContent: {
    flex: 1,
    gap: 4,
  },
});


