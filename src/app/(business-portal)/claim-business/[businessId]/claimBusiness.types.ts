import type { PhoneOtpSessionState } from "../../../components/BusinessClaim/PhoneOtpModal";
import type { RefObject } from "react";

export interface BusinessData {
  id: string;
  name: string;
  category: string;
  location: string;
  phone?: string;
  email?: string;
  website?: string;
}

export type ClaimFormData = {
  role: "owner" | "manager";
  phone: string;
  email: string;
  note: string;
  cipc_registration_number: string;
  cipc_company_name: string;
};

export type ClaimSubmitResponse = {
  success?: boolean;
  status?: string;
  method_attempted?: string | null;
  claim_id?: string;
  message?: string;
  display_status?: string;
  code?: string;
  error?: string;
};

export type OtpSendResponse = {
  ok?: boolean;
  status?: string;
  autoVerified?: boolean;
  maskedPhone?: string | null;
  expiresAt?: string | null;
  expiresInSeconds?: number;
  resendCooldownSeconds?: number;
  message?: string;
  code?: string;
  error?: string;
};

export type ClaimPageState = {
  business: BusinessData | null;
  loading: boolean;
  notFound: boolean;
  authLoading: boolean;
  isSubmitting: boolean;
  isSendingOtp: boolean;
  formError: string | null;
  claimStateMessage: string | null;
  otpSession: PhoneOtpSessionState | null;
  otpModalOpen: boolean;
  formData: ClaimFormData;
  hasValidContact: string;
  errorRef: RefObject<HTMLDivElement | null>;
};
