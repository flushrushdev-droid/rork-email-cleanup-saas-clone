import { useState, useMemo } from 'react';
import React from 'react';
import { CheckCircle, XCircle, Clock } from 'lucide-react-native';
import { useHistory } from '@/contexts/HistoryContext';
import { mockSenders } from '@/mocks/emailData';

export type UnsubscribeStatus = 'pending' | 'success' | 'failed';

export interface UnsubscribeItem {
  id: string;
  sender: string;
  email: string;
  method: 'list-unsubscribe' | 'auto-reply' | 'manual';
  status: UnsubscribeStatus;
  date: Date;
}

const mockUnsubscribeHistory: UnsubscribeItem[] = [
  {
    id: '1',
    sender: 'Medium Daily Digest',
    email: 'newsletters@medium.com',
    method: 'list-unsubscribe',
    status: 'success',
    date: new Date(Date.now() - 86400000),
  },
  {
    id: '2',
    sender: 'Marketing Newsletter',
    email: 'deals@retailer.com',
    method: 'auto-reply',
    status: 'pending',
    date: new Date(Date.now() - 3600000),
  },
];

export function useUnsubscribe(colors: any) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<'available' | 'history'>('available');
  const { addHistoryEntry } = useHistory();
  const [unsubscribeModalVisible, setUnsubscribeModalVisible] = useState(false);
  const [unsubscribeEmail, setUnsubscribeEmail] = useState('');
  const [unsubscribeSenderId, setUnsubscribeSenderId] = useState('');
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [unsubscribeHistory] = useState<UnsubscribeItem[]>(mockUnsubscribeHistory);

  const availableSenders = useMemo(() => {
    return mockSenders
      .filter((sender) => sender.hasUnsubscribe && sender.isMarketing)
      .filter((sender) =>
        sender.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sender.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
  }, [searchQuery]);

  const handleUnsubscribe = (senderId: string) => {
    const sender = mockSenders.find(s => s.id === senderId);
    if (sender) {
      setUnsubscribeEmail(sender.email);
      setUnsubscribeSenderId(senderId);
      setUnsubscribeModalVisible(true);
    }
  };

  const confirmUnsubscribe = () => {
    const sender = mockSenders.find(s => s.id === unsubscribeSenderId);
    if (sender) {
      addHistoryEntry(
        'newsletter_unsubscribed',
        `Unsubscribed from ${sender.displayName || sender.email}`,
        {
          senderEmail: sender.email,
          senderName: sender.displayName,
        }
      );
    }
    setUnsubscribeModalVisible(false);
    setSuccessModalVisible(true);
  };

  const getStatusIcon = (status: UnsubscribeStatus) => {
    switch (status) {
      case 'success':
        return React.createElement(CheckCircle, { size: 20, color: colors.success });
      case 'failed':
        return React.createElement(XCircle, { size: 20, color: colors.danger });
      case 'pending':
        return React.createElement(Clock, { size: 20, color: colors.warning });
    }
  };

  const getStatusColor = (status: UnsubscribeStatus) => {
    switch (status) {
      case 'success':
        return colors.success;
      case 'failed':
        return colors.danger;
      case 'pending':
        return colors.warning;
    }
  };

  return {
    searchQuery,
    setSearchQuery,
    selectedTab,
    setSelectedTab,
    unsubscribeModalVisible,
    setUnsubscribeModalVisible,
    unsubscribeEmail,
    unsubscribeSenderId,
    successModalVisible,
    setSuccessModalVisible,
    unsubscribeHistory,
    availableSenders,
    handleUnsubscribe,
    confirmUnsubscribe,
    getStatusIcon,
    getStatusColor,
  };
}

