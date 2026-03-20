"use client";

import { Link2, MessageCircle } from "@/app/lib/icons";
import {
  fontStyle,
  inputClassName,
  textareaClassName,
  sectionClassName,
  ICON_CHIP_CLASS,
  CTA_SOURCE_OPTIONS,
} from "./addEventSpecialForm.constants";
import type { ContentType, FormState, OwnedBusinessOption } from "./addEventSpecialForm.types";

interface Props {
  type: ContentType;
  isEventForm: boolean;
  businesses: OwnedBusinessOption[];
  formData: FormState;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  setFieldValue: (field: keyof FormState, value: string) => void;
  handleBlur: (field: keyof FormState) => void;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

export default function AddEventSpecialBookingLink({
  type,
  isEventForm,
  businesses,
  formData,
  errors,
  touched,
  setFieldValue,
  handleBlur,
  setErrors,
}: Props) {
  if (!isEventForm && businesses.length === 0) return null;

  return (
    <div className={`${sectionClassName} animate-fade-in-up animate-delay-300`}>
      <div className="relative z-10 space-y-6">
        <h3 className="font-urbanist text-base font-semibold text-charcoal flex items-center gap-3" style={fontStyle}>
          <span className={ICON_CHIP_CLASS}>
            <Link2 className="w-5 h-5" />
          </span>
          Booking / Link (Optional)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-charcoal mb-2" style={fontStyle}>Booking method</label>
            <select
              value={formData.ctaSource}
              onChange={(e) => {
                setFieldValue("ctaSource", e.target.value);
                if (e.target.value !== "whatsapp" && (errors.whatsappNumber || errors.whatsappPrefillTemplate)) {
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next.whatsappNumber;
                    delete next.whatsappPrefillTemplate;
                    return next;
                  });
                }
              }}
              onBlur={() => handleBlur("ctaSource")}
              className={`${inputClassName} pr-10`}
              style={fontStyle}
            >
              <option value="">Select method</option>
              {CTA_SOURCE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-charcoal mb-2" style={fontStyle}>CTA Label (optional)</label>
            <input
              type="text"
              value={formData.ctaLabel}
              onChange={(e) => setFieldValue("ctaLabel", e.target.value)}
              onBlur={() => handleBlur("ctaLabel")}
              className={inputClassName}
              placeholder={type === "event" ? "Book Now" : "Claim This Special"}
              style={fontStyle}
            />
            {touched.ctaLabel && errors.ctaLabel ? <p className="mt-2 text-sm text-coral font-medium">{errors.ctaLabel}</p> : null}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-charcoal mb-2" style={fontStyle}>CTA URL (optional)</label>
          <div className="relative">
            <Link2 className="w-4 h-4 text-charcoal/50 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="url"
              value={formData.ctaUrl}
              onChange={(e) => setFieldValue("ctaUrl", e.target.value)}
              onBlur={() => handleBlur("ctaUrl")}
              className={`${inputClassName} pl-10`}
              placeholder="https://example.com/book"
              style={fontStyle}
            />
          </div>
          {touched.ctaUrl && errors.ctaUrl ? <p className="mt-2 text-sm text-coral font-medium">{errors.ctaUrl}</p> : null}
        </div>

        {formData.ctaSource === "whatsapp" ? (
          <div className="space-y-4 rounded-[12px] border border-sage/20 bg-white p-4">
            <div>
              <label className="block text-sm font-semibold text-charcoal mb-2" style={fontStyle}>
                WhatsApp Number <span className="text-coral">*</span>
              </label>
              <div className="relative">
                <MessageCircle className="w-4 h-4 text-charcoal/50 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  inputMode="numeric"
                  value={formData.whatsappNumber}
                  onChange={(e) => setFieldValue("whatsappNumber", e.target.value)}
                  onBlur={() => handleBlur("whatsappNumber")}
                  className={`${inputClassName} pl-10`}
                  placeholder="27721234567"
                  style={fontStyle}
                />
              </div>
              <p className="mt-2 text-xs text-charcoal/65" style={fontStyle}>
                Use international format without + (example: 27721234567).
              </p>
              {touched.whatsappNumber && errors.whatsappNumber ? <p className="mt-2 text-sm text-coral font-medium">{errors.whatsappNumber}</p> : null}
            </div>

            <div>
              <label className="block text-sm font-semibold text-charcoal mb-2" style={fontStyle}>Prefilled message (optional)</label>
              <textarea
                value={formData.whatsappPrefillTemplate}
                onChange={(e) => setFieldValue("whatsappPrefillTemplate", e.target.value)}
                onBlur={() => handleBlur("whatsappPrefillTemplate")}
                rows={4}
                className={textareaClassName}
                placeholder={"Hi! I'd like to book for {title} on {start_date}.\nHere's the Sayso link: {public_url}"}
                style={fontStyle}
              />
              <p className="mt-2 text-xs text-charcoal/65" style={fontStyle}>
                Supported variables: {"{title}, {start_date}, {end_date}, {public_url}, {qty}"}.
              </p>
              {touched.whatsappPrefillTemplate && errors.whatsappPrefillTemplate ? <p className="mt-2 text-sm text-coral font-medium">{errors.whatsappPrefillTemplate}</p> : null}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
