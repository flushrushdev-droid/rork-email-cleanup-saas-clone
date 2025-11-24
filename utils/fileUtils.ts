/**
 * Utility functions for file operations
 */

/**
 * Formats file size in bytes to human-readable string
 * @param bytes - File size in bytes, or null if unknown
 * @returns Formatted file size string (e.g., "1.5 MB", "234 KB")
 */
export function formatFileSize(bytes: number | null): string {
  if (!bytes) return 'Unknown size';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}


