/**
 * Client-Side Rate Limiting Utility
 * 
 * Provides rate limiting and exponential backoff for API calls to prevent:
 * - API abuse
 * - Excessive retry attempts
 * - Rate limit violations (429 errors)
 */

export interface RateLimitConfig {
  /** Maximum number of requests allowed in the time window */
  maxRequests: number;
  /** Time window in milliseconds */
  windowMs: number;
}

export interface RetryConfig {
  /** Maximum number of retry attempts */
  maxRetries: number;
  /** Initial delay in milliseconds before first retry */
  initialDelayMs: number;
  /** Maximum delay in milliseconds (caps exponential growth) */
  maxDelayMs: number;
  /** Multiplier for exponential backoff (e.g., 2 = double each time) */
  backoffMultiplier: number;
  /** Whether to retry on network errors */
  retryOnNetworkError: boolean;
  /** Whether to retry on 429 (rate limit) errors */
  retryOnRateLimit: boolean;
  /** Whether to retry on 5xx server errors */
  retryOnServerError: boolean;
}

/**
 * Default rate limit configuration
 * - 100 requests per minute for general API calls
 */
export const DEFAULT_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 100,
  windowMs: 60 * 1000, // 1 minute
};

/**
 * Default retry configuration
 * - 3 retries maximum
 * - Exponential backoff starting at 1 second
 * - Max delay of 30 seconds
 */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelayMs: 1000, // 1 second
  maxDelayMs: 30000, // 30 seconds
  backoffMultiplier: 2,
  retryOnNetworkError: true,
  retryOnRateLimit: true,
  retryOnServerError: true,
};

/**
 * Rate Limiter Class
 * 
 * Tracks request timestamps per key and enforces rate limits.
 * Automatically cleans up old entries to prevent memory leaks.
 */
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Clean up old entries every 5 minutes
    this.startCleanup();
  }

  /**
   * Check if a request can be made based on rate limit configuration
   * 
   * @param key - Unique identifier for the rate limit bucket (e.g., endpoint, user, etc.)
   * @param config - Rate limit configuration
   * @returns true if request is allowed, false if rate limited
   */
  canMakeRequest(key: string, config: RateLimitConfig = DEFAULT_RATE_LIMIT): boolean {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    
    // Filter out requests outside the time window
    const recentRequests = requests.filter(time => now - time < config.windowMs);
    
    // Check if we've exceeded the limit
    if (recentRequests.length >= config.maxRequests) {
      return false;
    }
    
    // Add current request timestamp
    recentRequests.push(now);
    this.requests.set(key, recentRequests);
    
    return true;
  }

  /**
   * Get the time until the next request can be made (in milliseconds)
   * 
   * @param key - Unique identifier for the rate limit bucket
   * @param config - Rate limit configuration
   * @returns Milliseconds until next request is allowed, or 0 if allowed now
   */
  getTimeUntilNextRequest(key: string, config: RateLimitConfig = DEFAULT_RATE_LIMIT): number {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    const recentRequests = requests.filter(time => now - time < config.windowMs);
    
    if (recentRequests.length < config.maxRequests) {
      return 0; // Can make request now
    }
    
    // Find the oldest request in the window
    const oldestRequest = Math.min(...recentRequests);
    const timeUntilOldestExpires = config.windowMs - (now - oldestRequest);
    
    return Math.max(0, timeUntilOldestExpires);
  }

  /**
   * Reset rate limit for a specific key
   * 
   * @param key - Unique identifier for the rate limit bucket
   */
  reset(key: string): void {
    this.requests.delete(key);
  }

  /**
   * Reset all rate limits
   */
  resetAll(): void {
    this.requests.clear();
  }

  /**
   * Start automatic cleanup of old entries
   */
  private startCleanup(): void {
    // Clean up every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  /**
   * Clean up old entries that are outside any reasonable time window
   */
  private cleanup(): void {
    const now = Date.now();
    const maxWindow = 10 * 60 * 1000; // 10 minutes (longer than any reasonable window)
    
    for (const [key, requests] of this.requests.entries()) {
      const recentRequests = requests.filter(time => now - time < maxWindow);
      
      if (recentRequests.length === 0) {
        // No recent requests, remove the key
        this.requests.delete(key);
      } else {
        // Update with only recent requests
        this.requests.set(key, recentRequests);
      }
    }
  }

  /**
   * Stop cleanup interval (useful for testing or cleanup)
   */
  stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

/**
 * Exponential Backoff Utility
 * 
 * Calculates delay for retry attempts using exponential backoff.
 */
export class ExponentialBackoff {
  /**
   * Calculate delay for a specific retry attempt
   * 
   * @param attemptNumber - The retry attempt number (0 = first retry)
   * @param config - Retry configuration
   * @returns Delay in milliseconds
   */
  static calculateDelay(attemptNumber: number, config: RetryConfig = DEFAULT_RETRY_CONFIG): number {
    const delay = config.initialDelayMs * Math.pow(config.backoffMultiplier, attemptNumber);
    return Math.min(delay, config.maxDelayMs);
  }

  /**
   * Wait for the calculated delay
   * 
   * @param attemptNumber - The retry attempt number
   * @param config - Retry configuration
   */
  static async wait(attemptNumber: number, config: RetryConfig = DEFAULT_RETRY_CONFIG): Promise<void> {
    const delay = this.calculateDelay(attemptNumber, config);
    return new Promise(resolve => setTimeout(resolve, delay));
  }
}

/**
 * Retry utility with exponential backoff
 * 
 * @param fn - Function to retry
 * @param config - Retry configuration
 * @param shouldRetry - Optional function to determine if error should be retried
 * @returns Result of the function
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG,
  shouldRetry?: (error: unknown) => boolean
): Promise<T> {
  let lastError: unknown;
  
  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Check if we should retry this error
      if (shouldRetry && !shouldRetry(error)) {
        throw error;
      }
      
      // Check if we've exhausted retries
      if (attempt >= config.maxRetries) {
        throw error;
      }
      
      // Wait before retrying (exponential backoff)
      await ExponentialBackoff.wait(attempt, config);
    }
  }
  
  // This should never be reached, but TypeScript needs it
  throw lastError;
}

/**
 * Check if an error should be retried based on retry configuration
 * 
 * @param error - The error to check
 * @param config - Retry configuration
 * @returns true if error should be retried
 */
export function shouldRetryError(error: unknown, config: RetryConfig = DEFAULT_RETRY_CONFIG): boolean {
  // Check if it's a network error
  if (config.retryOnNetworkError) {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
        return true;
      }
    }
  }
  
  // Check if it's an API error with specific status codes
  if (error && typeof error === 'object' && 'statusCode' in error) {
    const statusCode = (error as { statusCode?: number }).statusCode;
    
    if (statusCode === 429 && config.retryOnRateLimit) {
      return true;
    }
    
    if (statusCode && statusCode >= 500 && statusCode < 600 && config.retryOnServerError) {
      return true;
    }
  }
  
  return false;
}

// Export singleton instance
export const rateLimiter = new RateLimiter();

