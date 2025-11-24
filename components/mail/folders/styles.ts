import { StyleSheet } from 'react-native';

/**
 * Creates folders styles based on theme colors
 */
export function createFoldersStyles(colors: any) {
  return StyleSheet.create({
    // Container
    container: {
      flex: 1,
    },
    // Header styles
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 16,
    },
    headerTitle: {
      fontSize: 32,
      fontWeight: '700',
    },
    headerSubtitle: {
      fontSize: 16,
      marginTop: 2,
    },
    // List styles
    emailList: {
      flex: 1,
    },
    // Demo badge styles
    demoBadge: {
      backgroundColor: '#FFF4E5',
      padding: 12,
      borderRadius: 8,
      marginHorizontal: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: '#FFE0B2',
    },
    demoText: {
      fontSize: 14,
      color: '#FF9500',
      textAlign: 'center',
      fontWeight: '600',
    },
    // Create folder button styles
    createFolderButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      borderRadius: 12,
      padding: 16,
      marginHorizontal: 16,
      marginBottom: 16,
      borderWidth: 2,
      borderStyle: 'dashed',
    },
    createFolderButtonText: {
      fontSize: 16,
      fontWeight: '600',
    },
    // Empty state styles
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 60,
    },
    emptyText: {
      fontSize: 16,
      marginTop: 16,
    },
    emptySubtext: {
      fontSize: 14,
      marginTop: 4,
    },
    // Grid styles
    foldersGrid: {
      paddingHorizontal: 16,
      gap: 12,
      marginBottom: 24,
    },
    // Card styles
    folderCard: {
      flexDirection: 'row',
      alignItems: 'center',
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
      marginBottom: 4,
    },
    folderCount: {
      fontSize: 14,
    },
  });
}


