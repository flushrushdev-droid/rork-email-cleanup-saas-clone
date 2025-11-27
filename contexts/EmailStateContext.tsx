import React, { createContext, useContext, useMemo, useState, useRef, useCallback } from 'react';

type EmailStateContextType = {
  trashedEmails: Set<string>;
  archivedEmails: Set<string>;
  starredEmails: Set<string>;
  addTrashedEmail: (emailId: string) => void;
  removeTrashedEmail: (emailId: string) => void;
  addArchivedEmail: (emailId: string) => void;
  removeArchivedEmail: (emailId: string) => void;
  toggleStarredEmail: (emailId: string) => void;
  isTrashed: (emailId: string) => boolean;
  isArchived: (emailId: string) => boolean;
  isStarred: (emailId: string) => boolean;
};

const EmailStateContext = createContext<EmailStateContextType | undefined>(undefined);

export function EmailStateProvider({ children }: { children: React.ReactNode }) {
  const [trashedEmails, setTrashedEmails] = useState<Set<string>>(new Set());
  const [archivedEmails, setArchivedEmails] = useState<Set<string>>(new Set());
  const [starredEmails, setStarredEmails] = useState<Set<string>>(new Set());
  
  // Use refs to track current values for stable callbacks
  const trashedRef = useRef(trashedEmails);
  const archivedRef = useRef(archivedEmails);
  const starredRef = useRef(starredEmails);
  
  trashedRef.current = trashedEmails;
  archivedRef.current = archivedEmails;
  starredRef.current = starredEmails;

  const addTrashedEmail = useCallback((emailId: string) => {
    setTrashedEmails((prev) => {
      if (prev.has(emailId)) return prev;
      return new Set(prev).add(emailId);
    });
  }, []);

  const removeTrashedEmail = useCallback((emailId: string) => {
    setTrashedEmails((prev) => {
      if (!prev.has(emailId)) return prev;
      const newSet = new Set(prev);
      newSet.delete(emailId);
      return newSet;
    });
  }, []);

  const addArchivedEmail = useCallback((emailId: string) => {
    setArchivedEmails((prev) => {
      if (prev.has(emailId)) return prev;
      return new Set(prev).add(emailId);
    });
  }, []);

  const removeArchivedEmail = useCallback((emailId: string) => {
    setArchivedEmails((prev) => {
      if (!prev.has(emailId)) return prev;
      const newSet = new Set(prev);
      newSet.delete(emailId);
      return newSet;
    });
  }, []);

  const toggleStarredEmail = useCallback((emailId: string) => {
    setStarredEmails((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(emailId)) {
        newSet.delete(emailId);
      } else {
        newSet.add(emailId);
      }
      return newSet;
    });
  }, []);

  const isTrashed = useCallback((emailId: string) => {
    return trashedRef.current.has(emailId);
  }, []);

  const isArchived = useCallback((emailId: string) => {
    return archivedRef.current.has(emailId);
  }, []);

  const isStarred = useCallback((emailId: string) => {
    return starredRef.current.has(emailId);
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  // All callbacks are already memoized with useCallback, Sets are stable until changed
  const value = useMemo<EmailStateContextType>(
    () => ({
      trashedEmails,
      archivedEmails,
      starredEmails,
      addTrashedEmail,
      removeTrashedEmail,
      addArchivedEmail,
      removeArchivedEmail,
      toggleStarredEmail,
      isTrashed,
      isArchived,
      isStarred,
    }),
    // Dependencies: Sets and all callbacks (callbacks are stable via useCallback)
    [trashedEmails, archivedEmails, starredEmails, addTrashedEmail, removeTrashedEmail, addArchivedEmail, removeArchivedEmail, toggleStarredEmail, isTrashed, isArchived, isStarred],
  );

  return <EmailStateContext.Provider value={value}>{children}</EmailStateContext.Provider>;
}

export function useEmailState(): EmailStateContextType {
  const ctx = useContext(EmailStateContext);
  if (!ctx) {
    throw new Error('useEmailState must be used within EmailStateProvider');
  }
  return ctx;
}

