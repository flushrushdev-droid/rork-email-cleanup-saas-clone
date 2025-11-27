import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AlertCircle, X } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { AccessibleButton } from './AccessibleButton';
import { formatErrorMessage, isRetryableError, normalizeError, type AppError } from '@/utils/errorHandling';

export type ErrorDisplayVariant = 'inline' | 'toast' | 'alert';

export interface ErrorDisplayProps {
  /**
   * The error to display
   */
  error: AppError | Error | unknown;
  /**
   * Display variant
   */
  variant?: ErrorDisplayVariant;
  /**
   * Show retry button if error is retryable
   */
  showRetry?: boolean;
  /**
   * Callback when retry is pressed
   */
  onRetry?: () => void;
  /**
   * Callback when error is dismissed
   */
  onDismiss?: () => void;
  /**
   * Custom error message (overrides formatted message)
   */
  message?: string;
  /**
   * Additional style
   */
  style?: any;
}

/**
 * ErrorDisplay - Reusable error message component
 * 
 * @example
 * <ErrorDisplay
 *   error={error}
 *   variant="inline"
 *   showRetry={true}
 *   onRetry={handleRetry}
 * />
 */
export function ErrorDisplay({
  error,
  variant = 'inline',
  showRetry = true,
  onRetry,
  onDismiss,
  message,
  style,
}: ErrorDisplayProps) {
  const { colors } = useTheme();
  const appError = normalizeError(error);
  const errorMessage = message || formatErrorMessage(appError);
  const canRetry = showRetry && isRetryableError(appError) && onRetry;

  if (variant === 'toast') {
    return (
      <View style={[styles.toastContainer, { backgroundColor: colors.danger }, style]}>
        <AlertCircle size={16} color={colors.surface} />
        <Text style={[styles.toastText, { color: colors.surface }]} numberOfLines={2}>
          {errorMessage}
        </Text>
        {onDismiss && (
          <TouchableOpacity
            onPress={onDismiss}
            accessibilityLabel="Dismiss error"
            accessibilityRole="button"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X size={16} color={colors.surface} />
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (variant === 'alert') {
    return (
      <View style={[styles.alertContainer, { backgroundColor: colors.danger + '15', borderLeftColor: colors.danger }, style]}>
        <View style={styles.alertContent}>
          <AlertCircle size={20} color={colors.danger} />
          <Text style={[styles.alertText, { color: colors.text }]}>
            {errorMessage}
          </Text>
        </View>
        {canRetry && (
          <AccessibleButton
            accessibilityLabel="Retry operation"
            accessibilityHint="Attempts to retry the failed operation"
            onPress={onRetry}
            style={[styles.retryButton, { borderColor: colors.danger }]}
          >
            <Text style={[styles.retryButtonText, { color: colors.danger }]}>
              Retry
            </Text>
          </AccessibleButton>
        )}
        {onDismiss && (
          <TouchableOpacity
            onPress={onDismiss}
            accessibilityLabel="Dismiss error"
            accessibilityRole="button"
            style={styles.dismissButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // Default: inline variant
  return (
    <View style={[styles.inlineContainer, style]}>
      <View style={styles.inlineContent}>
        <AlertCircle size={16} color={colors.danger} />
        <Text style={[styles.inlineText, { color: colors.danger }]}>
          {errorMessage}
        </Text>
      </View>
      {canRetry && (
        <AccessibleButton
          accessibilityLabel="Retry operation"
          accessibilityHint="Attempts to retry the failed operation"
          onPress={onRetry}
          style={styles.inlineRetryButton}
        >
          <Text style={[styles.inlineRetryText, { color: colors.primary }]}>
            Retry
          </Text>
        </AccessibleButton>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  toastContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  toastText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  alertContainer: {
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    marginVertical: 8,
  },
  alertContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  alertText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  retryButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  dismissButton: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  inlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  inlineContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  inlineText: {
    fontSize: 12,
    flex: 1,
  },
  inlineRetryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  inlineRetryText: {
    fontSize: 12,
    fontWeight: '600',
  },
});


