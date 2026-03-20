import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import type { FlagReason } from "./ReviewFlagModal";

dayjs.extend(relativeTime);

export function formatReviewRelativeDate(dateString: string): string {
  if (!dateString) return "Recently";

  try {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) {
      console.warn("Invalid date string:", dateString);
      return "Recently";
    }
    return dayjs(date).fromNow();
  } catch (error) {
    console.warn("Error formatting date:", dateString, error);
    return "Recently";
  }
}

export async function sendReviewDirectMessage(params: {
  businessId: string;
  userId: string;
  content: string;
}): Promise<{ ok: boolean; error?: string }> {
  const { businessId, userId, content } = params;
  const response = await fetch("/api/conversations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      business_id: businessId,
      user_id: userId,
    }),
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}));
    return {
      ok: false,
      error:
        typeof errorPayload?.error === "string"
          ? errorPayload.error
          : "Failed to start conversation",
    };
  }

  const data = await response.json();
  const conversationId = data?.data?.id;
  if (conversationId) {
    const messageResponse = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversation_id: conversationId, content }),
    });
    if (!messageResponse.ok) {
      const messagePayload = await messageResponse.json().catch(() => ({}));
      return {
        ok: false,
        error:
          typeof messagePayload?.error === "string"
            ? messagePayload.error
            : "Failed to send message",
      };
    }
  }

  return { ok: true };
}

export async function submitReviewFlagRequest(params: {
  reviewId: string;
  reason: FlagReason;
  details: string;
}): Promise<{ ok: boolean; error?: string; alreadyFlagged?: boolean }> {
  const response = await fetch(`/api/reviews/${params.reviewId}/flag`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      reason: params.reason,
      details: params.details.trim() || undefined,
    }),
  });

  if (response.ok) {
    return { ok: true };
  }

  const payload = await response.json().catch(() => ({}));
  const errorMessage =
    typeof payload?.error === "string" ? payload.error : "Failed to report review";

  return {
    ok: false,
    error: errorMessage,
    alreadyFlagged:
      response.status === 400 &&
      errorMessage.toLowerCase().includes("already flagged"),
  };
}
