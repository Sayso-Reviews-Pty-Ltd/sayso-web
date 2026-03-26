"use client";

import { Dispatch, SetStateAction, RefObject } from "react";
import { PhoneOtpSessionState } from "../PhoneOtpModal";

type OtpApiSuccess = {
  ok?: boolean;
  code?: string;
  status?: string;
  message?: string;
  autoVerified?: boolean;
  maskedPhone?: string | null;
  expiresAt?: string | null;
  expiresInSeconds?: number;
  resendCooldownSeconds?: number;
};

type OtpApiError = {
  ok?: boolean;
  error?: string;
  code?: string;
  details?: Record<string, unknown>;
};

const VERIFY_ERROR_MESSAGES: Record<string, string> = {
  OTP_CODE_INVALID_FORMAT: "Enter a valid 6-digit code.",
  OTP_NOT_FOUND_OR_EXPIRED: "Code expired. Request a new OTP.",
  OTP_TOO_MANY_ATTEMPTS: "Too many attempts. Request a new OTP.",
  OTP_INVALID: "That code is invalid. Try again.",
  FORBIDDEN: "You can only verify your own claim.",
  CLAIM_NOT_FOUND: "Claim not found. Please restart the claim flow.",
};

const SEND_ERROR_MESSAGES: Record<string, string> = {
  OTP_SEND_RATE_LIMITED: "Too many OTP requests. Try again later.",
  PHONE_VERIFICATION_UNAVAILABLE: "Phone verification is unavailable for this business.",
};

function getErrorText(
  payload: OtpApiError | null,
  fallback: string,
  source: "verify" | "send"
): string {
  const code = payload?.code ?? "";
  if (source === "verify" && VERIFY_ERROR_MESSAGES[code]) {
    return VERIFY_ERROR_MESSAGES[code];
  }
  if (source === "send" && SEND_ERROR_MESSAGES[code]) {
    return SEND_ERROR_MESSAGES[code];
  }
  if (typeof payload?.error === "string" && payload.error.trim()) {
    return payload.error;
  }
  return fallback;
}

interface UseOtpHandlersParams {
  session: PhoneOtpSessionState | null;
  otpCode: string;
  canVerify: boolean;
  canResend: boolean;
  inputRef: RefObject<HTMLInputElement>;
  setInlineError: Dispatch<SetStateAction<string | null>>;
  setIsVerifying: Dispatch<SetStateAction<boolean>>;
  setIsResending: Dispatch<SetStateAction<boolean>>;
  setAutoSuccess: Dispatch<SetStateAction<boolean>>;
  setOtpCode: Dispatch<SetStateAction<string>>;
  setResendAvailableAtMs: Dispatch<SetStateAction<number>>;
  setNowMs: Dispatch<SetStateAction<number>>;
  onVerified: (message: string) => void;
  onClose: () => void;
  onSessionUpdate: (next: PhoneOtpSessionState) => void;
}

export function useOtpHandlers({
  session,
  otpCode,
  canVerify,
  canResend,
  inputRef,
  setInlineError,
  setIsVerifying,
  setIsResending,
  setAutoSuccess,
  setOtpCode,
  setResendAvailableAtMs,
  setNowMs,
  onVerified,
  onClose,
  onSessionUpdate,
}: UseOtpHandlersParams) {
  const handleVerify = async (autoFlow = false) => {
    if (!session?.claimId) return;
    if (!autoFlow && !canVerify) return;

    setIsVerifying(true);
    setInlineError(null);
    try {
      const response = await fetch("/api/verification/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          claimId: session.claimId,
          code: otpCode,
        }),
      });

      let payload: OtpApiSuccess | OtpApiError | null = null;
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }

      if (!response.ok || payload?.ok === false) {
        setInlineError(
          getErrorText(payload as OtpApiError, "Verification failed. Please try again.", "verify")
        );
        return;
      }

      if ((payload as OtpApiSuccess)?.status === "under_review") {
        const successMessage =
          (payload as OtpApiSuccess)?.message ??
          "Phone verified successfully. Your claim is now under review.";

        if (autoFlow) {
          setAutoSuccess(true);
          window.setTimeout(() => {
            onVerified(successMessage);
            onClose();
          }, 950);
          return;
        }

        onVerified(successMessage);
        onClose();
      }
    } catch (error) {
      console.error("[PhoneOtpModal] verify error:", error);
      setInlineError("Verification failed. Please check your connection and try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!session?.claimId || !canResend) return;

    setIsResending(true);
    setInlineError(null);
    try {
      const response = await fetch("/api/verification/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          claimId: session.claimId,
        }),
      });

      let payload: OtpApiSuccess | OtpApiError | null = null;
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }

      if (!response.ok || payload?.ok === false) {
        setInlineError(
          getErrorText(payload as OtpApiError, "Could not resend OTP. Please try again.", "send")
        );
        return;
      }

      if ((payload as OtpApiSuccess)?.autoVerified && (payload as OtpApiSuccess)?.status === "under_review") {
        onVerified(
          (payload as OtpApiSuccess)?.message ??
            "Phone verified successfully. Your claim is now under review."
        );
        onClose();
        return;
      }

      const nextCooldown = Number((payload as OtpApiSuccess)?.resendCooldownSeconds ?? 30);
      const explicitExpiresAt = (payload as OtpApiSuccess)?.expiresAt ?? null;
      const expiresInSeconds = Number((payload as OtpApiSuccess)?.expiresInSeconds ?? 0);
      const nextExpiresAt =
        explicitExpiresAt ||
        (expiresInSeconds > 0
          ? new Date(Date.now() + expiresInSeconds * 1000).toISOString()
          : session.expiresAt);

      onSessionUpdate({
        ...session,
        maskedPhone: (payload as OtpApiSuccess)?.maskedPhone ?? session.maskedPhone ?? null,
        expiresAt: nextExpiresAt ?? session.expiresAt,
        resendCooldownSeconds: nextCooldown,
      });

      setResendAvailableAtMs(Date.now() + Math.max(0, nextCooldown) * 1000);
      setOtpCode("");
      setInlineError(null);
      setNowMs(Date.now());
      window.setTimeout(() => inputRef.current?.focus(), 60);
    } catch (error) {
      console.error("[PhoneOtpModal] resend error:", error);
      setInlineError("Could not resend OTP. Please check your connection and try again.");
    } finally {
      setIsResending(false);
    }
  };

  return { handleVerify, handleResend };
}
