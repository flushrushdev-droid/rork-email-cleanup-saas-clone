import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { AlertCircle, RefreshCw } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { AccessibleButton } from './AccessibleButton';
import { formatErrorMessage, normalizeError } from '@/utils/errorHandling';
import { createScopedLogger } from '@/utils/logger';

const errorBoundaryLogger = createScopedLogger('ErrorBoundary');

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary - Catches React component errors and displays a fallback UI
 * 
 * @example
 * <ErrorBoundary onError={(error, errorInfo) => {
 *   // Handle error (e.g., log to error tracking service)
 * }}>
 *   <YourApp />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error for debugging
    errorBoundaryLogger.error('ErrorBoundary caught an error', error, { errorInfo });
    
    this.setState({
      errorInfo,
    });

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return <ErrorFallback error={this.state.error} onReset={this.handleReset} />;
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error | null;
  onReset: () => void;
}

function ErrorFallback({ error, onReset }: ErrorFallbackProps) {
  const { colors } = useTheme();
  const errorMessage = error ? formatErrorMessage(normalizeError(error)) : 'Something went wrong';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.iconContainer, { backgroundColor: colors.danger + '20' }]}>
          <AlertCircle size={48} color={colors.danger} />
        </View>
        
        <Text style={[styles.title, { color: colors.text }]}>
          Oops! Something went wrong
        </Text>
        
        <Text style={[styles.message, { color: colors.textSecondary }]}>
          {errorMessage}
        </Text>

        {__DEV__ && error && (
          <View style={[styles.debugContainer, { backgroundColor: colors.surface }]}>
            <Text style={[styles.debugTitle, { color: colors.text }]}>Error Details (Dev Only):</Text>
            <Text style={[styles.debugText, { color: colors.textSecondary }]}>
              {error.toString()}
            </Text>
            {error.stack && (
              <Text style={[styles.debugText, { color: colors.textSecondary }]}>
                {error.stack}
              </Text>
            )}
          </View>
        )}

        <AccessibleButton
          accessibilityLabel="Retry application"
          accessibilityHint="Attempts to reload the application after an error"
          onPress={onReset}
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
        >
          <View style={styles.retryButtonContent}>
            <RefreshCw size={20} color={colors.surface} />
            <Text style={[styles.retryButtonText, { color: colors.surface }]}>Try Again</Text>
          </View>
        </AccessibleButton>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  debugContainer: {
    width: '100%',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    maxHeight: 200,
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
  },
  retryButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});


