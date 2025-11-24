import type { EmailCategory, EmailMessage, Email } from '@/constants/types';

export const categoryKeywords: Record<EmailCategory, string[]> = {
  invoices: ['invoice', 'bill', 'payment', 'billing', 'charge'],
  receipts: ['receipt', 'order confirmation', 'purchase', 'transaction'],
  travel: ['flight', 'hotel', 'booking', 'reservation', 'trip', 'travel'],
  hr: ['hr', 'human resources', 'benefits', 'payroll', 'pto', 'time off'],
  legal: ['legal', 'contract', 'agreement', 'terms', 'policy'],
  personal: ['personal', 'family', 'friend'],
  promotions: ['sale', 'discount', 'offer', 'deal', 'promo', 'marketing'],
  social: ['linkedin', 'facebook', 'twitter', 'instagram', 'notification'],
  system: ['alert', 'security', 'notification', 'update', 'reminder'],
};

export function categorizeEmail(email: EmailMessage | Email): EmailCategory | undefined {
  const searchText = `${email.subject} ${email.snippet} ${email.from}`.toLowerCase();
  
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => searchText.includes(keyword))) {
      return category as EmailCategory;
    }
  }
  
  return undefined;
}

export const iconMap: Record<string, any> = {
  'alert-circle': 'AlertCircle',
  'receipt': 'Receipt',
  'shopping-bag': 'ShoppingBag',
  'plane': 'Plane',
  'tag': 'Tag',
  'users': 'Users',
  'file-text': 'FileText',
  'briefcase': 'Briefcase',
  'scale': 'Scale',
};
