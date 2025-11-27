import { StyleSheet } from 'react-native';
import type { ThemeColors } from '@/constants/colors';
import Colors from '@/constants/colors';
import { hexToRgba } from '@/utils/colorUtils';

/**
 * Creates calendar styles based on theme colors
 * Styles are organized by component: sidebar, grid, modal, picker, feedback
 * All colors are theme-aware for proper dark mode support
 */
export function createCalendarStyles(colors: ThemeColors) {
  // Helper to determine if we're in dark mode based on background color
  const isDarkMode = colors.background === Colors.dark.background;
  return StyleSheet.create({
    // Sidebar styles
    calendarButton: {
      padding: 4,
      backgroundColor: 'transparent',
    },
    calendarOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    calendarSidebar: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      width: '85%',
      backgroundColor: colors.background,
      shadowColor: '#000',
      shadowOffset: { width: -2, height: 0 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 16,
      zIndex: 1000,
    },
    calendarHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    calendarTitle: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.text,
    },
    calendarContent: {
      flex: 1,
      paddingHorizontal: 20,
      paddingTop: 20,
    },

    // Feedback styles
    feedbackBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 18,
      marginBottom: 16,
      gap: 12,
    },
    feedbackBannerSuccess: {
      // Light green background for success - blend success color with surface
      backgroundColor: isDarkMode 
        ? hexToRgba(colors.success, 0.15) // 15% opacity success in dark mode
        : hexToRgba(colors.success, 0.1), // 10% opacity success in light mode
    },
    feedbackBannerError: {
      // Light red background for error - blend danger color with surface
      backgroundColor: isDarkMode
        ? hexToRgba(colors.danger, 0.15) // 15% opacity danger in dark mode
        : hexToRgba(colors.danger, 0.1), // 10% opacity danger in light mode
    },
    feedbackIndicator: {
      width: 10,
      height: 10,
      borderRadius: 5,
    },
    feedbackIndicatorSuccess: {
      backgroundColor: colors.success,
    },
    feedbackIndicatorError: {
      backgroundColor: colors.danger,
    },
    feedbackText: {
      flex: 1,
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    feedbackTextSuccess: {
      color: colors.success,
    },
    feedbackTextError: {
      color: colors.danger,
    },
    feedbackDismiss: {
      padding: 6,
      borderRadius: 16,
      backgroundColor: 'rgba(0,0,0,0.05)',
    },

    // Calendar grid styles
    monthNavigation: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    monthButton: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: colors.surface,
    },
    monthText: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
    },
    calendarGrid: {
      marginBottom: 24,
    },
    weekDaysRow: {
      flexDirection: 'row',
      marginBottom: 8,
    },
    weekDayCell: {
      width: '14.28%',
      alignItems: 'center',
      paddingVertical: 8,
    },
    weekDayText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    weekRow: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
    },
    dayCell: {
      width: '14.28%',
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 8,
    },
    todayCell: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    selectedDayCell: {
      backgroundColor: colors.primary,
    },
    dayText: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.text,
      textAlign: 'center',
    },
    emptyDayText: {
      opacity: 0,
    },
    todayText: {
      color: colors.primary,
      fontWeight: '700',
    },
    selectedDayText: {
      color: '#FFFFFF', // White text on selected day (primary background)
      fontWeight: '700',
    },
    selectedDateInfo: {
      padding: 16,
      backgroundColor: colors.surface,
      borderRadius: 12,
      marginBottom: 24,
    },
    selectedDateLabel: {
      fontSize: 13,
      fontWeight: '500',
      color: colors.textSecondary,
      marginBottom: 4,
    },
    selectedDateValue: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },

    // Events styles
    calendarEvents: {
      flex: 1,
    },
    eventsTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 16,
    },
    emptyEvents: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 40,
    },
    emptyEventsText: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 12,
    },
    eventsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    newMeetingButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      backgroundColor: colors.primary,
    },
    newMeetingButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text, // Use theme text color (will be white on primary background)
    },
    eventsList: {
      flex: 1,
    },
    eventCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 14,
      marginBottom: 12,
      borderLeftWidth: 3,
      borderLeftColor: colors.primary,
    },
    eventCardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
      gap: 8,
    },
    eventTypeIcon: {
      width: 28,
      height: 28,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    eventTime: {
      flex: 1,
      fontSize: 13,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    deleteEventButton: {
      padding: 8,
      justifyContent: 'center',
      alignItems: 'center',
      height: 36,
    },
    eventTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 6,
    },
    eventLocation: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginBottom: 6,
    },
    eventLocationText: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    eventDescription: {
      fontSize: 13,
      color: colors.textSecondary,
      lineHeight: 18,
    },
    addEventButton: {
      marginTop: 16,
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8,
      backgroundColor: colors.primary,
    },
    addEventButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: '#FFFFFF', // White text on primary background (works in both themes)
    },
    dateDisplay: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    dateDisplayText: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.text,
    },

    // Meeting modal styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 24,
      maxHeight: '90%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    modalTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
    },
    inputContainer: {
      marginBottom: 20,
    },
    inputLabel: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    input: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
    },
    textArea: {
      height: 120,
      textAlignVertical: 'top',
    },
    meetingTypeContainer: {
      flexDirection: 'row',
      gap: 12,
    },
    meetingTypeButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 12,
      borderRadius: 12,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    meetingTypeButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    meetingTypeText: {
      fontSize: 15,
      fontWeight: '500',
      color: colors.text,
    },
    meetingTypeTextActive: {
      color: '#FFFFFF', // White text on primary background
      fontWeight: '600',
    },
    createMeetingButton: {
      backgroundColor: colors.primary,
      paddingVertical: 18,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
      marginTop: 8,
    },
    createMeetingButtonDisabled: {
      backgroundColor: colors.textTertiary, // Use theme tertiary color for disabled state
      shadowOpacity: 0,
      elevation: 0,
    },
    createMeetingButtonText: {
      fontSize: 17,
      fontWeight: '700',
      color: '#FFFFFF', // White text on primary background
      letterSpacing: 0.3,
    },

    // Delete confirmation modal styles
    confirmOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.45)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 24,
    },
    confirmBackdrop: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
    confirmContent: {
      width: '100%',
      maxWidth: 360,
      backgroundColor: colors.surface,
      borderRadius: 28,
      paddingHorizontal: 24,
      paddingTop: 28,
    },
    confirmIcon: {
      width: 54,
      height: 54,
      borderRadius: 27,
      backgroundColor: '#FFE9EA',
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
    },
    confirmTitle: {
      marginTop: 20,
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
    },
    confirmDescription: {
      marginTop: 12,
      fontSize: 15,
      lineHeight: 22,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    confirmActions: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 28,
    },
    confirmCancelButton: {
      flex: 1,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      paddingVertical: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    confirmCancelText: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },
    confirmDeleteButton: {
      flex: 1,
      borderRadius: 12,
      backgroundColor: colors.danger,
      paddingVertical: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    confirmDeleteText: {
      fontSize: 15,
      fontWeight: '600',
      color: '#FFFFFF', // White text on danger background
    },

    // Date/Time picker styles
    iosPickerOverlay: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    iosPickerBackdrop: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    datePickerOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    datePickerBackdrop: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    datePickerContainer: {
      backgroundColor: colors.background,
      borderRadius: 24,
      padding: 20,
      width: '90%',
      maxWidth: 400,
      maxHeight: 400,
    },
    datePickerContainerIOS: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: colors.background,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 20,
    },
    datePickerHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    datePickerTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.text,
    },
    datePickerDone: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.primary,
    },
    dateTimePicker: {
      width: '100%',
      height: 200,
      backgroundColor: 'transparent',
    },
    dateInputsRow: {
      flexDirection: 'row',
      gap: 12,
      paddingVertical: 20,
    },
    timeInputsRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 12,
      paddingVertical: 20,
    },
    dateInputGroup: {
      flex: 1,
    },
    timeInputGroup: {
      flex: 1,
    },
    dateInputLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textSecondary,
      marginBottom: 8,
    },
    dateInput: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
      textAlign: 'center',
    },
    timeSeparator: {
      fontSize: 32,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 8,
    },
    ampmContainer: {
      flexDirection: 'column',
      gap: 8,
    },
    ampmButton: {
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 12,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      minWidth: 60,
      alignItems: 'center',
    },
    ampmButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    ampmText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    ampmTextActive: {
      color: '#FFFFFF', // White text on primary background
    },
    pickerCenterOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      paddingHorizontal: 24,
    },
    pickerBackdrop: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    pickerCenterContainer: {
      width: '100%',
      maxWidth: 340,
      backgroundColor: colors.background,
      borderRadius: 24,
      padding: 20,
    },
    wheelPickersContainer: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 12,
    },
    wheelPickerColumn: {
      flex: 1,
      alignItems: 'center',
    },
    wheelPickerLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textSecondary,
      marginBottom: 12,
    },
    wheelPickerWrapper: {
      height: 176,
      width: '100%',
      position: 'relative',
    },
    wheelPickerHighlight: {
      position: 'absolute',
      top: '50%',
      left: 0,
      right: 0,
      height: 44,
      marginTop: -22,
      backgroundColor: 'transparent',
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.primary,
      zIndex: 0,
      pointerEvents: 'none',
    },
    wheelScrollContent: {
      paddingVertical: 66,
    },
    wheelItem: {
      height: 44,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 2,
    },
    wheelItemText: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.textSecondary,
    },
    wheelItemTextActive: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    // Calendar screen styles
    pickerOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    pickerContent: {
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 24,
      paddingBottom: 40,
    },
    pickerTitle: {
      fontSize: 20,
      fontWeight: '600',
      marginBottom: 20,
      textAlign: 'center',
    },
    pickerItem: {
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 8,
      marginVertical: 2,
    },
    pickerItemText: {
      fontSize: 18,
      fontWeight: '500',
    },
    pickerChip: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 16,
      borderWidth: 1,
    },
    pickerButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 20,
    },
    pickerButton: {
      flex: 1,
      padding: 16,
      borderRadius: 8,
      alignItems: 'center',
      marginHorizontal: 4,
    },
    pickerButtonText: {
      fontSize: 16,
      fontWeight: '600',
    },
    timeButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderRadius: 8,
      padding: 12,
      marginHorizontal: 4,
    },
    timeButtonText: {
      marginLeft: 8,
      fontSize: 16,
    },
    eventsSectionTitle: {
      fontSize: 18,
      fontWeight: '600',
    },
  });
}

