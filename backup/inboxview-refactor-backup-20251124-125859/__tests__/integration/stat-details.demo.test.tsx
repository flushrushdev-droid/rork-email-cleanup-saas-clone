import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { setupDemoMode, clearDemoMode } from '../utils/demo-helpers';
import { mockRouter, resetNavigationMocks } from '../utils/mock-navigation';
import { mockRecentEmails, mockSenders } from '@/mocks/emailData';
import StatDetailsScreen from '@/app/stat-details';

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => mockRouter,
  useLocalSearchParams: jest.fn(() => ({ type: 'unread' })),
  Stack: {
    Screen: ({ children }: any) => children,
  },
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// Mock contexts
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/contexts/GmailSyncContext', () => ({
  useGmailSync: jest.fn(),
}));

jest.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      primary: '#007AFF',
      secondary: '#5856D6',
      surface: '#F2F2F7',
      background: '#FFFFFF',
      text: '#000000',
      textSecondary: '#8E8E93',
      success: '#34C759',
      danger: '#FF3B30',
      border: '#C6C6C8',
      warning: '#FF9500',
    },
  }),
}));

jest.mock('@/contexts/EmailStateContext', () => ({
  useEmailState: jest.fn(),
}));

// Mock lucide-react-native icons
jest.mock('lucide-react-native', () => ({
  Mail: () => null,
  Archive: () => null,
  HardDrive: () => null,
  Sparkles: () => null,
  ArrowLeft: () => null,
  AlertCircle: () => null,
  Trash2: () => null,
  XCircle: () => null,
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

const { useGmailSync } = require('@/contexts/GmailSyncContext');
const { useEmailState } = require('@/contexts/EmailStateContext');
const { useLocalSearchParams } = require('expo-router');

describe('Stat Details Page - Demo Mode', () => {
  const defaultGmailSyncState = {
    messages: [],
    senders: [],
  };

  const defaultEmailState = {
    trashedEmails: new Set<string>(),
    archivedEmails: new Set<string>(),
    starredEmails: new Set<string>(),
    addTrashedEmail: jest.fn(),
    removeTrashedEmail: jest.fn(),
    addArchivedEmail: jest.fn(),
    removeArchivedEmail: jest.fn(),
    toggleStarredEmail: jest.fn(),
    isTrashed: jest.fn(() => false),
    isArchived: jest.fn(() => false),
    isStarred: jest.fn(() => false),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    resetNavigationMocks();
    await clearDemoMode();
    await setupDemoMode();

    (useGmailSync as jest.Mock).mockReturnValue(defaultGmailSyncState);
    (useEmailState as jest.Mock).mockReturnValue(defaultEmailState);
    (useLocalSearchParams as jest.Mock).mockReturnValue({ type: 'unread' });
    (Alert.alert as jest.Mock).mockClear();
  });

  afterEach(async () => {
    await clearDemoMode();
  });

  describe('Back Button Navigation', () => {
    test('should have back button that navigates back to overview', () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({ type: 'unread' });
      const { getByTestId } = render(<StatDetailsScreen />);
      const backButton = getByTestId('back-button');
      expect(backButton).toBeTruthy();
      
      fireEvent.press(backButton);
      expect(mockRouter.back).toHaveBeenCalled();
    });
  });

  describe('Unread Stat Type - All Actions', () => {
    test('should render unread messages list', () => {
      const unreadEmails = mockRecentEmails.filter((email) => !email.isRead);
      (useGmailSync as jest.Mock).mockReturnValue({
        ...defaultGmailSyncState,
        messages: unreadEmails,
      });
      (useLocalSearchParams as jest.Mock).mockReturnValue({ type: 'unread' });

      const { getAllByText, getByText } = render(<StatDetailsScreen />);
      // "Unread Messages" appears in both header and section title, so use getAllByText
      const unreadMessagesElements = getAllByText(/Unread Messages/);
      expect(unreadMessagesElements.length).toBeGreaterThan(0);
      
      if (unreadEmails.length > 0) {
        expect(getByText(unreadEmails[0].subject)).toBeTruthy();
      }
    });

    test('should navigate to email-detail when clicking unread email', () => {
      const unreadEmails = mockRecentEmails.filter((email) => !email.isRead);
      (useGmailSync as jest.Mock).mockReturnValue({
        ...defaultGmailSyncState,
        messages: unreadEmails,
      });
      (useLocalSearchParams as jest.Mock).mockReturnValue({ type: 'unread' });

      const { getByTestId } = render(<StatDetailsScreen />);
      if (unreadEmails.length > 0) {
        const emailCard = getByTestId(`unread-email-${unreadEmails[0].id}`);
        fireEvent.press(emailCard);
        expect(mockRouter.push).toHaveBeenCalledWith({
          pathname: '/email-detail',
          params: {
            emailId: unreadEmails[0].id,
            returnTo: 'stat-details',
            statType: 'unread',
          },
        });
      }
    });

    test('should show empty state when no unread emails', () => {
      // Pass messages that are all read (not empty array, as component falls back to mockRecentEmails when empty)
      const allReadEmails = mockRecentEmails.map(email => ({ ...email, isRead: true }));
      (useGmailSync as jest.Mock).mockReturnValue({
        ...defaultGmailSyncState,
        messages: allReadEmails,
      });
      (useLocalSearchParams as jest.Mock).mockReturnValue({ type: 'unread' });

      const { getByText } = render(<StatDetailsScreen />);
      expect(getByText(/No unread messages! 🎉/)).toBeTruthy();
    });

    test('should display email details (subject, from, snippet, date) for unread emails', () => {
      const unreadEmails = mockRecentEmails.filter((email) => !email.isRead);
      (useGmailSync as jest.Mock).mockReturnValue({
        ...defaultGmailSyncState,
        messages: unreadEmails,
      });
      (useLocalSearchParams as jest.Mock).mockReturnValue({ type: 'unread' });

      const { getByText, getAllByText } = render(<StatDetailsScreen />);
      if (unreadEmails.length > 0) {
        const email = unreadEmails[0];
        expect(getByText(email.subject)).toBeTruthy();
        // Use getAllByText since "from" might appear multiple times, then check if at least one exists
        const fromElements = getAllByText(email.from);
        expect(fromElements.length).toBeGreaterThan(0);
        expect(getByText(email.snippet)).toBeTruthy();
      }
    });

    test('should exclude trashed emails from unread list', () => {
      const unreadEmails = mockRecentEmails.filter((email) => !email.isRead);
      if (unreadEmails.length === 0) return;

      const trashedEmailId = unreadEmails[0].id;
      (useGmailSync as jest.Mock).mockReturnValue({
        ...defaultGmailSyncState,
        messages: unreadEmails,
      });
      (useEmailState as jest.Mock).mockReturnValue({
        ...defaultEmailState,
        trashedEmails: new Set([trashedEmailId]),
      });
      (useLocalSearchParams as jest.Mock).mockReturnValue({ type: 'unread' });

      const { queryByText } = render(<StatDetailsScreen />);
      // Trashed email should NOT appear
      expect(queryByText(unreadEmails[0].subject)).toBeNull();
      
      // Other non-trashed unread emails should still appear
      if (unreadEmails.length > 1) {
        expect(queryByText(unreadEmails[1].subject)).toBeTruthy();
      }
    });

    test('should show correct count excluding trashed emails', () => {
      const unreadEmails = mockRecentEmails.filter((email) => !email.isRead);
      if (unreadEmails.length === 0) return;

      const trashedEmailId = unreadEmails[0].id;
      (useGmailSync as jest.Mock).mockReturnValue({
        ...defaultGmailSyncState,
        messages: unreadEmails,
      });
      (useEmailState as jest.Mock).mockReturnValue({
        ...defaultEmailState,
        trashedEmails: new Set([trashedEmailId]),
      });
      (useLocalSearchParams as jest.Mock).mockReturnValue({ type: 'unread' });

      const { getByText } = render(<StatDetailsScreen />);
      const expectedCount = unreadEmails.length - 1;
      expect(getByText(new RegExp(`Unread Messages \\(${expectedCount}\\)`))).toBeTruthy();
    });
  });

  describe('Noise Stat Type - All Actions', () => {
    test('should render noise senders list', () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({ type: 'noise' });
      (useGmailSync as jest.Mock).mockReturnValue({
        ...defaultGmailSyncState,
        senders: mockSenders,
      });

      const { getByText } = render(<StatDetailsScreen />);
      expect(getByText(/High Noise Senders/)).toBeTruthy();
    });

    test('should navigate to senders page when clicking noise sender', () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({ type: 'noise' });
      (useGmailSync as jest.Mock).mockReturnValue({
        ...defaultGmailSyncState,
        senders: mockSenders,
      });

      const { getByTestId } = render(<StatDetailsScreen />);
      if (mockSenders.length > 0) {
        const sender = mockSenders[0];
        const senderCard = getByTestId(`sender-${sender.id}`);
        fireEvent.press(senderCard);
        expect(mockRouter.push).toHaveBeenCalledWith({
          pathname: '/senders',
          params: { q: sender.email },
        });
      }
    });

    test('should display sender information (name, email, stats) for noise senders', () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({ type: 'noise' });
      (useGmailSync as jest.Mock).mockReturnValue({
        ...defaultGmailSyncState,
        senders: mockSenders,
      });

      const { getByText } = render(<StatDetailsScreen />);
      if (mockSenders.length > 0) {
        const sender = mockSenders[0];
        const senderName = sender.displayName || sender.email;
        expect(getByText(senderName)).toBeTruthy();
        expect(getByText(sender.email)).toBeTruthy();
        expect(getByText(new RegExp(`${sender.totalEmails} emails`))).toBeTruthy();
        expect(getByText(new RegExp(`${sender.engagementRate}% engagement`))).toBeTruthy();
      }
    });

    test('should display noise score badge for each sender', () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({ type: 'noise' });
      (useGmailSync as jest.Mock).mockReturnValue({
        ...defaultGmailSyncState,
        senders: mockSenders,
      });

      const { getByText } = render(<StatDetailsScreen />);
      if (mockSenders.length > 0) {
        const sender = mockSenders[0];
        // Noise score is displayed as a number with 1 decimal
        expect(getByText(new RegExp(sender.noiseScore.toFixed(1)))).toBeTruthy();
      }
    });

    test('should show info box explaining noise senders', () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({ type: 'noise' });
      (useGmailSync as jest.Mock).mockReturnValue({
        ...defaultGmailSyncState,
        senders: mockSenders,
      });

      const { getByText } = render(<StatDetailsScreen />);
      expect(getByText(/high email volume but low engagement/)).toBeTruthy();
    });
  });

  describe('Files Stat Type - All Actions', () => {
    // Helper function to filter emails the same way the component does
    const getFilesEmails = () => {
      return mockRecentEmails
        .filter((email) => 
          email.hasAttachments && ('attachmentCount' in email ? email.attachmentCount > 0 : true)
        )
        .sort((a, b) => {
          const aSize = 'size' in a ? a.size : ('sizeBytes' in a ? a.sizeBytes : 0);
          const bSize = 'size' in b ? b.size : ('sizeBytes' in b ? b.sizeBytes : 0);
          return bSize - aSize; // Largest first, matching component behavior
        });
    };

    test('should render large files list', () => {
      const filesEmails = getFilesEmails();
      (useGmailSync as jest.Mock).mockReturnValue({
        ...defaultGmailSyncState,
        messages: filesEmails,
      });
      (useLocalSearchParams as jest.Mock).mockReturnValue({ type: 'files' });

      const { getByText } = render(<StatDetailsScreen />);
      expect(getByText(/Large Attachments/)).toBeTruthy();
    });

    test('should navigate to email-detail when clicking file email', () => {
      const filesEmails = getFilesEmails();
      (useGmailSync as jest.Mock).mockReturnValue({
        ...defaultGmailSyncState,
        messages: filesEmails,
      });
      (useLocalSearchParams as jest.Mock).mockReturnValue({ type: 'files' });

      const { getByTestId } = render(<StatDetailsScreen />);
      if (filesEmails.length > 0) {
        const emailCard = getByTestId(`file-email-${filesEmails[0].id}`);
        fireEvent.press(emailCard);
        expect(mockRouter.push).toHaveBeenCalledWith({
          pathname: '/email-detail',
          params: {
            emailId: filesEmails[0].id,
            returnTo: 'stat-details',
            statType: 'files',
          },
        });
      }
    });

    test('should show delete button (Trash2) for file emails', () => {
      const filesEmails = getFilesEmails();
      if (filesEmails.length === 0) return; // Skip if no file emails

      (useGmailSync as jest.Mock).mockReturnValue({
        ...defaultGmailSyncState,
        messages: filesEmails,
      });
      (useLocalSearchParams as jest.Mock).mockReturnValue({ type: 'files' });

      const { getByTestId } = render(<StatDetailsScreen />);
      const deleteButton = getByTestId(`delete-${filesEmails[0].id}`);
      expect(deleteButton).toBeTruthy();
    });

    test('should show Alert when clicking delete button for file email', () => {
      const filesEmails = getFilesEmails();
      if (filesEmails.length === 0) return; // Skip if no file emails

      (useGmailSync as jest.Mock).mockReturnValue({
        ...defaultGmailSyncState,
        messages: filesEmails,
      });
      (useLocalSearchParams as jest.Mock).mockReturnValue({ type: 'files' });

      const { getByTestId } = render(<StatDetailsScreen />);
      const deleteButton = getByTestId(`delete-${filesEmails[0].id}`);
      
      fireEvent.press(deleteButton);
      
      // Alert should be called with delete confirmation
      expect(Alert.alert).toHaveBeenCalledWith(
        'Move to Trash',
        expect.stringContaining(filesEmails[0].subject),
        expect.any(Array)
      );
    });

    test('should show permanent delete button (XCircle) for file emails', () => {
      const filesEmails = getFilesEmails();
      if (filesEmails.length === 0) return; // Skip if no file emails

      (useGmailSync as jest.Mock).mockReturnValue({
        ...defaultGmailSyncState,
        messages: filesEmails,
      });
      (useLocalSearchParams as jest.Mock).mockReturnValue({ type: 'files' });

      const { getByTestId } = render(<StatDetailsScreen />);
      const permanentDeleteButton = getByTestId(`permanent-delete-${filesEmails[0].id}`);
      expect(permanentDeleteButton).toBeTruthy();
    });

    test('should show Alert when clicking permanent delete button for file email', () => {
      const filesEmails = getFilesEmails();
      if (filesEmails.length === 0) return; // Skip if no file emails

      (useGmailSync as jest.Mock).mockReturnValue({
        ...defaultGmailSyncState,
        messages: filesEmails,
      });
      (useLocalSearchParams as jest.Mock).mockReturnValue({ type: 'files' });

      const { getByTestId } = render(<StatDetailsScreen />);
      const permanentDeleteButton = getByTestId(`permanent-delete-${filesEmails[0].id}`);
      
      fireEvent.press(permanentDeleteButton);
      
      // Alert should be called with permanent delete confirmation
      expect(Alert.alert).toHaveBeenCalledWith(
        'Delete Permanently',
        expect.stringContaining(filesEmails[0].subject),
        expect.any(Array)
      );
    });

    test('should display file size and attachment count for file emails', () => {
      const filesEmails = getFilesEmails();
      (useGmailSync as jest.Mock).mockReturnValue({
        ...defaultGmailSyncState,
        messages: filesEmails,
      });
      (useLocalSearchParams as jest.Mock).mockReturnValue({ type: 'files' });

      const { getByText, getAllByText } = render(<StatDetailsScreen />);
      if (filesEmails.length > 0) {
        const email = filesEmails[0];
        expect(getByText(email.subject)).toBeTruthy();
        // Use getAllByText since "MB" appears multiple times, then check if at least one exists
        const mbElements = getAllByText(/MB/);
        expect(mbElements.length).toBeGreaterThan(0);
        // Use getAllByText for "files" as well
        const filesElements = getAllByText(/files/);
        expect(filesElements.length).toBeGreaterThan(0);
      }
    });

    test('should show info box explaining large files', () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({ type: 'files' });
      (useGmailSync as jest.Mock).mockReturnValue({
        ...defaultGmailSyncState,
        messages: [],
      });

      const { getByText } = render(<StatDetailsScreen />);
      expect(getByText(/Total storage used by large attachments/)).toBeTruthy();
    });

    test('should exclude trashed emails from files list', () => {
      const filesEmails = getFilesEmails();
      if (filesEmails.length === 0) return;

      const trashedEmailId = filesEmails[0].id;
      (useGmailSync as jest.Mock).mockReturnValue({
        ...defaultGmailSyncState,
        messages: filesEmails,
      });
      (useEmailState as jest.Mock).mockReturnValue({
        ...defaultEmailState,
        trashedEmails: new Set([trashedEmailId]),
      });
      (useLocalSearchParams as jest.Mock).mockReturnValue({ type: 'files' });

      const { queryByText } = render(<StatDetailsScreen />);
      // Trashed email should NOT appear
      expect(queryByText(filesEmails[0].subject)).toBeNull();
      
      // Other non-trashed file emails should still appear
      if (filesEmails.length > 1) {
        expect(queryByText(filesEmails[1].subject)).toBeTruthy();
      }
    });

    test('should show correct count excluding trashed emails for files', () => {
      const filesEmails = getFilesEmails();
      if (filesEmails.length === 0) return;

      const trashedEmailId = filesEmails[0].id;
      (useGmailSync as jest.Mock).mockReturnValue({
        ...defaultGmailSyncState,
        messages: filesEmails,
      });
      (useEmailState as jest.Mock).mockReturnValue({
        ...defaultEmailState,
        trashedEmails: new Set([trashedEmailId]),
      });
      (useLocalSearchParams as jest.Mock).mockReturnValue({ type: 'files' });

      const { getByText } = render(<StatDetailsScreen />);
      const expectedCount = filesEmails.length - 1;
      expect(getByText(new RegExp(`Large Attachments \\(${expectedCount}\\)`))).toBeTruthy();
    });

    test('should not show delete buttons for trashed emails', () => {
      const filesEmails = getFilesEmails();
      if (filesEmails.length === 0) return;

      const trashedEmailId = filesEmails[0].id;
      (useGmailSync as jest.Mock).mockReturnValue({
        ...defaultGmailSyncState,
        messages: filesEmails,
      });
      (useEmailState as jest.Mock).mockReturnValue({
        ...defaultEmailState,
        trashedEmails: new Set([trashedEmailId]),
      });
      (useLocalSearchParams as jest.Mock).mockReturnValue({ type: 'files' });

      const { queryByTestId } = render(<StatDetailsScreen />);
      // Delete buttons should NOT exist for trashed email
      expect(queryByTestId(`delete-${trashedEmailId}`)).toBeNull();
      expect(queryByTestId(`permanent-delete-${trashedEmailId}`)).toBeNull();
    });
  });

  describe('Automated Stat Type - All Actions', () => {
    test('should render automation coverage section', () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({ type: 'automated' });
      const { getByText } = render(<StatDetailsScreen />);
      expect(getByText(/Automation Coverage/)).toBeTruthy();
    });

    test('should navigate to create-rule when clicking "Create New Rule" button', () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({ type: 'automated' });
      const { getByTestId } = render(<StatDetailsScreen />);
      
      const createRuleButton = getByTestId('create-rule-button');
      expect(createRuleButton).toBeTruthy();
      
      fireEvent.press(createRuleButton);
      expect(mockRouter.push).toHaveBeenCalledWith('/create-rule');
    });

    test('should display active automations list', () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({ type: 'automated' });
      const { getByText } = render(<StatDetailsScreen />);
      
      expect(getByText('Active Automations')).toBeTruthy();
      expect(getByText('Auto-archive promotions')).toBeTruthy();
      expect(getByText('Label receipts')).toBeTruthy();
      expect(getByText('Mark newsletters as read')).toBeTruthy();
    });

    test('should display automation statistics for each automation', () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({ type: 'automated' });
      const { getByText } = render(<StatDetailsScreen />);
      
      expect(getByText(/Moved 847 emails last month/)).toBeTruthy();
      expect(getByText(/Organized 203 emails/)).toBeTruthy();
      expect(getByText(/Processed 634 emails/)).toBeTruthy();
    });

    test('should show info box explaining automation coverage', () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({ type: 'automated' });
      const { getByText } = render(<StatDetailsScreen />);
      
      expect(getByText(/56% of your emails are automatically organized/)).toBeTruthy();
    });
  });
});
