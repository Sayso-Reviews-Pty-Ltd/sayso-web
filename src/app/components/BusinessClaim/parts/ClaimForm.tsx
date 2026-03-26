"use client";

import React from "react";
import { UserCheck, Mail, Phone, FileText, Building2, AlertCircle } from "@/app/lib/icons";
import { Loader } from "../../Loader/Loader";

const MODAL_FONT = "'Urbanist', -apple-system, BlinkMacSystemFont, system-ui, sans-serif";

interface ClaimFormData {
  role: "owner" | "manager";
  phone: string;
  email: string;
  note: string;
  cipc_registration_number: string;
  cipc_company_name: string;
}

interface ClaimFormProps {
  business: {
    id: string;
    name: string;
    category: string;
    location: string;
    phone?: string;
    email?: string;
    website?: string;
  };
  formData: ClaimFormData;
  formError: string | null;
  isSubmitting: boolean;
  errorRef: React.RefObject<HTMLDivElement>;
  onUpdateFormData: (updates: Partial<ClaimFormData>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export function ClaimForm({
  business,
  formData,
  formError,
  isSubmitting,
  errorRef,
  onUpdateFormData,
  onSubmit,
  onClose,
}: ClaimFormProps) {
  return (
    <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 py-4 sm:px-6 sm:py-5">
        <div className="space-y-5 sm:space-y-6">
          <div className="bg-white/20 rounded-[12px] p-4 border border-white/30">
            <h3 className="text-sm font-semibold text-white mb-2" style={{ fontFamily: MODAL_FONT }}>
              {business.name}
            </h3>
            <p className="text-sm text-white/90" style={{ fontFamily: MODAL_FONT }}>
              {business.category} • {business.location}
            </p>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-white flex items-center gap-2" style={{ fontFamily: MODAL_FONT }}>
              <UserCheck className="w-4 h-4" />
              Your Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onUpdateFormData({ role: "owner" })}
                className={`px-4 py-3 rounded-lg border-2 transition-all ${
                  formData.role === "owner"
                    ? "border-white bg-white/20 text-white"
                    : "border-white/30 bg-white/10 text-white hover:border-white/50"
                }`}
                style={{ fontFamily: MODAL_FONT }}
              >
                Owner
              </button>
              <button
                type="button"
                onClick={() => onUpdateFormData({ role: "manager" })}
                className={`px-4 py-3 rounded-lg border-2 transition-all ${
                  formData.role === "manager"
                    ? "border-white bg-white/20 text-white"
                    : "border-white/30 bg-white/10 text-white hover:border-white/50"
                }`}
                style={{ fontFamily: MODAL_FONT }}
              >
                Manager
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="claim-email" className="text-sm font-semibold text-white flex items-center gap-2 mb-2" style={{ fontFamily: MODAL_FONT }}>
                <Mail className="w-4 h-4" />
                Business Email (optional)
              </label>
              <input
                id="claim-email"
                type="email"
                value={formData.email}
                onChange={(e) => onUpdateFormData({ email: e.target.value })}
                placeholder="info@business.co.za"
                className="w-full px-4 py-3 rounded-lg border border-white/30 bg-white/10 text-white placeholder:text-white/60 focus:outline-none focus:border-white/50 transition-colors"
                style={{ fontFamily: MODAL_FONT }}
              />
              <p className="text-xs text-white/70 mt-1" style={{ fontFamily: MODAL_FONT }}>
                Match website domain to auto-verify
              </p>
            </div>

            <div>
              <label htmlFor="claim-phone" className="text-sm font-semibold text-white flex items-center gap-2 mb-2" style={{ fontFamily: MODAL_FONT }}>
                <Phone className="w-4 h-4" />
                Phone (optional)
              </label>
              <input
                id="claim-phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => onUpdateFormData({ phone: e.target.value })}
                placeholder="Business phone for OTP"
                className="w-full px-4 py-3 rounded-lg border border-white/30 bg-white/10 text-white placeholder:text-white/60 focus:outline-none focus:border-white/50 transition-colors"
                style={{ fontFamily: MODAL_FONT }}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-white flex items-center gap-2" style={{ fontFamily: MODAL_FONT }}>
                <Building2 className="w-4 h-4" />
                CIPC (optional)
              </label>
              <input
                type="text"
                value={formData.cipc_registration_number}
                onChange={(e) => onUpdateFormData({ cipc_registration_number: e.target.value })}
                placeholder="Company registration number"
                className="w-full px-4 py-3 rounded-lg border border-white/30 bg-white/10 text-white placeholder:text-white/60 focus:outline-none focus:border-white/50 transition-colors"
                style={{ fontFamily: MODAL_FONT }}
              />
              <input
                type="text"
                value={formData.cipc_company_name}
                onChange={(e) => onUpdateFormData({ cipc_company_name: e.target.value })}
                placeholder="Registered company name"
                className="w-full px-4 py-3 rounded-lg border border-white/30 bg-white/10 text-white placeholder:text-white/60 focus:outline-none focus:border-white/50 transition-colors"
                style={{ fontFamily: MODAL_FONT }}
              />
              <p className="text-xs text-white/70" style={{ fontFamily: MODAL_FONT }}>
                For manual CIPC review; no documents required
              </p>
            </div>

            <div>
              <label htmlFor="claim-notes" className="text-sm font-semibold text-white flex items-center gap-2 mb-2" style={{ fontFamily: MODAL_FONT }}>
                <FileText className="w-4 h-4" />
                Additional Notes (Optional)
              </label>
              <textarea
                id="claim-notes"
                value={formData.note}
                onChange={(e) => onUpdateFormData({ note: e.target.value })}
                placeholder="Tell us about your relationship with this business..."
                rows={4}
                className="w-full px-4 py-3 rounded-lg border border-white/30 bg-white/10 text-white placeholder:text-white/60 focus:outline-none focus:border-white/50 transition-colors resize-none"
                style={{ fontFamily: MODAL_FONT }}
              />
            </div>
          </div>

          {formError && (
            <div
              ref={errorRef}
              role="alert"
              tabIndex={-1}
              className="flex items-start gap-3 p-4 rounded-lg bg-coral/20 border border-coral/40 text-white"
              style={{ fontFamily: MODAL_FONT }}
            >
              <AlertCircle className="w-5 h-5 text-coral flex-shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{formError}</p>
            </div>
          )}
        </div>
      </div>

      <div className="shrink-0 border-t border-white/20 bg-card-bg/95 px-4 py-4 sm:px-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-full border-2 border-white/30 text-white hover:bg-white/20 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={isSubmitting}
            style={{ fontFamily: MODAL_FONT }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={
              isSubmitting ||
              !(formData.email?.trim() || formData.phone?.trim() || (formData.cipc_registration_number?.trim() && formData.cipc_company_name?.trim()))
            }
            className="flex-1 px-4 py-3 rounded-full bg-gradient-to-br from-coral to-coral/90 text-white hover:from-coral/90 hover:to-coral/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ fontFamily: MODAL_FONT }}
          >
            {isSubmitting ? (
              <>
                <Loader size="sm" variant="wavy" color="white" />
                Starting claim...
              </>
            ) : (
              "Submit Claim"
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
