import type { EmailMessage } from '@/constants/types';

export type MailFolder = 'inbox' | 'sent' | 'archived' | 'starred' | 'unread' | 'drafts' | 'drafts-ai' | 'spam' | 'trash' | 'important' | 'snoozed';

export function filterEmailsByFolder(
  emails: EmailMessage[],
  folder: MailFolder,
  starredIds: Set<string>
): EmailMessage[] {
  switch (folder) {
    case 'unread':
      return emails.filter(email => !email.isRead);
    case 'starred':
      return emails.filter(email => starredIds.has(email.id));
    case 'important':
      return emails.filter(email => 
        email.labels.includes('IMPORTANT') || 
        email.priority === 'action' ||
        email.subject.toLowerCase().includes('urgent')
      );
    case 'snoozed':
    case 'sent':
    case 'drafts':
    case 'spam':
    case 'archived':
      return [];
    case 'trash':
      // Show emails with TRASH label
      return emails.filter(email => 
        email.labels.includes('TRASH') || email.labels.includes('trash')
      );
    default:
      return emails.filter(email => email.labels.includes('inbox') || email.labels.includes('INBOX'));
  }
}

export function filterEmailsByQuery(
  emails: EmailMessage[],
  query: string
): EmailMessage[] {
  if (!query.trim()) {
    return emails;
  }

  const lowerQuery = query.toLowerCase();
  return emails.filter(email =>
    email.subject.toLowerCase().includes(lowerQuery) ||
    email.from.toLowerCase().includes(lowerQuery) ||
    email.snippet.toLowerCase().includes(lowerQuery)
  );
}

export function sortEmailsByDate(emails: EmailMessage[]): EmailMessage[] {
  return [...emails].sort((a, b) => b.date.getTime() - a.date.getTime());
}
