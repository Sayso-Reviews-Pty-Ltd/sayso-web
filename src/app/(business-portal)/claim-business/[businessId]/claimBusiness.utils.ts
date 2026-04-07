import type { PhoneOtpSessionState } from "../../../components/BusinessClaim/PhoneOtpModal";
import { ERROR_CODE_MESSAGES, OTP_SEND_ERROR_MESSAGES } from "./claimBusiness.constants";

export function getClaimErrorMessage(result: {
  message?: string;
  code?: string;
  error?: string;
}): string {
  if (result.message) return result.message;
  if (result.code && ERROR_CODE_MESSAGES[result.code]) {
    return ERROR_CODE_MESSAGES[result.code];
  }
  if (result.error) return result.error;
  return "An error occurred. Please try again.";
}

export function getOtpSendErrorMessage(result: { code?: string; error?: string }): string {
  if (result.code && OTP_SEND_ERROR_MESSAGES[result.code]) {
    return OTP_SEND_ERROR_MESSAGES[result.code];
  }
  if (result.error) return result.error;
  return "Unable to send OTP right now. Please try again.";
}

export function buildAutoOtpSession(
  claimId: string,
  maskedPhone: string | null
): PhoneOtpSessionState {
  return {
    claimId,
    maskedPhone,
    expiresAt: null,
    resendCooldownSeconds: 0,
    autoMode: true,
  };
}
