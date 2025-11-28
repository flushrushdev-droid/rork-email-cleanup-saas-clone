/**
 * Stat Info Utilities
 * 
 * Provides utilities for calculating stat information based on stat type.
 */

import { Mail, Archive, HardDrive, Sparkles, AlertCircle } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import type { ThemeColors } from '@/constants/colors';

export type StatType = 'unread' | 'noise' | 'files' | 'automated';

export interface StatInfo {
  title: string;
  icon: LucideIcon;
  color: string;
  count: string | number;
  description: string;
}

/**
 * Get stat information based on stat type
 */
export function getStatInfo(
  type: StatType,
  colors: ThemeColors,
  unreadCount: number = 0,
  filesCount: number = 0
): StatInfo {
  switch (type) {
    case 'unread':
      return {
        title: 'Unread Messages',
        icon: Mail,
        color: colors.primary,
        count: unreadCount,
        description: 'These are all your unread messages. Consider reading or archiving them to keep your inbox clean.',
      };
    case 'noise':
      return {
        title: 'Noise Sources',
        icon: Archive,
        color: colors.warning,
        count: '42%',
        description: 'Low-engagement emails that clutter your inbox. These senders have high volume but low interaction rates.',
      };
    case 'files':
      return {
        title: 'Large Files',
        icon: HardDrive,
        color: colors.secondary,
        count: filesCount,
        description: 'Emails with large attachments taking up storage space. Consider downloading important files and deleting old emails.',
      };
    case 'automated':
      return {
        title: 'Automated Coverage',
        icon: Sparkles,
        color: colors.success,
        count: '56%',
        description: 'Percentage of emails automatically organized by rules and filters. Higher is better!',
      };
    default:
      return {
        title: 'Details',
        icon: AlertCircle,
        color: colors.primary,
        count: 0,
        description: '',
      };
  }
}

