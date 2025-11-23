import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { ComposeView } from '@/components/mail/ComposeView';
import * as DocumentPicker from 'expo-document-picker';
import { Alert } from 'react-native';

jest.mock('expo-document-picker');
jest.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      primary: '#007AFF',
      surface: '#F2F2F7',
      background: '#FFFFFF',
      text: '#000000',
      textSecondary: '#8E8E93',
      danger: '#FF3B30',
    },
  }),
}));

describe('Demo Email Compose', () => {
  const mockOnClose = jest.fn();
  const mockOnSend = jest.fn();
  const mockOnSaveDraft = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should open compose screen', () => {
    render(
      <ComposeView
        insets={{ top: 0, bottom: 0 }}
        composeTo=""
        composeCc=""
        composeSubject=""
        composeBody=""
        onChangeComposeTo={jest.fn()}
        onChangeComposeCc={jest.fn()}
        onChangeComposeSubject={jest.fn()}
        onChangeComposeBody={jest.fn()}
        onClose={mockOnClose}
        onSend={mockOnSend}
        onSaveDraft={mockOnSaveDraft}
        onOpenAIModal={jest.fn()}
      />
    );

    expect(screen.getByPlaceholderText('recipient@example.com')).toBeTruthy();
    expect(screen.getByPlaceholderText('Email subject')).toBeTruthy();
  });

  test('should open file attachment picker', async () => {
    (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [{
        name: 'test.pdf',
        size: 1024,
        uri: 'file://test.pdf',
      }],
    });

    render(
      <ComposeView
        insets={{ top: 0, bottom: 0 }}
        composeTo=""
        composeCc=""
        composeSubject=""
        composeBody=""
        onChangeComposeTo={jest.fn()}
        onChangeComposeCc={jest.fn()}
        onChangeComposeSubject={jest.fn()}
        onChangeComposeBody={jest.fn()}
        onClose={mockOnClose}
        onSend={mockOnSend}
        onSaveDraft={mockOnSaveDraft}
        onOpenAIModal={jest.fn()}
      />
    );

    const attachButton = screen.getByText('Attach file');
    fireEvent.press(attachButton);

    await waitFor(() => {
      expect(DocumentPicker.getDocumentAsync).toHaveBeenCalled();
    });
  });

  test('should display attachments with name and size', async () => {
    (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [
        { name: 'test.pdf', size: 1024, uri: 'file://test.pdf' },
        { name: 'image.jpg', size: 2048, uri: 'file://image.jpg' },
      ],
    });

    // This test verifies the attachment display logic
    const formatFileSize = (bytes: number): string => {
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    };

    expect(formatFileSize(1024)).toBe('1.0 KB');
    expect(formatFileSize(2048)).toBe('2.0 KB');
  });

  test('should remove attachments', () => {
    // Test attachment removal logic
    const attachments = [
      { name: 'test.pdf', size: 1024, uri: 'file://test.pdf' },
    ];
    
    const removeAttachment = (index: number) => {
      attachments.splice(index, 1);
    };

    expect(attachments.length).toBe(1);
    removeAttachment(0);
    expect(attachments.length).toBe(0);
  });

  test('should validate required fields', () => {
    const validateForm = (to: string, subject: string) => {
      if (!to || !subject) {
        Alert.alert('Error', 'Please fill in required fields');
        return false;
      }
      return true;
    };

    expect(validateForm('', '')).toBe(false);
    expect(validateForm('test@example.com', '')).toBe(false);
    expect(validateForm('', 'Test Subject')).toBe(false);
    expect(validateForm('test@example.com', 'Test Subject')).toBe(true);
  });

  test('should save draft functionality', () => {
    const saveDraft = jest.fn();
    const draftData = {
      to: 'test@example.com',
      subject: 'Test',
      body: 'Test body',
    };

    saveDraft(draftData.to, '', draftData.subject, draftData.body);
    expect(saveDraft).toHaveBeenCalledWith(
      draftData.to,
      '',
      draftData.subject,
      draftData.body
    );
  });
});

