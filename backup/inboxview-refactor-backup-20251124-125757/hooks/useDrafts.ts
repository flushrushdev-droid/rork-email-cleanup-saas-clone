import { useState } from 'react';
import { Alert } from 'react-native';

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

  const saveDraft = (to: string, cc: string, subject: string, body: string): boolean => {
    if (!to && !subject && !body) {
      Alert.alert('Error', 'Draft is empty');
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
    Alert.alert('Success', 'Draft saved successfully');
    return true;
  };

  const loadDraft = (draft: Draft) => {
    setDrafts(prev => prev.filter(d => d.id !== draft.id));
    return draft;
  };

  const deleteDraft = (draftId: string) => {
    Alert.alert(
      'Delete Draft',
      'Are you sure you want to delete this draft?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => setDrafts(prev => prev.filter(d => d.id !== draftId)),
        },
      ]
    );
  };

  return {
    drafts,
    saveDraft,
    loadDraft,
    deleteDraft,
  };
}
