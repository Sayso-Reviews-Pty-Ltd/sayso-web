"use client";

import React from "react";
import { AlertCircle, Loader2 } from "@/app/lib/icons";

const FONT = "'Urbanist', -apple-system, BlinkMacSystemFont, system-ui, sans-serif";

function toMmSs(totalSeconds: number): string {
  const seconds = Math.max(0, totalSeconds);
  const mm = Math.floor(seconds / 60);
  const ss = seconds % 60;
  return `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

interface OtpResendSectionProps {
  inlineError: string | null;
  autoModeEnabled: boolean;
  hasExpired: boolean;
  autoSuccess: boolean;
  isVerifying: boolean;
  isResending: boolean;
  canVerify: boolean;
  canResend: boolean;
  resendSecondsLeft: number;
  onVerify: () => void;
  onResend: () => void;
}

export function OtpResendSection({
  inlineError,
  autoModeEnabled,
  hasExpired,
  autoSuccess,
  isVerifying,
  isResending,
  canVerify,
  canResend,
  resendSecondsLeft,
  onVerify,
  onResend,
}: OtpResendSectionProps) {
  return (
    <div>
      {inlineError ? (
        <div
          className="mt-3 rounded-[10px] border border-coral/25 bg-coral/10 px-3 py-2 text-sm text-coral flex items-start gap-2"
          style={{ fontFamily: FONT }}
          role="alert"
        >
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{inlineError}</span>
        </div>
      ) : !autoModeEnabled && hasExpired ? (
        <div
          className="mt-3 rounded-[10px] border border-coral/25 bg-coral/10 px-3 py-2 text-sm text-coral"
          style={{ fontFamily: FONT }}
          role="alert"
        >
          Code expired. Resend OTP to continue.
        </div>
      ) : autoSuccess ? (
        <div
          className="mt-3 rounded-[10px] border border-sage/25 bg-card-bg/10 px-3 py-2 text-sm text-sage"
          style={{ fontFamily: FONT }}
          role="status"
        >
          Phone verified successfully. Moving your claim to under review...
        </div>
      ) : null}

      <div className="mt-4 flex flex-col gap-3">
        <button
          type="button"
          onClick={onVerify}
          disabled={
            autoModeEnabled
              ? isVerifying || autoSuccess
              : !canVerify
          }
          className="w-full rounded-full bg-gradient-to-br from-sage to-sage/90 text-white px-4 py-2.5 text-sm font-semibold hover:from-sage/90 hover:to-sage/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          style={{ fontFamily: FONT }}
        >
          {autoModeEnabled ? (
            <span className="inline-flex items-center gap-2">
              {(isVerifying || (!inlineError && !autoSuccess)) && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              {autoSuccess
                ? "Verified"
                : inlineError
                  ? "Retry verification"
                  : "Verifying..."}
            </span>
          ) : isVerifying ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Verifying...
            </span>
          ) : (
            "Verify"
          )}
        </button>

        {!autoModeEnabled && (
          <button
            type="button"
            onClick={onResend}
            disabled={!canResend}
            className="text-sm font-semibold text-sage hover:text-sage/80 disabled:text-charcoal/40 disabled:cursor-not-allowed transition-colors"
            style={{ fontFamily: FONT }}
          >
            {isResending
              ? "Resending..."
              : resendSecondsLeft > 0
                ? `Resend OTP in ${toMmSs(resendSecondsLeft)}`
                : "Resend OTP"}
          </button>
        )}
      </div>
    </div>
  );
}
