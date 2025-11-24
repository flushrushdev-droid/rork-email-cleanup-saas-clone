import { useMemo } from 'react';
import type { Email, EmailMessage, EmailCategory } from '@/constants/types';
import { categorizeEmail } from '@/utils/emailCategories';
import { mockSmartFolders } from '@/mocks/emailData';

export type SmartFolder = {
  id: string;
  name: string;
  icon: string;
  color: string;
  query: string;
  count: number;
  category?: EmailCategory;
};

export function useSmartFolders(
  messages: Email[],
  allEmails: EmailMessage[],
  isDemoMode: boolean
) {
  const smartFolders = useMemo(() => {
    if (isDemoMode || messages.length === 0) {
      return mockSmartFolders;
    }

    const actionRequiredEmails = messages.filter(email => 
      email.labels.includes('IMPORTANT') || 
      email.subject.toLowerCase().includes('action required') ||
      email.subject.toLowerCase().includes('urgent')
    );

    const categoryCounts = new Map<EmailCategory, number>();
    allEmails.forEach(email => {
      if (email.category) {
        categoryCounts.set(email.category, (categoryCounts.get(email.category) || 0) + 1);
      }
    });

    return [
      {
        id: '1',
        name: 'Action Required',
        icon: 'alert-circle',
        color: '#FF3B30',
        query: 'priority:action',
        count: actionRequiredEmails.length,
      },
      {
        id: '2',
        name: 'Invoices',
        icon: 'receipt',
        color: '#FF9500',
        query: 'category:invoices',
        count: categoryCounts.get('invoices') || 0,
        category: 'invoices' as EmailCategory,
      },
      {
        id: '3',
        name: 'Receipts',
        icon: 'shopping-bag',
        color: '#34C759',
        query: 'category:receipts',
        count: categoryCounts.get('receipts') || 0,
        category: 'receipts' as EmailCategory,
      },
      {
        id: '4',
        name: 'Travel',
        icon: 'plane',
        color: '#5AC8FA',
        query: 'category:travel',
        count: categoryCounts.get('travel') || 0,
        category: 'travel' as EmailCategory,
      },
      {
        id: '5',
        name: 'Promotions',
        icon: 'tag',
        color: '#FFCC00',
        query: 'category:promotions',
        count: categoryCounts.get('promotions') || 0,
        category: 'promotions' as EmailCategory,
      },
      {
        id: '6',
        name: 'Social',
        icon: 'users',
        color: '#FF6482',
        query: 'category:social',
        count: categoryCounts.get('social') || 0,
        category: 'social' as EmailCategory,
      },
      {
        id: '7',
        name: 'HR',
        icon: 'briefcase',
        color: '#5856D6',
        query: 'category:hr',
        count: categoryCounts.get('hr') || 0,
        category: 'hr' as EmailCategory,
      },
      {
        id: '8',
        name: 'Legal',
        icon: 'scale',
        color: '#FF2D55',
        query: 'category:legal',
        count: categoryCounts.get('legal') || 0,
        category: 'legal' as EmailCategory,
      },
      {
        id: '9',
        name: 'System',
        icon: 'alert-circle',
        color: '#8E8E93',
        query: 'category:system',
        count: categoryCounts.get('system') || 0,
        category: 'system' as EmailCategory,
      },
    ].filter(folder => folder.count > 0);
  }, [messages, allEmails, isDemoMode]);

  return smartFolders;
}
