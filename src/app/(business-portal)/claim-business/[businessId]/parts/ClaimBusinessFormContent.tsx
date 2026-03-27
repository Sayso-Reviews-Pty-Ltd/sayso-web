"use client";

import type { FormEvent, RefObject } from "react";
import Link from "next/link";
import {
  Store,
  UserCheck,
  Mail,
  Phone,
  Building2,
  FileText,
  AlertCircle,
  MapPin,
} from "@/app/lib/icons";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/app/components/ui/breadcrumb";
import { Loader } from "../../../../components/Loader";
import { FONT, ICON_CHIP_CLASS, SMALL_ICON_CHIP_CLASS } from "../claimBusiness.constants";
import type { BusinessData, ClaimFormData } from "../claimBusiness.types";
import type { PhoneOtpSessionState } from "../../../../components/BusinessClaim/PhoneOtpModal";

interface ClaimBusinessFormContentProps {
  business: BusinessData;
  formData: ClaimFormData;
  isSubmitting: boolean;
  isSendingOtp: boolean;
  formError: string | null;
  claimStateMessage: string | null;
  otpSession: PhoneOtpSessionState | null;
  otpModalOpen: boolean;
  hasValidContact: string;
  errorRef: RefObject<HTMLDivElement | null>;
  updateFormData: (updates: Partial<ClaimFormData>) => void;
  onSubmit: (event: FormEvent) => void;
  onReopenOtp: () => void;
}

