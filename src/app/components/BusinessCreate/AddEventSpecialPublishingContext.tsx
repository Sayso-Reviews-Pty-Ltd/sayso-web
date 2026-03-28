"use client";

import Link from "next/link";
import { CalendarDays, Sparkles, Store } from "@/app/lib/icons";
import {
  inputClassName,
  sectionClassName,
  ICON_CHIP_CLASS,
  SMALL_ICON_CHIP_CLASS,
} from "./addEventSpecialForm.constants";
import type { ContentType, FormState, OwnedBusinessOption } from "./addEventSpecialForm.types";

interface Props {
  type: ContentType;
  isEventForm: boolean;
  isSpecialForm: boolean;
  isLoadingBusinesses: boolean;
  businesses: OwnedBusinessOption[];
  emptyBusinessesCopy: string;
  formData: FormState;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  setFieldValue: (field: keyof FormState, value: string) => void;
  handleBlur: (field: keyof FormState) => void;
}

export default function AddEventSpecialPublishingContext({
  type,
  isEventForm,
  isSpecialForm,
  isLoadingBusinesses,
  businesses,
  emptyBusinessesCopy,
  formData,
  errors,
  touched,
  setFieldValue,
  handleBlur,
}: Props) {
  return (
    <div className={`${sectionClassName} animate-fade-in-up animate-delay-100`}>
      <div className="relative z-10">
        <h3 className="font-urbanist text-base font-semibold text-charcoal mb-6 flex items-center gap-3">
          <span className={ICON_CHIP_CLASS}>
            <Store className="w-5 h-5" />
          </span>
          Publishing Context
        </h3>

        {isLoadingBusinesses ? (
          <div className="animate-pulse space-y-3">
            <div className="h-4 w-32 rounded-md bg-charcoal/8" />
            <div className="h-12 w-full rounded-full bg-charcoal/6" />
          </div>
        ) : businesses.length === 0 ? (
          <div className="rounded-[12px] border border-coral/20 bg-coral/5 px-4 py-4">
            <p className="text-sm sm:text-base text-charcoal/80">{emptyBusinessesCopy}</p>
            {isSpecialForm ? (
              <Link
                href="/add-business"
                className="inline-flex mt-4 rounded-full bg-card-bg px-5 py-2.5 text-sm font-semibold text-white hover:bg-card-bg/90 transition-colors duration-200"
              >
                Add New Business
              </Link>
            ) : (
              <p className="mt-3 text-xs text-charcoal/70">
                This event will be marked as community-hosted.
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-charcoal mb-2">
                Business{" "}
                {isSpecialForm ? (
                  <span className="text-coral">*</span>
                ) : (
                  <span className="text-charcoal/50">(optional)</span>
                )}
              </label>
              <select
                value={formData.businessId}
                onChange={(e) => setFieldValue("businessId", e.target.value)}
                onBlur={() => handleBlur("businessId")}
                className={`${inputClassName} pr-10`}
              >
                {isEventForm ? (
                  <option value="">Community-hosted event (no business)</option>
                ) : (
                  <option value="">Select a business</option>
                )}
                {businesses.map((business) => (
                  <option key={business.id} value={business.id}>
                    {business.name}
                  </option>
                ))}
              </select>
              {touched.businessId && errors.businessId ? (
                <p className="mt-2 text-sm text-coral font-medium">{errors.businessId}</p>
              ) : null}
              {!errors.businessId && isEventForm ? (
                <p className="mt-2 text-xs text-charcoal/65">
                  {formData.businessId
                    ? "This event will be shown as business-linked."
                    : "This event will be shown as community-hosted."}
                </p>
              ) : null}
            </div>
            <div>
              <label className="block text-sm font-semibold text-charcoal mb-2">Listing Type</label>
              <div className="rounded-full border-none bg-white/95 px-4 py-3 sm:py-4 md:py-5 text-sm font-semibold text-charcoal flex items-center gap-2">
                <span className={SMALL_ICON_CHIP_CLASS}>
                  {type === "event" ? (
                    <CalendarDays className="w-3.5 h-3.5" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                </span>
                <span>{type === "event" ? "Event" : "Special"}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-charcoal mb-2">
                Icon keyword (optional)
              </label>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) => setFieldValue("icon", e.target.value)}
                className={inputClassName}
                placeholder="calendar, music, sparkles"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
