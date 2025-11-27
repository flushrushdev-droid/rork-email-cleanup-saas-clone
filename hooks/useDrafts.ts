import { useState } from 'react';
import { useEnhancedToast } from '@/hooks/useEnhancedToast';

export type Draft = {
  id: string;
  to: string;
  cc?: string;
  subject: string;
  body: string;
  date: Date;
};

export function useDrafts() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const { showSuccess, showError, showWarning } = useEnhancedToast();

  const saveDraft = (to: string, cc: string, subject: string, body: string): boolean => {
    if (!to && !subject && !body) {
      showError('Draft is empty');
      return false;
    }

    const newDraft: Draft = {
      id: Date.now().toString(),
      to,
      cc,
      subject,
      body,
      date: new Date(),
    };

    setDrafts(prev => [newDraft, ...prev]);
    showSuccess('Draft saved successfully');
    return true;
  };

  const loadDraft = (draft: Draft) => {
    setDrafts(prev => prev.filter(d => d.id !== draft.id));
    return draft;
  };

  const deleteDraft = (draftId: string) => {
    showWarning('Are you sure you want to delete this draft?', {
      action: {
        label: 'Delete',
        style: 'destructive',
        onPress: () => setDrafts(prev => prev.filter(d => d.id !== draftId)),
      },
      duration: 0,
    });
  };

  return {
    drafts,
    saveDraft,
    loadDraft,
    deleteDraft,
  };
}
