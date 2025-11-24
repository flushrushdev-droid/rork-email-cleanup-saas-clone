import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Star, Paperclip, Check } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import type { EmailMessage } from '@/constants/types';
import { formatDate } from '@/utils/dateFormat';
import { emailListStyles } from './styles/emailListStyles';
import { getAvatarColor, getInitial } from './utils/avatarUtils';

interface InboxEmailItemProps {
  email: EmailMessage;
  isSelected: boolean;
  selectionMode: boolean;
  onPress: () => void;
  onStarPress: () => void;
  onToggleSelection: () => void;
}

export const InboxEmailItem = React.memo<InboxEmailItemProps>(({
  email,
  isSelected,
  selectionMode,
  onPress,
  onStarPress,
  onToggleSelection,
}) => {
  const { colors } = useTheme();
  
  const senderName = email.from.split('<')[0].trim() || email.from;
  const senderEmail = email.from.match(/<(.+?)>/) ? email.from.match(/<(.+?)>/)![1] : email.from;
  const initial = getInitial(senderName);
  const avatarColor = getAvatarColor(senderEmail);

  return (
    <TouchableOpacity
      key={email.id}
      testID={`email-${email.id}`}
      style={[
        emailListStyles.emailCard,
        { backgroundColor: colors.surface, borderLeftColor: colors.primary },
        !email.isRead && { backgroundColor: colors.surface },
        isSelected && { backgroundColor: colors.primary + '15' }
      ]}
      onPress={onPress}
      onLongPress={onToggleSelection}
      activeOpacity={0.7}
    >
      <View style={[emailListStyles.senderAvatar, { backgroundColor: avatarColor }]}>
        <Text style={emailListStyles.senderInitial}>{initial}</Text>
      </View>
      <View style={emailListStyles.emailCardContent}>
        <View style={emailListStyles.emailCardHeader}>
          <Text
            style={[
              emailListStyles.emailFrom,
              { color: colors.text },
              !email.isRead && emailListStyles.emailFromUnread
            ]}
            numberOfLines={1}
          >
            {senderName}
          </Text>
          <View style={emailListStyles.emailMeta}>
            <Text style={[emailListStyles.emailDate, { color: colors.textSecondary }]}>
              {formatDate(email.date)}
            </Text>
            <TouchableOpacity
              testID={`star-${email.id}`}
              onPress={(e) => {
                e?.stopPropagation?.();
                onStarPress();
              }}
              style={emailListStyles.starButton}
            >
              <Star
                size={16}
                color={email.isStarred ? colors.warning : colors.textSecondary}
                fill={email.isStarred ? colors.warning : 'none'}
              />
            </TouchableOpacity>
          </View>
        </View>
        <Text
          style={[
            emailListStyles.emailSubject,
            { color: colors.text },
            !email.isRead && emailListStyles.emailSubjectUnread
          ]}
          numberOfLines={1}
        >
          {email.subject}
        </Text>
        <Text style={[emailListStyles.emailSnippet, { color: colors.textSecondary }]} numberOfLines={2}>
          {email.snippet}
        </Text>
        {email.hasAttachments && (
          <View style={emailListStyles.attachmentBadge}>
            <Paperclip size={12} color={colors.textSecondary} />
          </View>
        )}
      </View>
      {selectionMode ? (
        <View style={[
          emailListStyles.checkbox,
          { borderColor: colors.border },
          isSelected && { backgroundColor: colors.primary, borderColor: colors.primary }
        ]}>
          {isSelected && <Check size={16} color="#FFFFFF" />}
        </View>
      ) : (
        !email.isRead && <View style={[emailListStyles.unreadDot, { backgroundColor: colors.primary }]} />
      )}
    </TouchableOpacity>
  );
});

InboxEmailItem.displayName = 'InboxEmailItem';

