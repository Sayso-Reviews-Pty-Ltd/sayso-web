'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { useAuth } from '@/app/contexts/AuthContext';
import {
  useConversationMessages,
  useConversations,
  type ConversationListItem,
  type MessagingRole,
} from '@/app/hooks/messaging';
import { useUserReviews } from '@/app/hooks/useUserReviews';
import type { BusinessOption, MessageVisualIdentity, MessagingWorkspaceProps } from '../messagingWorkspace.utils';
import { getConversationTitle, getConversationSubtitle } from '../messagingWorkspace.utils';

export function useMessagingWorkspace({
  role,
  businessOptions,
  initialBusinessId,
  initialConversationId,
  startBusinessId,
  startUserId,
}: Pick<MessagingWorkspaceProps, 'role' | 'businessOptions' | 'initialBusinessId' | 'initialConversationId' | 'startBusinessId' | 'startUserId'>) {
  const { user } = useAuth();
  const prefersReducedMotion = useReducedMotion();
  const { reviews } = useUserReviews();

  const [activeBusinessId, setActiveBusinessId] = useState<string | null>(initialBusinessId || null);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(initialConversationId || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [composerValue, setComposerValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isResolvingStartConversation, setIsResolvingStartConversation] = useState(false);
  const [startConversationError, setStartConversationError] = useState<string | null>(null);
  const [mobileThreadOpen, setMobileThreadOpen] = useState(Boolean(initialConversationId));
  const [animatedMessageIds, setAnimatedMessageIds] = useState<Set<string>>(new Set());
  const previousMessageIdsRef = useRef<string[]>([]);
  const hasInitializedMessagesRef = useRef(false);
  const animationTimeoutsRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    if (role !== 'business') return;
    if (startBusinessId) { setActiveBusinessId(startBusinessId); return; }
    if (!activeBusinessId && businessOptions && businessOptions.length > 0) setActiveBusinessId(null);
  }, [activeBusinessId, businessOptions, role, startBusinessId]);

  const { conversations, unreadTotal, isLoading: conversationsLoading, mutate: mutateConversations } = useConversations({
    role,
    businessId: role === 'business' ? activeBusinessId : undefined,
    enabled: Boolean(user),
  });

  const selectedConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === selectedConversationId) || null,
    [conversations, selectedConversationId]
  );

  useEffect(() => {
    if (!selectedConversationId || conversationsLoading) return;
    const stillExists = conversations.some((c) => c.id === selectedConversationId);
    if (!stillExists) { setSelectedConversationId(null); setMobileThreadOpen(false); }
  }, [conversations, conversationsLoading, selectedConversationId]);

  const { messages, hasMore, isLoading: messagesLoading, isLoadingOlder, loadOlder, sendMessage, retryMessage, markAsRead } = useConversationMessages({
    conversationId: selectedConversationId,
    role,
    conversationBusinessId: selectedConversation?.business_id || activeBusinessId,
  });

  const filteredConversations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return conversations;
    return conversations.filter((conversation) => {
      const titleValue = getConversationTitle(conversation, role).toLowerCase();
      const subtitleValue = getConversationSubtitle(conversation, role).toLowerCase();
      return titleValue.includes(query) || subtitleValue.includes(query) || conversation.last_message_preview.toLowerCase().includes(query);
    });
  }, [conversations, role, searchQuery]);

  const resolveStartRef = useRef(false);

  useEffect(() => {
    if (initialConversationId || startBusinessId) return;
    if (conversationsLoading || isResolvingStartConversation) return;
    if (selectedConversationId) return;
    if (conversations.length > 0) setSelectedConversationId(conversations[0].id);
  }, [conversations, conversationsLoading, initialConversationId, isResolvingStartConversation, selectedConversationId, startBusinessId]);

  useEffect(() => {
    return () => {
      animationTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
      animationTimeoutsRef.current.clear();
    };
  }, []);

  useEffect(() => {
    previousMessageIdsRef.current = [];
    hasInitializedMessagesRef.current = false;
    setAnimatedMessageIds(new Set());
    animationTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
    animationTimeoutsRef.current.clear();
  }, [selectedConversationId]);

  useEffect(() => {
    if (!selectedConversationId) return;
    const currentMessageIds = messages.map((message) => message.id);
    const previousMessageIds = previousMessageIdsRef.current;
    if (!hasInitializedMessagesRef.current) {
      previousMessageIdsRef.current = currentMessageIds;
      hasInitializedMessagesRef.current = true;
      return;
    }
    const hasAppendedMessages =
      currentMessageIds.length > previousMessageIds.length &&
      previousMessageIds.every((id, index) => currentMessageIds[index] === id);
    if (hasAppendedMessages) {
      const appendedMessageIds = currentMessageIds.slice(previousMessageIds.length);
      if (appendedMessageIds.length > 0) {
        setAnimatedMessageIds((prev) => {
          const next = new Set(prev);
          appendedMessageIds.forEach((id) => next.add(id));
          return next;
        });
        appendedMessageIds.forEach((id) => {
          const existingTimeout = animationTimeoutsRef.current.get(id);
          if (existingTimeout) window.clearTimeout(existingTimeout);
          const timeoutId = window.setTimeout(() => {
            setAnimatedMessageIds((prev) => {
              if (!prev.has(id)) return prev;
              const next = new Set(prev);
              next.delete(id);
              return next;
            });
            animationTimeoutsRef.current.delete(id);
          }, prefersReducedMotion ? 120 : 220);
          animationTimeoutsRef.current.set(id, timeoutId);
        });
      }
    }
    previousMessageIdsRef.current = currentMessageIds;
  }, [messages, prefersReducedMotion, selectedConversationId]);

  useEffect(() => {
    if (!user?.id) return;
    if (resolveStartRef.current) return;
    if (initialConversationId) {
      resolveStartRef.current = true;
      setSelectedConversationId(initialConversationId);
      setMobileThreadOpen(true);
      return;
    }
    if (!startBusinessId) return;
    resolveStartRef.current = true;
    setIsResolvingStartConversation(true);
    setStartConversationError(null);
    const payload: Record<string, string> = { business_id: startBusinessId };
    if (startUserId) payload.user_id = startUserId;
    void fetch('/api/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(async (response) => {
        if (!response.ok) {
          const errorPayload = await response.json().catch(() => ({}));
          throw new Error(errorPayload?.error || 'Failed to start conversation');
        }
        const data = await response.json();
        const conversationId = data?.data?.id;
        if (conversationId) { setSelectedConversationId(conversationId); setMobileThreadOpen(true); void mutateConversations(); }
      })
      .catch((error: any) => { setStartConversationError(error?.message || 'Failed to start conversation'); })
      .finally(() => { setIsResolvingStartConversation(false); });
  }, [initialConversationId, mutateConversations, startBusinessId, startUserId, user?.id]);

  const handleSelectConversation = useCallback((conversationId: string) => {
    setSelectedConversationId(conversationId);
    setMobileThreadOpen(true);
  }, []);

  const handleSend = useCallback(async () => {
    if (!selectedConversationId || !composerValue.trim() || isSending) return;
    setIsSending(true);
    const currentValue = composerValue;
    setComposerValue('');
    const result = await sendMessage(currentValue);
    if (!result.ok) setComposerValue(currentValue);
    setIsSending(false);
  }, [composerValue, isSending, selectedConversationId, sendMessage]);

  const threadScrollRef = useRef<HTMLDivElement | null>(null);
  const nearBottomRef = useRef(true);

  useEffect(() => {
    const node = threadScrollRef.current;
    if (!node) return;
    const onScroll = () => { nearBottomRef.current = node.scrollHeight - node.scrollTop - node.clientHeight < 120; };
    onScroll();
    node.addEventListener('scroll', onScroll);
    return () => node.removeEventListener('scroll', onScroll);
  }, [selectedConversationId]);

  useEffect(() => {
    const node = threadScrollRef.current;
    if (!node || !selectedConversationId) return;
    if (nearBottomRef.current) node.scrollTo({ top: node.scrollHeight, behavior: 'smooth' });
  }, [messages.length, selectedConversationId]);

  useEffect(() => {
    const node = threadScrollRef.current;
    if (!node || !selectedConversationId) return;
    requestAnimationFrame(() => { node.scrollTop = node.scrollHeight; nearBottomRef.current = true; });
  }, [selectedConversationId]);

  const isThreadVisible = Boolean(selectedConversationId) && mobileThreadOpen;
  const latestMessage = messages.length > 0 ? messages[messages.length - 1] : null;

  useEffect(() => {
    if (!selectedConversationId || !isThreadVisible || messages.length === 0) return;
    if (!latestMessage || latestMessage.sender_type === role) return;
    const timer = window.setTimeout(() => { void markAsRead(); }, 250);
    return () => window.clearTimeout(timer);
  }, [isThreadVisible, latestMessage, markAsRead, messages.length, role, selectedConversationId]);

  const listPaneVisibleClass = mobileThreadOpen ? 'hidden lg:flex' : 'flex';
  const threadPaneVisibleClass = mobileThreadOpen ? 'flex' : 'hidden lg:flex';
  const businessNameById = useMemo(() => new Map((businessOptions || []).map((b) => [b.id, b.name])), [businessOptions]);

  const reviewedBusinessSuggestions = useMemo(() => {
    if (role !== 'user') return [];
    return reviews.filter((r) => r.business_id).slice(0, 3).map((r) => ({
      business_id: r.business_id!,
      business_name: r.business_name,
      business_image_url: r.business_image_url || null,
    }));
  }, [reviews, role]);

  const getFallbackBusinessName = useCallback(
    (conversation: ConversationListItem | null | undefined): string | undefined => {
      if (!conversation) return undefined;
      const businessId = conversation.business?.id || conversation.business_id || null;
      if (!businessId) return undefined;
      return businessNameById.get(businessId) || reviewedBusinessSuggestions.find((s) => s.business_id === businessId)?.business_name;
    },
    [businessNameById, reviewedBusinessSuggestions]
  );

  const selectedBusinessOption = useMemo(() => {
    if (!businessOptions || businessOptions.length === 0) return null;
    const targetBusinessId = selectedConversation?.business?.id || selectedConversation?.business_id || activeBusinessId;
    if (!targetBusinessId) return null;
    return businessOptions.find((b) => b.id === targetBusinessId) || null;
  }, [activeBusinessId, businessOptions, selectedConversation?.business?.id, selectedConversation?.business_id]);

  const businessIdentity = useMemo<MessageVisualIdentity>(() => ({
    name: selectedConversation?.business?.name || selectedBusinessOption?.name || getFallbackBusinessName(selectedConversation) || 'Unknown',
    avatarUrl: selectedConversation?.business?.image_url || selectedBusinessOption?.image_url || null,
  }), [getFallbackBusinessName, selectedBusinessOption?.image_url, selectedBusinessOption?.name, selectedConversation?.business?.image_url, selectedConversation?.business?.name, selectedConversation]);

  const participantIdentity = useMemo<MessageVisualIdentity>(() => ({
    name: selectedConversation?.participant?.display_name || selectedConversation?.participant?.username || 'Unknown',
    avatarUrl: selectedConversation?.participant?.avatar_url || null,
  }), [selectedConversation?.participant?.avatar_url, selectedConversation?.participant?.display_name, selectedConversation?.participant?.username]);

  const userIdentity = useMemo<MessageVisualIdentity>(() => ({
    name: user?.profile?.display_name || user?.profile?.username || (user?.email ? user.email.split('@')[0] : '') || 'You',
    avatarUrl: user?.profile?.avatar_url || user?.avatar_url || null,
  }), [user?.avatar_url, user?.email, user?.profile?.avatar_url, user?.profile?.display_name, user?.profile?.username]);

  const resolveMessageIdentity = useCallback(
    (ownMessage: boolean): MessageVisualIdentity => {
      if (role === 'user') return ownMessage ? userIdentity : businessIdentity;
      return ownMessage ? businessIdentity : participantIdentity;
    },
    [businessIdentity, participantIdentity, role, userIdentity]
  );

  return {
    user, selectedConversation, selectedConversationId, setSelectedConversationId,
    conversations, unreadTotal,
    conversationsLoading, messages, hasMore, messagesLoading, isLoadingOlder,
    loadOlder, retryMessage, filteredConversations, activeBusinessId, setActiveBusinessId,
    searchQuery, setSearchQuery, composerValue, setComposerValue, isSending,
    isResolvingStartConversation, startConversationError, mobileThreadOpen, setMobileThreadOpen,
    animatedMessageIds, prefersReducedMotion, threadScrollRef,
    listPaneVisibleClass, threadPaneVisibleClass, reviewedBusinessSuggestions,
    getFallbackBusinessName, resolveMessageIdentity,
    handleSelectConversation, handleSend, markAsRead,
  };
}
