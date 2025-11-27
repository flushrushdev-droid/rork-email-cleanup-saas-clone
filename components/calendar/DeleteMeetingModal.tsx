import React from 'react';
import { View, Modal, TouchableOpacity } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { Trash2 } from 'lucide-react-native';
import { EdgeInsets } from 'react-native-safe-area-context';
import type { CalendarEvent } from '@/hooks/useCalendar';
import { createCalendarStyles } from './styles/calendarStyles';

interface DeleteMeetingModalProps {
  visible: boolean;
  event: CalendarEvent | undefined;
  onConfirm: () => void;
  onCancel: () => void;
  insets: EdgeInsets;
  colors: any;
}

export function DeleteMeetingModal({
  visible,
  event,
  onConfirm,
  onCancel,
  insets,
  colors,
}: DeleteMeetingModalProps) {
  const styles = createCalendarStyles(colors);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.confirmOverlay}>
        <TouchableOpacity
          style={styles.confirmBackdrop}
          activeOpacity={1}
          onPress={onCancel}
        />
        <View style={[styles.confirmContent, { paddingBottom: insets.bottom + 24 }]}>
          <View style={styles.confirmIcon}>
            <Trash2 size={24} color={colors.danger} />
          </View>
          <AppText style={styles.confirmTitle} dynamicTypeStyle="title2">Delete meeting?</AppText>
          <AppText style={styles.confirmDescription} dynamicTypeStyle="body">
            {event
              ? `"${event.title}" scheduled for ${event.time} on ${event.date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })} will be removed`
              : 'This meeting will be removed permanently'}
          </AppText>
          <View style={styles.confirmActions}>
            <TouchableOpacity
              style={styles.confirmCancelButton}
              onPress={onCancel}
              testID="cancel-delete-meeting"
            >
              <AppText style={styles.confirmCancelText} dynamicTypeStyle="headline">Cancel</AppText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmDeleteButton}
              onPress={onConfirm}
              testID="confirm-delete-meeting"
            >
              <AppText style={styles.confirmDeleteText} dynamicTypeStyle="headline">Delete</AppText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}


