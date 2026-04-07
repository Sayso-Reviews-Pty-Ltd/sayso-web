"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { X } from "@/app/lib/icons";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/app/components/ui/dialog";
import { ClaimForm } from "./parts/ClaimForm";

const ERROR_CODE_MESSAGES: Record<string, string> = {
  NOT_AUTHENTICATED: "Please log in to claim this business.",
  MISSING_FIELDS: "Please fill in all required details.",
  INVALID_EMAIL: "Please enter a valid email address.",
  INVALID_PHONE: "Please enter a valid phone number.",
  EMAIL_DOMAIN_MISMATCH:
    "This email doesn't match the business website domain. Use an official business email.",
  DUPLICATE_CLAIM: "You already have a claim in progress for this business.",
  ALREADY_OWNER: "You already own this business.",
  BUSINESS_NOT_FOUND: "We couldn't find that business. Please try again.",
  RLS_BLOCKED: "We couldn't process your claim right now. Please try again.",
  DB_ERROR: "We couldn't process your claim right now. Please try again.",
  SERVER_ERROR: "Something went wrong on our side. Please try again.",
};

function getErrorMessage(result: { message?: string; code?: string; error?: string }): string {
  if (result.message) return result.message;
  if (result.code && ERROR_CODE_MESSAGES[result.code]) {
    return ERROR_CODE_MESSAGES[result.code];
  }
  if (result.error) return result.error;
  return "An error occurred. Please try again.";
}

interface ClaimModalProps {
  business: {
    id: string;
    name: string;
    category: string;
    location: string;
    phone?: string;
    email?: string;
    website?: string;
  };
  onClose: () => void;
  onSuccess: () => void;
}

const MODAL_FONT = "'Urbanist', -apple-system, BlinkMacSystemFont, system-ui, sans-serif";

export function ClaimModal({ business, onClose, onSuccess }: ClaimModalProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    role: "owner" as "owner" | "manager",
    phone: business.phone || "",
    email: business.email || user?.email || "",
    note: "",
    cipc_registration_number: "",
    cipc_company_name: "",
  });

  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormError(null);
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  useEffect(() => {
    if (formError && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      errorRef.current.focus();
    }
  }, [formError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setFormError(null);

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

      let result: any;
      try {
        result = await response.json();
      } catch {
        setFormError("Something went wrong. Please try again.");
        return;
      }

      if (!response.ok || result.success === false) {
        const errorMessage = getErrorMessage(result);
        setFormError(errorMessage);
        return;
      }

      if (result.status === "verified") {
        showToast(
          result.message || "Business verified. You can now manage your listing.",
          "success",
          5000
        );
        onSuccess();
        onClose();
        router.push(`/my-businesses/${business.id}`);
        return;
      }

      showToast(
        result.message ||
          result.display_status ||
          "Claim submitted. Complete the requested verification step.",
        "success",
        5000
      );
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error submitting claim:", error);
      setFormError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !isSubmitting) onClose();
      }}
    >
      <DialogContent
        className="max-w-2xl p-0 gap-0 max-h-[90vh] overflow-y-auto"
        onEscapeKeyDown={(e) => {
          if (isSubmitting) e.preventDefault();
        }}
        onInteractOutside={(e) => {
          if (isSubmitting) e.preventDefault();
        }}
      >
        <DialogTitle className="sr-only">Claim Business</DialogTitle>
        <DialogDescription className="sr-only">
          Submit a claim for {business.name}
        </DialogDescription>
        <div className="bg-card-bg rounded-[16px] overflow-hidden">
          <div className="flex max-h-[92dvh] sm:max-h-[90dvh] min-h-0 flex-col">
            <div className="shrink-0 border-b border-white/20 px-5 py-4 sm:px-6 sm:py-5 flex items-center justify-between">
              <h2
                id="claim-modal-title"
                className="text-lg sm:text-xl font-bold text-white"
                style={{ fontFamily: MODAL_FONT }}
              >
                Claim Business
              </h2>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                aria-label="Close"
                disabled={isSubmitting}
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            <ClaimForm
              business={business}
              formData={formData}
              formError={formError}
              isSubmitting={isSubmitting}
              errorRef={errorRef}
              onUpdateFormData={updateFormData}
              onSubmit={handleSubmit}
              onClose={onClose}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
