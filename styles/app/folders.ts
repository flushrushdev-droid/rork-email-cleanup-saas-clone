import { StyleSheet } from 'react-native';
import type { ThemeColors } from '@/constants/colors';

export function createFoldersStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      padding: 16,
      paddingBottom: 8,
    },
    demoBadge: {
      backgroundColor: '#FFF4E5',
      padding: 12,
      borderRadius: 8,
      marginTop: 8,
      borderWidth: 1,
      borderColor: '#FFE0B2',
    },
    demoText: {
      fontSize: 14,
      color: '#FF9500',
      textAlign: 'center',
      fontWeight: '600',
    },
    emptyState: {
      paddingVertical: 60,
    },
    title: {
      fontSize: 32,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
    },
    scrollContent: {
      padding: 16,
    },
    createButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
      borderWidth: 2,
      borderStyle: 'dashed',
    },
    createButtonText: {
      fontSize: 16,
      fontWeight: '600',
    },
  foldersGrid: {
    gap: 12,
    marginBottom: 24,
  },
  folderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  folderIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  folderContent: {
    flex: 1,
  },
  folderName: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  folderCount: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  seeAll: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  emailCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  emailHeader: {
    marginBottom: 8,
  },
  emailMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emailFrom: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
    flex: 1,
  },
  emailDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  emailSubject: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  emailSnippet: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 10,
  },
  emailTags: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  emailTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  emailTagText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
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
  modalDescription: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 24,
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
  helperText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 8,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  createButtonModal: {
    backgroundColor: colors.primary,
  },
  createButtonModalText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  });
}

