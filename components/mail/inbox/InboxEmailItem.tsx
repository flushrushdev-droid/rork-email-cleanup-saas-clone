import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { Star, Paperclip, Check } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import type { EmailMessage } from '@/constants/types';
import { formatDate } from '@/utils/dateFormat';
import { emailListStyles } from './styles/emailListStyles';
import { getAvatarColor, getInitial } from './utils/avatarUtils';
import { triggerButtonHaptic } from '@/utils/haptics';
import { formatAccessibilityLabel } from '@/utils/accessibility';
import { AnimatedCard } from '@/components/common/AnimatedCard';

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

  // Create comprehensive accessibility label for email item
  const emailAccessibilityLabel = React.useMemo(() => {
    const readStatus = email.isRead ? 'Read' : 'Unread';
    const starStatus = email.isStarred ? ', starred' : '';
    const attachmentStatus = email.hasAttachments ? ', with attachments' : '';
    const dateText = formatDate(email.date);
    
    return `Email from ${senderName}, ${readStatus}${starStatus}, subject: ${email.subject || 'No subject'}, ${dateText}${attachmentStatus}`;
  }, [email, senderName]);

  const emailAccessibilityHint = React.useMemo(() => {
    if (selectionMode) {
      return isSelected ? 'Double tap to deselect' : 'Double tap to select';
    }
    return 'Double tap to open email, long press to select';
  }, [selectionMode, isSelected]);

  return (
    <AnimatedCard
      key={email.id}
      testID={`email-${email.id}`}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={emailAccessibilityLabel}
      accessibilityHint={emailAccessibilityHint}
      accessibilityState={{
        selected: isSelected,
      }}
      style={[
        emailListStyles.emailCard,
        { backgroundColor: colors.surface, borderLeftColor: colors.primary },
        !email.isRead && { backgroundColor: colors.surface },
        isSelected && { backgroundColor: colors.primary + '15' }
      ]}
      onPress={onPress}
      onLongPress={onToggleSelection}
    >
      <View 
        style={[emailListStyles.senderAvatar, { backgroundColor: avatarColor }]}
        accessible={true}
        accessibilityRole="image"
        accessibilityLabel={`Avatar for ${senderName}`}
      >
        <AppText style={emailListStyles.senderInitial} dynamicTypeStyle="body">{initial}</AppText>
      </View>
      <View style={emailListStyles.emailCardContent}>
        <View style={emailListStyles.emailCardHeader}>
          <AppText
            style={[
              emailListStyles.emailFrom,
              { color: colors.text },
              !email.isRead && emailListStyles.emailFromUnread
            ]}
            numberOfLines={1}
            dynamicTypeStyle="body"
          >
            {senderName}
          </AppText>
          <View style={emailListStyles.emailMeta}>
            <AppText style={[emailListStyles.emailDate, { color: colors.textSecondary }]} dynamicTypeStyle="caption">
              {formatDate(email.date)}
            </AppText>
            <TouchableOpacity
              testID={`star-${email.id}`}
              accessible={true}
              accessibilityLabel={email.isStarred ? `Unstar email from ${senderName}` : `Star email from ${senderName}`}
              accessibilityHint={email.isStarred ? 'Double tap to remove star' : 'Double tap to mark as important'}
              onPress={async (e) => {
                e?.stopPropagation?.();
                await triggerButtonHaptic();
                onStarPress();
              }}
              style={emailListStyles.starButton}
              // Don't use accessibilityRole="button" here since it's nested inside another button on web
              // The accessibilityLabel and Hint are sufficient for screen readers
            >
              <Star
                size={16}
                color={email.isStarred ? colors.warning : colors.textSecondary}
                fill={email.isStarred ? colors.warning : 'none'}
              />
            </TouchableOpacity>
          </View>
        </View>
        <AppText
          style={[
            emailListStyles.emailSubject,
            { color: colors.text },
            !email.isRead && emailListStyles.emailSubjectUnread
          ]}
          numberOfLines={1}
          dynamicTypeStyle="body"
        >
          {email.subject}
        </AppText>
        <AppText style={[emailListStyles.emailSnippet, { color: colors.textSecondary }]} numberOfLines={2} dynamicTypeStyle="caption">
          {email.snippet}
        </AppText>
        {email.hasAttachments && (
          <View 
            style={emailListStyles.attachmentBadge}
            accessible={true}
            accessibilityRole="image"
            accessibilityLabel="Has attachments"
          >
            <Paperclip size={12} color={colors.textSecondary} />
          </View>
        )}
      </View>
      {selectionMode ? (
        <View 
          style={[
            emailListStyles.checkbox,
            { borderColor: colors.border },
            isSelected && { backgroundColor: colors.primary, borderColor: colors.primary }
          ]}
          accessible={true}
          accessibilityRole="checkbox"
          accessibilityLabel={isSelected ? 'Selected' : 'Not selected'}
          accessibilityState={{ checked: isSelected }}
        >
          {isSelected && <Check size={16} color={colors.surface} />}
        </View>
      ) : (
        !email.isRead && (
          <View 
            style={[emailListStyles.unreadDot, { backgroundColor: colors.primary }]}
            accessible={true}
            accessibilityRole="image"
            accessibilityLabel="Unread indicator"
          />
        )
      )}
    </AnimatedCard>
  );
});

InboxEmailItem.displayName = 'InboxEmailItem';

