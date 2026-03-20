'use client';

import Image from 'next/image';
import { ChevronLeft, MessageCircle } from "@/app/lib/icons";
import { ConversationListPane } from './ConversationListPane';
import { MessageThread } from './MessageThread';
import { MessageComposer } from './MessageComposer';
import { useMessagingWorkspace } from './hooks/useMessagingWorkspace';
import { getConversationTitle, getConversationSubtitle, getConversationAvatar } from './messagingWorkspace.utils';
import type { MessagingWorkspaceProps } from './messagingWorkspace.utils';

export default function MessagingWorkspace({
  role,
  title,
  subtitle,
  topPaddingClassName = '',
  viewportClassName = 'h-[calc(100dvh-4rem)] sm:h-[calc(100dvh-5rem)]',
  businessOptions,
  initialBusinessId,
  initialConversationId,
  startBusinessId,
  startUserId,
}: MessagingWorkspaceProps) {
  const {
    selectedConversation, selectedConversationId, setSelectedConversationId, unreadTotal,
    conversationsLoading, messages, hasMore, messagesLoading, isLoadingOlder,
    loadOlder, retryMessage, filteredConversations, activeBusinessId, setActiveBusinessId,
    searchQuery, setSearchQuery, composerValue, setComposerValue, isSending,
    isResolvingStartConversation, startConversationError, mobileThreadOpen, setMobileThreadOpen,
    animatedMessageIds, prefersReducedMotion, threadScrollRef,
    listPaneVisibleClass, threadPaneVisibleClass, reviewedBusinessSuggestions,
    getFallbackBusinessName, resolveMessageIdentity,
    handleSelectConversation, handleSend, markAsRead,
  } = useMessagingWorkspace({ role, businessOptions, initialBusinessId, initialConversationId, startBusinessId, startUserId });

  return (
    <>
      <div className={`bg-off-white ${topPaddingClassName}`}>
        <div className={`mx-auto flex w-full max-w-7xl overflow-hidden sm:rounded-xl sm:border sm:border-charcoal/8 sm:shadow-sm ${viewportClassName}`}>

          {/* ── Sidebar ──────────────────────────────────────────── */}
          <ConversationListPane
            title={title}
            unreadTotal={unreadTotal}
            role={role}
            businessOptions={businessOptions}
            activeBusinessId={activeBusinessId}
            onActiveBusinessChange={(id) => {
              setActiveBusinessId(id);
              setSelectedConversationId(null);
              setMobileThreadOpen(false);
            }}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            conversationsLoading={conversationsLoading}
            isResolvingStartConversation={isResolvingStartConversation}
            filteredConversations={filteredConversations}
            selectedConversationId={selectedConversationId}
            onSelectConversation={handleSelectConversation}
            startConversationError={startConversationError}
            reviewedBusinessSuggestions={reviewedBusinessSuggestions}
            getFallbackBusinessName={getFallbackBusinessName}
            listPaneVisibleClass={listPaneVisibleClass}
          />

          {/* ── Thread pane ──────────────────────────────────────── */}
          <section className={`${threadPaneVisibleClass} min-w-0 flex-1 flex-col bg-off-white`}>
            {!selectedConversation && (
              <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full border-2 border-charcoal/15">
                  <MessageCircle className="h-9 w-9 text-charcoal/25" />
                </div>
                <p className="text-base font-bold text-charcoal" style={{ fontFamily: 'Urbanist, system-ui, sans-serif' }}>
                  Your messages
                </p>
                <p className="mt-1 text-sm text-charcoal/45" style={{ fontFamily: 'Urbanist, system-ui, sans-serif' }}>
                  Select a conversation to start messaging
                </p>
              </div>
            )}

            {selectedConversation && (
              <>
                {/* Thread header */}
                <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-charcoal/8 bg-off-white/98 px-4 py-3 backdrop-blur sm:px-5">
                  {(() => {
                    const fallbackBusinessName = getFallbackBusinessName(selectedConversation);
                    const selectedConversationTitle = getConversationTitle(selectedConversation, role, fallbackBusinessName);
                    const selectedConversationSubtitle = getConversationSubtitle(selectedConversation, role, fallbackBusinessName);
                    const selectedAvatar = getConversationAvatar(selectedConversation, role);

                    return (
                      <>
                        {/* Back — mobile only */}
                        <button
                          type="button"
                          onClick={() => setMobileThreadOpen(false)}
                          className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-charcoal/70 transition-colors hover:bg-charcoal/[0.06] lg:hidden"
                          aria-label="Back to conversations"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>

                        {/* Avatar */}
                        <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-charcoal/[0.08]">
                          {selectedAvatar ? (
                            <Image src={selectedAvatar} alt={selectedConversationTitle} fill sizes="40px" className="object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <MessageCircle className="h-4 w-4 text-charcoal/35" />
                            </div>
                          )}
                        </div>

                        {/* Name + subtitle */}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-charcoal" style={{ fontFamily: 'Urbanist, system-ui, sans-serif' }}>
                            {selectedConversationTitle}
                          </p>
                          <p className="truncate text-xs text-charcoal/45" style={{ fontFamily: 'Urbanist, system-ui, sans-serif' }}>
                            {selectedConversationSubtitle}
                          </p>
                        </div>
                      </>
                    );
                  })()}
                </header>

                {/* Messages */}
                <MessageThread
                  messages={messages}
                  messagesLoading={messagesLoading}
                  hasMore={hasMore}
                  isLoadingOlder={isLoadingOlder}
                  onLoadOlder={loadOlder}
                  role={role}
                  animatedMessageIds={animatedMessageIds}
                  prefersReducedMotion={prefersReducedMotion}
                  resolveMessageIdentity={resolveMessageIdentity}
                  onRetryMessage={retryMessage}
                  scrollRef={threadScrollRef}
                />

                {/* Composer */}
                <MessageComposer
                  value={composerValue}
                  onChange={setComposerValue}
                  onSend={() => void handleSend()}
                  isSending={isSending}
                  showTemplates={role === 'business'}
                />
              </>
            )}
          </section>
        </div>
      </div>
      <style jsx>{`
        @keyframes messageBubbleEnter {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes messageBubbleFade {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .message-bubble-enter { animation: messageBubbleEnter 180ms cubic-bezier(0.22, 1, 0.36, 1) both; }
        .message-bubble-enter-reduced { animation: messageBubbleFade 90ms ease-out both; }
      `}</style>
    </>
  );
}
