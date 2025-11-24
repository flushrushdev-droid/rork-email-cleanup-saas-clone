import { StyleSheet } from 'react-native';

export const draftStyles = StyleSheet.create({
  draftCard: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderLeftWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  draftCardContent: {
    flex: 1,
  },
  draftCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  draftBadge: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  draftDate: {
    fontSize: 12,
    marginLeft: 'auto',
  },
  draftTo: {
    fontSize: 14,
    marginBottom: 4,
    fontWeight: '500',
  },
  draftSubject: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  draftBody: {
    fontSize: 13,
    lineHeight: 18,
  },
  deleteDraftButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

