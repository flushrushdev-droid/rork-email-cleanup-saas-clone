/**
 * FlatList Configuration Utilities
 * 
 * Provides optimized FlatList props for consistent performance
 * across all list components in the app.
 * 
 * These settings are optimized for:
 * - Memory efficiency
 * - Smooth scrolling performance
 * - Fast initial render
 */

import type { FlatListProps } from 'react-native';

/**
 * Optimized FlatList performance props
 * 
 * These settings provide a good balance between:
 * - Initial render speed (initialNumToRender: 10)
 * - Memory usage (windowSize: 10)
 * - Smooth scrolling (maxToRenderPerBatch: 10)
 * - Update batching (updateCellsBatchingPeriod: 50ms)
 * 
 * @example
 * ```tsx
 * <FlatList
 *   data={items}
 *   renderItem={renderItem}
 *   {...getOptimizedFlatListProps()}
 * />
 * ```
 */
export function getOptimizedFlatListProps<T = any>(): Pick<
  FlatListProps<T>,
  | 'removeClippedSubviews'
  | 'initialNumToRender'
  | 'maxToRenderPerBatch'
  | 'windowSize'
  | 'updateCellsBatchingPeriod'
> {
  return {
    removeClippedSubviews: true,
    initialNumToRender: 10,
    maxToRenderPerBatch: 10,
    windowSize: 10,
    updateCellsBatchingPeriod: 50,
  };
}

/**
 * FlatList props for large lists (1000+ items)
 * 
 * More aggressive optimization for very long lists:
 * - Smaller initial render (8 items)
 * - Smaller window size (8)
 * - Smaller batch size (8)
 * 
 * @example
 * ```tsx
 * <FlatList
 *   data={largeList}
 *   renderItem={renderItem}
 *   {...getOptimizedFlatListPropsForLargeList()}
 * />
 * ```
 */
export function getOptimizedFlatListPropsForLargeList<T = any>(): Pick<
  FlatListProps<T>,
  | 'removeClippedSubviews'
  | 'initialNumToRender'
  | 'maxToRenderPerBatch'
  | 'windowSize'
  | 'updateCellsBatchingPeriod'
> {
  return {
    removeClippedSubviews: true,
    initialNumToRender: 8,
    maxToRenderPerBatch: 8,
    windowSize: 8,
    updateCellsBatchingPeriod: 50,
  };
}

/**
 * FlatList props for small lists (< 50 items)
 * 
 * Less aggressive optimization for short lists:
 * - Larger initial render (15 items)
 * - Larger window size (15)
 * - Larger batch size (15)
 * 
 * @example
 * ```tsx
 * <FlatList
 *   data={smallList}
 *   renderItem={renderItem}
 *   {...getOptimizedFlatListPropsForSmallList()}
 * />
 * ```
 */
export function getOptimizedFlatListPropsForSmallList<T = any>(): Pick<
  FlatListProps<T>,
  | 'removeClippedSubviews'
  | 'initialNumToRender'
  | 'maxToRenderPerBatch'
  | 'windowSize'
  | 'updateCellsBatchingPeriod'
> {
  return {
    removeClippedSubviews: true,
    initialNumToRender: 15,
    maxToRenderPerBatch: 15,
    windowSize: 15,
    updateCellsBatchingPeriod: 50,
  };
}

/**
 * Default optimized FlatList props (alias for getOptimizedFlatListProps)
 * 
 * For convenience, you can import this constant directly:
 * 
 * @example
 * ```tsx
 * import { optimizedFlatListProps } from '@/utils/listConfig';
 * 
 * <FlatList
 *   data={items}
 *   renderItem={renderItem}
 *   {...optimizedFlatListProps}
 * />
 * ```
 */
export const optimizedFlatListProps = getOptimizedFlatListProps();

