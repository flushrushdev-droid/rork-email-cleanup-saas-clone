import { StyleSheet } from 'react-native';

export function createRulesStyles(colors: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      padding: 16,
      paddingBottom: 8,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 15,
    },
    createButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      marginHorizontal: 16,
      marginBottom: 16,
      borderRadius: 12,
      padding: 16,
      borderWidth: 2,
      borderStyle: 'dashed',
    },
    createButtonText: {
      fontSize: 16,
      fontWeight: '600',
    },
    statsBar: {
      flexDirection: 'row',
      gap: 8,
      paddingHorizontal: 12,
      marginBottom: 20,
    },
    scrollContent: {
      paddingHorizontal: 16,
    },
    templateSection: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      marginBottom: 12,
    },
    templatesScroll: {
      marginLeft: -16,
      paddingLeft: 16,
    },
    templateCard: {
      alignItems: 'center',
      marginRight: 12,
      width: 100,
    },
    templateIcon: {
      width: 64,
      height: 64,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
    },
    templateName: {
      fontSize: 13,
      fontWeight: '600',
      textAlign: 'center',
    },
    section: {
      marginBottom: 24,
    },
    ruleCard: {
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    ruleCardDisabled: {
      opacity: 0.6,
    },
    ruleHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 16,
    },
    ruleInfo: {
      flex: 1,
      paddingRight: 12,
    },
    ruleName: {
      fontSize: 17,
      fontWeight: '600',
      marginBottom: 4,
    },
    ruleNameDisabled: {
    },
    ruleLastRun: {
      fontSize: 12,
    },
    ruleConditions: {
      borderRadius: 10,
      padding: 12,
      marginBottom: 12,
    },
    conditionLabel: {
      fontSize: 12,
      fontWeight: '600',
      marginBottom: 4,
    },
    conditionText: {
      fontSize: 14,
      lineHeight: 20,
    },
    ruleActions: {
      marginBottom: 12,
    },
    actionLabel: {
      fontSize: 12,
      fontWeight: '600',
      marginBottom: 8,
    },
    actionBadges: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    actionBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
    },
    actionBadgeText: {
      fontSize: 13,
      fontWeight: '500',
    },
    ruleFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: 12,
      borderTopWidth: 1,
    },
    matchBadge: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
    },
    matchCount: {
      fontSize: 12,
      fontWeight: '600',
    },
    ruleButtons: {
      flexDirection: 'row',
      gap: 8,
    },
    testButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
    },
    testButtonText: {
      fontSize: 13,
      fontWeight: '600',
    },
    editButton: {
      width: 32,
      height: 32,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    builderPromo: {
      borderRadius: 16,
      padding: 24,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    builderIcon: {
      width: 64,
      height: 64,
      borderRadius: 32,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    builderTitle: {
      fontSize: 20,
      fontWeight: '700',
      marginBottom: 8,
    },
    builderDescription: {
      fontSize: 14,
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: 20,
    },
    builderButton: {
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 10,
    },
    builderButtonText: {
      fontSize: 15,
      fontWeight: '600',
      color: '#FFFFFF',
    },
  });
}

export function createRuleFormStyles(colors: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 100,
    },
    section: {
      marginBottom: 24,
    },
    label: {
      fontSize: 15,
      fontWeight: '600',
      marginBottom: 8,
    },
    input: {
      fontSize: 16,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 12,
      borderWidth: 1,
    },
    sectionHeader: {
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      marginBottom: 4,
    },
    sectionSubtitle: {
      fontSize: 13,
    },
    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderStyle: 'dashed',
      marginTop: 12,
    },
    addButtonText: {
      fontSize: 15,
      fontWeight: '600',
    },
    bottomSpace: {
      height: 20,
    },
    footer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      flexDirection: 'row',
      gap: 12,
      padding: 16,
      borderTopWidth: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 8,
    },
    cancelButton: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 12,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cancelButtonText: {
      fontSize: 16,
      fontWeight: '600',
    },
    saveButton: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    saveButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
    },
  });
}
