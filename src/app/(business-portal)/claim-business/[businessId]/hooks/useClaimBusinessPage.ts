"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../../../contexts/AuthContext";
import { useToast } from "../../../../contexts/ToastContext";
import { getBrowserSupabase } from "../../../../lib/supabase/client";
import type { PhoneOtpSessionState } from "../../../../components/BusinessClaim/PhoneOtpModal";
import type {
  BusinessData,
  ClaimFormData,
  ClaimSubmitResponse,
  OtpSendResponse,
} from "../claimBusiness.types";
import {
  buildAutoOtpSession,
  getClaimErrorMessage,
  getOtpSendErrorMessage,
} from "../claimBusiness.utils";

const INITIAL_FORM_DATA: ClaimFormData = {
  role: "owner",
  phone: "",
  email: "",
  note: "",
  cipc_registration_number: "",
  cipc_company_name: "",
};

export function useClaimBusinessPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { showToast } = useToast();
  const businessId = params?.businessId as string;

  const [business, setBusiness] = useState<BusinessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [claimStateMessage, setClaimStateMessage] = useState<string | null>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const [otpSession, setOtpSession] = useState<PhoneOtpSessionState | null>(null);
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [formData, setFormData] = useState<ClaimFormData>(INITIAL_FORM_DATA);

  useEffect(() => {
    if (!businessId) return;

    const fetchBusiness = async () => {
      setLoading(true);
      try {
        const supabase = getBrowserSupabase();
        const { data, error } = await supabase
          .from("businesses")
          .select("id, name, primary_subcategory_label, location, phone, email, website")
          .eq("id", businessId)
          .maybeSingle();

        if (error || !data) {
          setNotFound(true);
          return;
        }

        setBusiness({
          id: data.id,
          name: data.name || "Unnamed Business",
          category: data.primary_subcategory_label || "Business",
          location: data.location || "",
          phone: data.phone || undefined,
          email: data.email || undefined,
          website: data.website || undefined,
        });

        setFormData((prev) => ({
          ...prev,
          phone: data.phone || "",
          email: data.email || user?.email || "",
        }));
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    void fetchBusiness();
  }, [businessId, user?.email]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace(`/login?redirect=/claim-business/${businessId}`);
    }
  }, [authLoading, user, router, businessId]);

  useEffect(() => {
    if (formError && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      errorRef.current.focus();
    }
  }, [formError]);

  const updateFormData = (updates: Partial<ClaimFormData>) => {
    setFormError(null);
    setClaimStateMessage(null);
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const triggerPhoneOtpFlow = async (claimId: string): Promise<boolean> => {
    setIsSendingOtp(true);
    setFormError(null);

    try {
      const response = await fetch("/api/verification/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claimId }),
      });

      let payload: OtpSendResponse | null = null;
      try {
        payload = (await response.json()) as OtpSendResponse;
      } catch {
        payload = null;
      }

      if (!response.ok || payload?.ok === false) {
        const message = getOtpSendErrorMessage({
          code: payload?.code,
          error: payload?.error,
        });
        setFormError(message);
        return false;
      }

      if (payload?.autoVerified && payload?.status === "under_review") {
        setOtpSession(buildAutoOtpSession(claimId, payload?.maskedPhone ?? null));
        setOtpModalOpen(true);
        setClaimStateMessage("Completing phone verification...");
        return true;
      }

      const expiresAt =
        payload?.expiresAt ??
        new Date(Date.now() + Number(payload?.expiresInSeconds ?? 600) * 1000).toISOString();
      const resendCooldownSeconds = Number(payload?.resendCooldownSeconds ?? 30);

      setOtpSession({
        claimId,
        maskedPhone: payload?.maskedPhone ?? null,
        expiresAt,
        resendCooldownSeconds,
        autoMode: false,
      });
      setOtpModalOpen(true);
      showToast("OTP sent. Enter the 6-digit code to continue.", "success", 4000);
      return true;
    } catch (error) {
      console.error("Error sending OTP:", error);
      setFormError("Unable to send OTP right now. Please try again.");
      return false;
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (isSubmitting || !business) return;
    setFormError(null);
    setClaimStateMessage(null);

    if (!user) {
      setFormError("Please log in to claim this business.");
      return;
    }

    const hasContact =
      formData.email?.trim() ||
      formData.phone?.trim() ||
      (formData.cipc_registration_number?.trim() && formData.cipc_company_name?.trim());

    if (!hasContact) {
      setFormError("Please provide a business email, phone number, or CIPC details.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/business/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_id: business.id,
          role: formData.role,
          phone: formData.phone?.trim() || undefined,
          email: formData.email?.trim() || undefined,
          note: formData.note?.trim() || undefined,
          cipc_registration_number: formData.cipc_registration_number?.trim() || undefined,
          cipc_company_name: formData.cipc_company_name?.trim() || undefined,
        }),
      });

      let result: ClaimSubmitResponse;
      try {
        result = (await response.json()) as ClaimSubmitResponse;
      } catch {
        setFormError("Something went wrong. Please try again.");
        return;
      }

      if (!response.ok || result.success === false) {
        setFormError(getClaimErrorMessage(result));
        return;
      }

      const claimStatus = String(result.status ?? "").toLowerCase();
      const methodAttempted = String(result.method_attempted ?? "").toLowerCase();
      const claimId = typeof result.claim_id === "string" ? result.claim_id : null;

      if (claimStatus === "verified") {
        showToast(
          result.message || "Business verified. You can now manage your listing.",
          "success",
          5000
        );
        router.push(`/my-businesses/${business.id}`);
        return;
      }

      if (methodAttempted === "phone" && claimId) {
        if (claimStatus === "under_review") {
          setOtpSession(buildAutoOtpSession(claimId, business.phone ?? null));
          setOtpModalOpen(true);
          setClaimStateMessage("Completing phone verification...");
          return;
        }

        const otpStarted = await triggerPhoneOtpFlow(claimId);
        if (!otpStarted) return;

        setClaimStateMessage(
          result.message ||
            "OTP sent successfully. Enter the code to move your claim to under review."
        );
        return;
      }

      if (claimStatus === "under_review") {
        const successMessage = result.message || "Claim submitted. Your claim is now under review.";
        setClaimStateMessage(successMessage);
        showToast(successMessage, "success", 5000);
        router.push("/claim-business");
        return;
      }

      showToast(
        result.message ||
          result.display_status ||
          "Claim submitted. Complete the requested verification step.",
        "success",
        5000
      );
      router.push("/claim-business");
    } catch (error) {
      console.error("Error submitting claim:", error);
      setFormError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasValidContact =
    formData.email?.trim() ||
    formData.phone?.trim() ||
    (formData.cipc_registration_number?.trim() && formData.cipc_company_name?.trim());

  const handleOtpVerified = (message: string) => {
    setClaimStateMessage(message);
    setOtpSession(null);
    setOtpModalOpen(false);
    showToast(message, "success", 5000);
  };

  return {
    business,
    loading,
    notFound,
    authLoading,
    formData,
    isSubmitting,
    isSendingOtp,
    formError,
    claimStateMessage,
    otpSession,
    otpModalOpen,
    errorRef,
    hasValidContact,
    updateFormData,
    handleSubmit,
    setOtpSession,
    setOtpModalOpen,
    handleOtpVerified,
  };
}
