import { StyleSheet } from 'react-native';

export const emailListStyles = StyleSheet.create({
  emailList: {
    flex: 1,
  },
  emailCard: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  emailCardUnread: {
    backgroundColor: '#FFFFFF',
  },
  senderAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  senderInitial: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emailCardContent: {
    flex: 1,
  },
  emailCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  emailFrom: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  emailFromUnread: {
    fontWeight: '700',
  },
  emailMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emailDate: {
    fontSize: 13,
  },
  starButton: {
    padding: 2,
  },
  emailSubject: {
    fontSize: 14,
    fontWeight: '400',
    marginBottom: 4,
  },
  emailSubjectUnread: {
    fontWeight: '600',
  },
  emailSnippet: {
    fontSize: 13,
    lineHeight: 18,
  },
  attachmentBadge: {
    marginTop: 6,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
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
});

