import type { ReviewWithUser } from '../../lib/types/database';

export interface ReviewCardProps {
  review: ReviewWithUser;
  onUpdate?: () => void;
  showBusinessInfo?: boolean;
  isOwnerView?: boolean;
  realtimeHelpfulCount?: number;
}
