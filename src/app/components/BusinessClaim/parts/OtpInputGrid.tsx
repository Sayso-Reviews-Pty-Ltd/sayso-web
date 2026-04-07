"use client";

import React from "react";
import { Clock3, ShieldCheck } from "@/app/lib/icons";

const FONT = "'Urbanist', -apple-system, BlinkMacSystemFont, system-ui, sans-serif";

interface OtpInputGridProps {
  otpCode: string;
  autoModeEnabled: boolean;
  hasExpired: boolean;
  expirySecondsLeft: number;
  inputRef: React.RefObject<HTMLInputElement>;
  onCodeChange: (value: string) => void;
  onCodePaste: (event: React.ClipboardEvent<HTMLInputElement>) => void;
}

function toMmSs(totalSeconds: number): string {
  const seconds = Math.max(0, totalSeconds);
  const mm = Math.floor(seconds / 60);
  const ss = seconds % 60;
  return `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

export function OtpInputGrid({
  otpCode,
  autoModeEnabled,
  hasExpired,
  expirySecondsLeft,
  inputRef,
  onCodeChange,
  onCodePaste,
}: OtpInputGridProps) {
  return (
    <div>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          value={otpCode}
          onChange={(event) => onCodeChange(event.target.value)}
          onPaste={onCodePaste}
          readOnly={autoModeEnabled}
          className="w-full rounded-[10px] border border-charcoal/20 bg-white px-4 py-3 text-center text-lg tracking-[0.35em] text-charcoal focus:outline-none focus:border-sage/40 focus:ring-2 focus:ring-sage/15"
          placeholder={autoModeEnabled ? "" : "000000"}
          aria-label="Enter 6-digit OTP"
          style={{ fontFamily: FONT }}
        />
      </div>

      {autoModeEnabled ? (
        <div className="mt-2 flex items-center justify-between text-sm">
          <span
            className="inline-flex items-center gap-1 text-charcoal/65"
            style={{ fontFamily: FONT }}
          >
            <Clock3 className="w-3.5 h-3.5" />
            Auto-verifying now...
          </span>
          <span
            className="inline-flex items-center gap-1 text-sage/90"
            style={{ fontFamily: FONT }}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Secure verify
          </span>
        </div>
      ) : (
        <div className="mt-2 flex items-center justify-between text-sm">
          <span
            className={`inline-flex items-center gap-1 ${hasExpired ? "text-coral" : "text-charcoal/65"}`}
            style={{ fontFamily: FONT }}
          >
            <Clock3 className="w-3.5 h-3.5" />
            {hasExpired ? "Code expired" : `Expires in ${toMmSs(expirySecondsLeft)}`}
          </span>
          <span
            className="inline-flex items-center gap-1 text-sage/90"
            style={{ fontFamily: FONT }}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Secure verify
          </span>
        </div>
      )}
    </div>
  );
}
