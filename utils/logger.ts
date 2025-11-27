/**
 * Logger Utility
 * 
 * Environment-aware logging utility that:
 * - Logs to console in development
 * - Can be enhanced later with external logging service (Sentry, LogRocket, etc.)
 * - Provides structured logging interface
 * - Can be easily extended to send logs to remote services in production
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: unknown;
  timestamp: string;
  context?: Record<string, unknown>;
}

/**
 * Check if we're in development mode
 */
const isDev = typeof __DEV__ !== 'undefined' ? __DEV__ : process.env.NODE_ENV !== 'production';

/**
 * Format log entry for console output
 */
const formatLogMessage = (entry: LogEntry): string => {
  const { level, message, timestamp } = entry;
  const time = new Date(timestamp).toISOString();
  return `[${time}] [${level.toUpperCase()}] ${message}`;
};

/**
 * Base logger function that can be extended with external logging services
 */
const log = (level: LogLevel, message: string, data?: unknown, context?: Record<string, unknown>) => {
  const entry: LogEntry = {
    level,
    message,
    data,
    timestamp: new Date().toISOString(),
    context,
  };

  // In development, always log to console
  if (isDev) {
    const formattedMessage = formatLogMessage(entry);
    
    switch (level) {
      case 'debug':
        // eslint-disable-next-line no-console
        console.debug(formattedMessage, data || '', context || '');
        break;
      case 'info':
        // eslint-disable-next-line no-console
        console.log(formattedMessage, data || '', context || '');
        break;
      case 'warn':
        // eslint-disable-next-line no-console
        console.warn(formattedMessage, data || '', context || '');
        break;
      case 'error':
        // eslint-disable-next-line no-console
        console.error(formattedMessage, data || '', context || '');
        break;
    }
  }

  // TODO: In production, send to external logging service (Sentry, LogRocket, etc.)
  // This is where Recommendation #22 (Error Logging Service) would integrate
  // Example:
  // if (!isDev) {
  //   sendToLoggingService(entry);
  // }
};

/**
 * Logger API
 * 
 * Usage:
 * - logger.debug('Debug message', optionalData, optionalContext)
 * - logger.info('Info message', optionalData)
 * - logger.warn('Warning message', optionalData)
 * - logger.error('Error message', errorObject, optionalContext)
 */
export const logger = {
  /**
   * Debug-level logging (only in development)
   */
  debug: (message: string, data?: unknown, context?: Record<string, unknown>) => {
    if (isDev) {
      log('debug', message, data, context);
    }
  },

  /**
   * Info-level logging
   */
  info: (message: string, data?: unknown, context?: Record<string, unknown>) => {
    log('info', message, data, context);
  },

  /**
   * Warning-level logging
   */
  warn: (message: string, data?: unknown, context?: Record<string, unknown>) => {
    log('warn', message, data, context);
  },

  /**
   * Error-level logging
   * Automatically extracts error details if Error object is passed
   */
  error: (message: string, error?: unknown, context?: Record<string, unknown>) => {
    let errorData = error;
    
    // Extract error details if Error object
    if (error instanceof Error) {
      errorData = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }

    log('error', message, errorData, context);
  },
};

/**
 * Create a scoped logger with a prefix for easier identification
 * 
 * @example
 * const authLogger = createScopedLogger('Auth');
 * authLogger.info('User signed in'); // Logs: "[Auth] User signed in"
 */
export const createScopedLogger = (scope: string) => ({
  debug: (message: string, data?: unknown, context?: Record<string, unknown>) => {
    logger.debug(`[${scope}] ${message}`, data, context);
  },
  info: (message: string, data?: unknown, context?: Record<string, unknown>) => {
    logger.info(`[${scope}] ${message}`, data, context);
  },
  warn: (message: string, data?: unknown, context?: Record<string, unknown>) => {
    logger.warn(`[${scope}] ${message}`, data, context);
  },
  error: (message: string, error?: unknown, context?: Record<string, unknown>) => {
    logger.error(`[${scope}] ${message}`, error, context);
  },
});


