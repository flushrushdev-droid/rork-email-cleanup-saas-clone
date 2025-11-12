import { Alert } from 'react-native';
import type { EmailMessage } from '@/constants/types';

export type EmailActions = {
  handleReply: (email: EmailMessage) => void;
  handleReplyAll: (email: EmailMessage) => void;
  handleForward: (email: EmailMessage) => void;
  handleArchive: (email: EmailMessage) => Promise<void>;
  handleStar: (emailId: string) => void;
};

export function useEmailActions(
  archiveMessage: (id: string) => Promise<void>,
  starredEmails: Set<string>,
  setStarredEmails: (setter: (prev: Set<string>) => Set<string>) => void,
  setComposeTo: (to: string) => void,
  setComposeCc: (cc: string) => void,
  setComposeSubject: (subject: string) => void,
  setComposeBody: (body: string) => void,
  setCurrentView: (view: string) => void,
  isDemoMode: boolean
): EmailActions {
  const handleReply = (email: EmailMessage) => {
    const senderEmail = email.from.match(/<(.+?)>/) ?.[1] || email.from;
    setComposeTo(senderEmail);
    setComposeCc('');
    setComposeSubject(`Re: ${email.subject}`);
    setComposeBody(`\n\n---\nOn ${email.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}, ${email.from.split('<')[0].trim()} wrote:\n${email.snippet}`);
    setCurrentView('compose');
  };

  const handleReplyAll = (email: EmailMessage) => {
    const senderEmail = email.from.match(/<(.+?)>/) ?.[1] || email.from;
    const allRecipients = [senderEmail, ...email.to].filter(e => e !== 'sarah.chen@company.com').join(', ');
    setComposeTo(allRecipients);
    setComposeCc('');
    setComposeSubject(`Re: ${email.subject}`);
    setComposeBody(`\n\n---\nOn ${email.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}, ${email.from.split('<')[0].trim()} wrote:\n${email.snippet}`);
    setCurrentView('compose');
  };

  const handleForward = (email: EmailMessage) => {
    setComposeTo('');
    setComposeCc('');
    setComposeSubject(`Fwd: ${email.subject}`);
    setComposeBody(`\n\n---\nForwarded message:\nFrom: ${email.from}\nDate: ${email.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}\nSubject: ${email.subject}\n\n${email.snippet}`);
    setCurrentView('compose');
  };

  const handleArchive = async (email: EmailMessage) => {
    if (isDemoMode) {
      Alert.alert('Demo Mode', 'Archive is disabled in demo mode');
      return;
    }

    try {
      await archiveMessage(email.id);
      Alert.alert('Success', 'Email archived');
      setCurrentView('inbox');
    } catch {
      Alert.alert('Error', 'Failed to archive email');
    }
  };

  const handleStar = (emailId: string) => {
    setStarredEmails(prev => {
      const newSet = new Set(prev);
      if (newSet.has(emailId)) {
        newSet.delete(emailId);
      } else {
        newSet.add(emailId);
      }
      return newSet;
    });
  };

  return {
    handleReply,
    handleReplyAll,
    handleForward,
    handleArchive,
    handleStar,
  };
}
