'use client';

import React, { useState, memo } from 'react';
import { useReviewHelpful } from '../../hooks/useReviewHelpful';
import { useReviewReplies } from '../../hooks/useReviewReplies';
import { useUserBadgesById } from '../../hooks/useUserBadges';
import { m } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useReviewSubmission } from '../../hooks/useReviews';
import { useIsDesktop } from '../../hooks/useIsDesktop';
import { ConfirmationDialog } from '@/app/components/molecules/ConfirmationDialog/ConfirmationDialog';
import type { BadgePillData } from '../Badges/BadgePill';
import { isOptimisticId, isValidUUID } from '../../lib/utils/validation';
import { ReviewFlagModal, type FlagReason } from './ReviewFlagModal';
import { ReviewReplies } from './ReviewReplies';
import { ReviewHeader } from './parts/ReviewHeader';
import { ReviewContent } from './parts/ReviewContent';
import { ReviewActions } from './parts/ReviewActions';
import { ReviewMessageModal } from './parts/ReviewMessageModal';
import { useReviewOwnerCheck, useReviewFlagStatus } from './hooks/useReviewCardLogic';
import type { ReviewCardProps } from './ReviewCard.types';
import {
  formatReviewRelativeDate,
  sendReviewDirectMessage,
  submitReviewFlagRequest,
} from './reviewCard.utils';

function ReviewCard({
  review,
  onUpdate,
  showBusinessInfo = false,
  isOwnerView = false,
}: ReviewCardProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const { likeReview, deleteReview } = useReviewSubmission();
  const isDesktop = useIsDesktop();
  const isTransientReviewId = isOptimisticId(review.id) || !isValidUUID(review.id);

  const isOwner = useReviewOwnerCheck(review, user);
  const { isFlagged, isChecking: checkingFlagStatus } = useReviewFlagStatus(
    review.id,
    Boolean(user && !isOwner && !isTransientReviewId)
  );

  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [flagging, setFlagging] = useState(false);
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  // SWR-backed badges for the review author
  const authorId = review.user_id || review.user?.id;
  const { badges: fetchedAuthorBadges } = useUserBadgesById(authorId ?? null);
  const userBadges: BadgePillData[] = fetchedAuthorBadges.slice(0, 3);

  // SWR-backed helpful status and count (with optimistic toggle)
  const {
    count: helpfulCount,
    isHelpful: isLiked,
    loading: loadingHelpful,
    toggle: toggleHelpful,
  } = useReviewHelpful(review.id, typeof review.helpful_count === 'number' ? review.helpful_count : 0);

  // SWR-backed replies (only need count for the Reply button label)
  const { replies } = useReviewReplies(review.id);

  const handleLike = async () => {
    if (!user) return;
    await toggleHelpful();
  };

  const handleEdit = () => {
    if (!review.id) return;
    const pathParts = window.location.pathname.split('/');
    const businessSlugOrId = pathParts[pathParts.indexOf('business') + 1] || review.business_id;
    router.push(`/business/${businessSlugOrId}/review?edit=${review.id}`);
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    setShowDeleteDialog(false);
    const success = await deleteReview(review.id);
    if (success && onUpdate) {
      onUpdate();
    }
  };

  const sendDirectMessage = async () => {
    if (!modalMessage.trim() || !review.business_id || !review.user_id) return;
    setIsSendingMessage(true);
    try {
      const result = await sendReviewDirectMessage({
        businessId: review.business_id,
        userId: review.user_id,
        content: modalMessage.trim(),
      });
      if (!result.ok) {
        throw new Error(result.error || 'Failed to send message');
      }
      showToast('Message sent', 'success', 2500);
      setShowMessageModal(false);
      setModalMessage('');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send message';
      showToast(message, 'error', 3500);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const isAnonymousReview = !review.user_id;
  const reportButtonDisabled =
    isOwner || flagging || isFlagged || isTransientReviewId || checkingFlagStatus;

  const handleOpenFlagModal = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    if (reportButtonDisabled) return;

    if (!user) {
      showToast('Please log in to report reviews.', 'error');
      return;
    }

    setShowFlagModal(true);
  };

  const submitFlag = async (reason: FlagReason, details: string) => {
    if (!user || reportButtonDisabled) return;

    setFlagging(true);
    try {
      const result = await submitReviewFlagRequest({
        reviewId: review.id,
        reason,
        details,
      });
      if (result.ok) {
        setShowFlagModal(false);
        showToast('Review reported. Thank you for your feedback.', 'success');
        return;
      }
      if (result.alreadyFlagged) {
        setShowFlagModal(false);
      }
      showToast(result.error || 'Failed to report review', 'error');
    } catch (error) {
      console.error('Error reporting review:', error);
      showToast('Failed to report review', 'error');
    } finally {
      setFlagging(false);
    }
  };

  return (
    <m.div
      whileHover={isDesktop ? undefined : { scale: 1.01, x: 5 }}
      className={`relative bg-gradient-to-br from-off-white via-off-white to-off-white/95 backdrop-blur-sm rounded-lg p-6 border-none ${
        isDesktop ? '' : 'transition-all duration-300 group hover:border-white/80 hover:-translate-y-1'
      }`}
    >
      <ReviewHeader
        review={review}
        userBadges={userBadges}
        rating={review.rating}
        isDesktop={isDesktop}
        isOwner={isOwner}
        isAnonymous={isAnonymousReview}
        onEdit={handleEdit}
        onDelete={handleDelete}
        formatDate={formatReviewRelativeDate}
      />

      <div className="flex-1 min-w-0">
        <ReviewContent
          review={review}
          showBusinessInfo={showBusinessInfo}
          isDesktop={isDesktop}
        />

        <ReviewActions
          isDesktop={isDesktop}
          isOwner={isOwner}
          isOwnerView={isOwnerView}
          isLiked={isLiked}
          helpfulCount={helpfulCount}
          loadingHelpful={loadingHelpful}
          onLike={handleLike}
          user={user}
          showReplyForm={showReplyForm}
          onToggleReplyForm={() => setShowReplyForm(!showReplyForm)}
          replyCount={replies.length}
          onOpenMessageModal={() => setShowMessageModal(true)}
          isFlagged={isFlagged}
          isFlagging={flagging}
          isCheckingFlag={checkingFlagStatus}
          onOpenFlagModal={handleOpenFlagModal}
          reportButtonDisabled={reportButtonDisabled}
        />

        {/* Reply Form + Replies List */}
        <ReviewReplies
          reviewId={review.id}
          user={user}
          isOwnerView={isOwnerView}
          isDesktop={isDesktop}
          formatDate={formatReviewRelativeDate}
          showReplyForm={showReplyForm}
          onCloseReplyForm={() => setShowReplyForm(false)}
        />
      </div>

      {showFlagModal && (
        <ReviewFlagModal
          onClose={() => setShowFlagModal(false)}
          onSubmit={submitFlag}
          submitting={flagging}
        />
      )}

      {/* Delete Review Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={confirmDelete}
        title="Delete Review"
        message="Are you sure you want to delete this review? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />

      {/* Message Customer Modal */}
      <ReviewMessageModal
        isOpen={showMessageModal}
        onClose={() => setShowMessageModal(false)}
        onSend={sendDirectMessage}
        message={modalMessage}
        onMessageChange={setModalMessage}
        isSending={isSendingMessage}
        customerName={review.user?.display_name || review.user?.username || 'Customer'}
        reviewUserId={review.user_id || ''}
        businessId={review.business_id || ''}
      />
    </m.div>
  );
}

// Memoize to prevent re-renders when parent updates
export default memo(ReviewCard);
