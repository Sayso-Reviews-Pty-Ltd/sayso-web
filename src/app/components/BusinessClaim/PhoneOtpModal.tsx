"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { X } from "@/app/lib/icons";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/app/components/ui/dialog";
import { OtpInputGrid } from "./parts/OtpInputGrid";
import { OtpResendSection } from "./parts/OtpResendSection";
import { useOtpHandlers } from "./hooks/useOtpHandlers";

const FONT = "'Urbanist', -apple-system, BlinkMacSystemFont, system-ui, sans-serif";

export interface PhoneOtpSessionState {
  claimId: string;
  maskedPhone: string | null;
  expiresAt: string | null;
  resendCooldownSeconds: number;
  autoMode?: boolean;
}

interface PhoneOtpModalProps {
  open: boolean;
  session: PhoneOtpSessionState | null;
  onClose: () => void;
  onVerified: (message: string) => void;
  onSessionUpdate: (next: PhoneOtpSessionState) => void;
}

function generateVisualOtpSeed(): string {
  let value = "";
  for (let i = 0; i < 6; i += 1) {
    value += Math.floor(Math.random() * 10).toString();
  }
  return value;
}

export default function PhoneOtpModal({
  open,
  session,
  onClose,
  onVerified,
  onSessionUpdate,
}: PhoneOtpModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [otpCode, setOtpCode] = useState("");
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [nowMs, setNowMs] = useState(Date.now());
  const [resendAvailableAtMs, setResendAvailableAtMs] = useState(0);
  const [autoSuccess, setAutoSuccess] = useState(false);
  const hasStartedAutoVerifyRef = useRef(false);

  // TEMPORARY: Auto-verification mode until Twilio integration.
  const autoModeEnabled = Boolean(session?.autoMode) && process.env.NODE_ENV !== "production";

  const expiresAtMs = useMemo(() => {
    if (!session?.expiresAt) return 0;
    const parsed = new Date(session.expiresAt).getTime();
    return Number.isFinite(parsed) ? parsed : 0;
  }, [session?.expiresAt]);

  const expirySecondsLeft =
    expiresAtMs > 0 ? Math.max(0, Math.ceil((expiresAtMs - nowMs) / 1000)) : 0;
  const resendSecondsLeft =
    resendAvailableAtMs > 0 ? Math.max(0, Math.ceil((resendAvailableAtMs - nowMs) / 1000)) : 0;

  const hasExpired = expirySecondsLeft <= 0;
  const canVerify = otpCode.length === 6 && !isVerifying && !hasExpired && !autoModeEnabled;
  const canResend =
    Boolean(session?.claimId) && !isResending && resendSecondsLeft <= 0 && !autoModeEnabled;

  const { handleVerify, handleResend } = useOtpHandlers({
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
  });

  useEffect(() => {
    if (!open || !session) return;
    setOtpCode(autoModeEnabled ? generateVisualOtpSeed() : "");
    setInlineError(null);
    setIsVerifying(false);
    setIsResending(false);
    setAutoSuccess(false);
    hasStartedAutoVerifyRef.current = false;
    setNowMs(Date.now());
    setResendAvailableAtMs(Date.now() + Math.max(0, session.resendCooldownSeconds) * 1000);

    const focusId = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 80);

    return () => {
      window.clearTimeout(focusId);
    };
  }, [open, session?.claimId, session?.resendCooldownSeconds, autoModeEnabled]);

  useEffect(() => {
    if (!open) return;
    const tick = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => {
      window.clearInterval(tick);
    };
  }, [open]);

  useEffect(() => {
    if (!open || !session?.claimId || !autoModeEnabled) return;
    if (hasStartedAutoVerifyRef.current) return;
    hasStartedAutoVerifyRef.current = true;

    const timeoutId = window.setTimeout(() => {
      void handleVerify(true);
    }, 140);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [open, session?.claimId, autoModeEnabled]);

  const handleCodeChange = (value: string) => {
    const numericValue = value.replace(/\D/g, "").slice(0, 6);
    setInlineError(null);
    setOtpCode(numericValue);
  };

  const handleCodePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    event.preventDefault();
    setInlineError(null);
    setOtpCode(pasted);
  };

  return (
    <Dialog
      open={open && Boolean(session)}
      onOpenChange={(isOpen) => {
        if (!isOpen && !isVerifying) onClose();
      }}
    >
      <DialogContent className="max-w-md p-0 gap-0">
        <DialogTitle className="sr-only">Verify Phone Number</DialogTitle>
        <DialogDescription className="sr-only">Enter the OTP sent to your phone</DialogDescription>
        <div className="w-full rounded-[14px] border border-sage/20 bg-off-white shadow-[0_24px_80px_rgba(0,0,0,0.24)] overflow-hidden">
          <div className="flex items-center justify-between border-b border-charcoal/10 px-4 py-3">
            <h2
              id="otp-modal-title"
              className="text-base font-semibold text-charcoal"
              style={{ fontFamily: FONT }}
            >
              Verify Phone OTP
            </h2>
            <button
              type="button"
              onClick={onClose}
              disabled={isVerifying || isResending}
              className="w-8 h-8 rounded-full flex items-center justify-center text-charcoal/60 hover:text-charcoal hover:bg-charcoal/5 transition-colors disabled:opacity-50"
              aria-label="Close OTP dialog"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="px-4 py-4 sm:px-5 sm:py-5">
            <p className="text-sm text-charcoal/70 mb-3" style={{ fontFamily: FONT }}>
              {autoModeEnabled ? (
                <>
                  Finalizing phone verification for{" "}
                  <span className="font-semibold text-charcoal">
                    {session?.maskedPhone || "the business phone"}
                  </span>
                  .
                </>
              ) : (
                <>
                  Enter the 6-digit code sent to{" "}
                  <span className="font-semibold text-charcoal">
                    {session?.maskedPhone || "the business phone"}
                  </span>
                  .
                </>
              )}
            </p>

            <OtpInputGrid
              otpCode={otpCode}
              autoModeEnabled={autoModeEnabled}
              hasExpired={hasExpired}
              expirySecondsLeft={expirySecondsLeft}
              inputRef={inputRef}
              onCodeChange={handleCodeChange}
              onCodePaste={handleCodePaste}
            />

            <OtpResendSection
              inlineError={inlineError}
              autoModeEnabled={autoModeEnabled}
              hasExpired={hasExpired}
              autoSuccess={autoSuccess}
              isVerifying={isVerifying}
              isResending={isResending}
              canVerify={canVerify}
              canResend={canResend}
              resendSecondsLeft={resendSecondsLeft}
              onVerify={() => void handleVerify(autoModeEnabled)}
              onResend={handleResend}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
