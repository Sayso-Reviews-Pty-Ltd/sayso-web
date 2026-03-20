import type { ConversationListItem, MessagingRole } from '@/app/hooks/messaging';

export interface BusinessOption {
  id: string;
  name: string;
  image_url?: string | null;
}

export interface MessagingWorkspaceProps {
  role: MessagingRole;
  title: string;
  subtitle?: string;
  topPaddingClassName?: string;
  viewportClassName?: string;
  businessOptions?: BusinessOption[];
  initialBusinessId?: string | null;
  initialConversationId?: string | null;
  startBusinessId?: string | null;
  startUserId?: string | null;
}

export interface MessageVisualIdentity {
  name: string;
  avatarUrl: string | null;
}

export function getConversationTitle(
  conversation: ConversationListItem,
  role: MessagingRole,
  fallbackBusinessName?: string
): string {
  if (role === 'business') return conversation.participant?.display_name || 'Unknown';
  return conversation.business?.name || fallbackBusinessName || 'Unknown';
}

export function getConversationSubtitle(
  conversation: ConversationListItem,
  role: MessagingRole,
  fallbackBusinessName?: string
): string {
  if (role === 'business') return conversation.business?.name || fallbackBusinessName || 'Unknown';
  return conversation.business?.category || conversation.business?.name || fallbackBusinessName || 'Unknown';
}

export function getConversationAvatar(conversation: ConversationListItem, role: MessagingRole): string | null {
  if (role === 'business') return conversation.participant?.avatar_url || null;
  return conversation.business?.image_url || null;
}