export function ClaimBusinessFormContent({
  business,
  formData,
  isSubmitting,
  isSendingOtp,
  formError,
  claimStateMessage,
  otpSession,
  otpModalOpen,
  hasValidContact,
  errorRef,
  updateFormData,
  onSubmit,
  onReopenOtp,
}: ClaimBusinessFormContentProps) {
  return (
    <div className="min-h-dvh bg-off-white relative">
      <div className="absolute inset-0 bg-gradient-to-br from-sage/10 via-off-white to-coral/5 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(157,171,155,0.15)_0%,_transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(114,47,55,0.08)_0%,_transparent_50%)] pointer-events-none" />

      <main className="mx-auto w-full max-w-[2000px] px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-sage/10 via-off-white to-coral/5 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(157,171,155,0.15)_0%,_transparent_50%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(114,47,55,0.08)_0%,_transparent_50%)] pointer-events-none" />

        <div className="pt-4 sm:pt-6 pb-2 relative z-10">
          <Breadcrumb className="pt-4 sm:pt-6 pb-2">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/claim-business">Claim a Business</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{business.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="max-w-[640px] mx-auto pb-12 relative z-10">
          <div className="py-8 text-center">
            <span className={`${ICON_CHIP_CLASS} w-14 h-14 mx-auto mb-3`}>
              <Store className="w-6 h-6" />
            </span>
            <h1 className="text-xl font-bold text-charcoal mb-1 font-urbanist">Claim Business</h1>
            <p className="text-base text-charcoal/70 font-urbanist">
              Verify your ownership or management role
            </p>
          </div>

          <div className="bg-card-bg rounded-[12px] p-4 mb-6 border border-sage/20">
            <h2 className="text-base font-semibold text-white mb-1 font-urbanist">
              {business.name}
            </h2>
            <div className="flex items-center gap-1.5 text-sm text-white/90 font-urbanist">
              <span>{business.category}</span>
              {business.location && (
                <>
                  <span className="text-white/60">·</span>
                  <MapPin className="w-3.5 h-3.5 text-white/80 flex-shrink-0" />
                  <span>{business.location}</span>
                </>
              )}
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-semibold text-charcoal flex items-center gap-2 font-urbanist">
                <span className={SMALL_ICON_CHIP_CLASS}>
                  <UserCheck className="w-3.5 h-3.5" />
                </span>
                Your Role
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => updateFormData({ role: "owner" })}
                  className={`px-4 py-3 rounded-[10px] border-2 transition-all text-sm font-semibold font-urbanist ${
                    formData.role === "owner"
                      ? "border-sage bg-card-bg/10 text-sage"
                      : "border-charcoal/15 bg-white text-charcoal/70 hover:border-charcoal/30"
                  }`}
                >
                  Owner
                </button>
                <button
                  type="button"
                  onClick={() => updateFormData({ role: "manager" })}
                  className={`px-4 py-3 rounded-[10px] border-2 transition-all text-sm font-semibold font-urbanist ${
                    formData.role === "manager"
                      ? "border-sage bg-card-bg/10 text-sage"
                      : "border-charcoal/15 bg-white text-charcoal/70 hover:border-charcoal/30"
                  }`}
                >
                  Manager
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="claim-email"
                className="text-sm font-semibold text-charcoal flex items-center gap-2 mb-2 font-urbanist"
              >
                <span className={SMALL_ICON_CHIP_CLASS}>
                  <Mail className="w-3.5 h-3.5" />
                </span>
                Business Email (optional)
              </label>
              <input
                id="claim-email"
                type="email"
                value={formData.email}
                onChange={(e) => updateFormData({ email: e.target.value })}
                placeholder="info@business.co.za"
                className="w-full px-4 py-3 rounded-[10px] border border-charcoal/15 bg-white text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:border-sage/50 focus:ring-1 focus:ring-sage/20 transition-colors text-sm font-urbanist"
              />
              <p className="text-sm text-charcoal/50 mt-1.5 font-urbanist">
                Match website domain to auto-verify
              </p>
            </div>

            <div>
              <label
                htmlFor="claim-phone"
                className="text-sm font-semibold text-charcoal flex items-center gap-2 mb-2 font-urbanist"
              >
                <span className={SMALL_ICON_CHIP_CLASS}>
                  <Phone className="w-3.5 h-3.5" />
                </span>
                Phone (optional)
              </label>
              <input
                id="claim-phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => updateFormData({ phone: e.target.value })}
                placeholder="Business phone for OTP"
                className="w-full px-4 py-3 rounded-[10px] border border-charcoal/15 bg-white text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:border-sage/50 focus:ring-1 focus:ring-sage/20 transition-colors text-sm font-urbanist"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-charcoal flex items-center gap-2 font-urbanist">
                <span className={SMALL_ICON_CHIP_CLASS}>
                  <Building2 className="w-3.5 h-3.5" />
                </span>
                CIPC (optional)
              </label>
              <input
                type="text"
                value={formData.cipc_registration_number}
                onChange={(e) => updateFormData({ cipc_registration_number: e.target.value })}
                placeholder="Company registration number"
                className="w-full px-4 py-3 rounded-[10px] border border-charcoal/15 bg-white text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:border-sage/50 focus:ring-1 focus:ring-sage/20 transition-colors text-sm font-urbanist"
              />
              <input
                type="text"
                value={formData.cipc_company_name}
                onChange={(e) => updateFormData({ cipc_company_name: e.target.value })}
                placeholder="Registered company name"
                className="w-full px-4 py-3 rounded-[10px] border border-charcoal/15 bg-white text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:border-sage/50 focus:ring-1 focus:ring-sage/20 transition-colors text-sm font-urbanist"
              />
              <p className="text-sm text-charcoal/50 font-urbanist">
                For manual CIPC review; no documents required
              </p>
            </div>

            <div>
              <label
                htmlFor="claim-notes"
                className="text-sm font-semibold text-charcoal flex items-center gap-2 mb-2 font-urbanist"
              >
                <span className={SMALL_ICON_CHIP_CLASS}>
                  <FileText className="w-3.5 h-3.5" />
                </span>
                Additional Notes (optional)
              </label>
              <textarea
                id="claim-notes"
                value={formData.note}
                onChange={(e) => updateFormData({ note: e.target.value })}
                placeholder="Tell us about your relationship with this business..."
                rows={4}
                className="w-full px-4 py-3 rounded-[10px] border border-charcoal/15 bg-white text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:border-sage/50 focus:ring-1 focus:ring-sage/20 transition-colors resize-none text-sm font-urbanist"
              />
            </div>

            {claimStateMessage && (
              <div
                className="flex items-start gap-3 p-4 rounded-[10px] bg-card-bg/10 border border-sage/25 text-sage font-urbanist"
                role="status"
                aria-live="polite"
              >
                <span className={`${ICON_CHIP_CLASS} h-7 w-7 flex-shrink-0 mt-0.5`}>
                  <Store className="w-4 h-4" />
                </span>
                <div className="space-y-1">
                  <p className="text-sm font-semibold">Claim in progress</p>
                  <p className="text-sm text-sage/90">{claimStateMessage}</p>
                  {otpSession && !otpModalOpen && (
                    <button
                      type="button"
                      onClick={onReopenOtp}
                      className="mt-2 inline-flex items-center gap-2 rounded-full bg-card-bg px-3 py-1.5 text-xs font-semibold text-white hover:bg-card-bg/90 transition-colors font-urbanist"
                    >
                      Continue OTP verification
                    </button>
                  )}
                </div>
              </div>
            )}

            {formError && (
              <div
                ref={errorRef}
                role="alert"
                tabIndex={-1}
                className="flex items-start gap-3 p-4 rounded-[10px] bg-coral/10 border border-coral/30 text-coral font-urbanist"
              >
                <span className={`${ICON_CHIP_CLASS} h-7 w-7 flex-shrink-0 mt-0.5`}>
                  <AlertCircle className="w-4 h-4" />
                </span>
                <p className="text-sm font-medium">{formError}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href="/claim-business"
                className="flex-1 px-4 py-3 rounded-full border-2 border-charcoal/15 text-charcoal text-sm font-semibold hover:bg-charcoal/5 transition-colors text-center font-urbanist"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting || isSendingOtp || !hasValidContact}
                className="flex-1 px-4 py-3 rounded-full bg-gradient-to-br from-coral to-coral/90 text-white text-sm font-semibold hover:from-coral/90 hover:to-coral/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-urbanist"
              >
                {isSubmitting || isSendingOtp ? (
                  <>
                    <Loader size="sm" variant="wavy" color="white" />
                    {isSendingOtp ? "Sending OTP..." : "Starting claim..."}
                  </>
                ) : (
                  "Submit Claim"
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
