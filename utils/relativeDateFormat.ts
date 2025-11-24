/**
 * Formats a date/timestamp as a relative time string (e.g., "5m ago", "Yesterday", "2w ago")
 * @param dateOrTimestamp - Date object or timestamp string
 * @returns Formatted relative date string
 */
export function formatRelativeDate(dateOrTimestamp: Date | string): string {
  const date = typeof dateOrTimestamp === 'string' ? new Date(dateOrTimestamp) : dateOrTimestamp;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return diffMins === 0 ? 'Just now' : `${diffMins}m ago`;
    }
    return `${diffHours}h ago`;
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks}w ago`;
  }
  
  return date.toLocaleDateString();
}

/**
 * Formats a date as a short relative time string (e.g., "5m ago", "2h ago", "3d ago")
 * Used for shorter time spans, returns absolute date format for longer periods
 * @param date - Date object
 * @returns Formatted relative date string
 */
export function formatShortRelativeDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

