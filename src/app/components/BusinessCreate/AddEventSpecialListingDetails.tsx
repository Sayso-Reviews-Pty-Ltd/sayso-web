"use client";

import {
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Clock3,
  DollarSign,
  MapPin,
  UploadCloud,
} from "@/app/lib/icons";
import { H3 } from "@/app/components/ui/typography";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/app/components/ui/collapsible";
import {
  inputClassName,
  textareaClassName,
  sectionClassName,
  ICON_CHIP_CLASS,
} from "./addEventSpecialForm.constants";
import type { ContentType, FormState, OwnedBusinessOption } from "./addEventSpecialForm.types";

interface Props {
  type: ContentType;
  isEventForm: boolean;
  businesses: OwnedBusinessOption[];
  formData: FormState;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  showOptionalDetails: boolean;
  onToggleOptionalDetails: () => void;
  isDraggingImage: boolean;
  isUploadingImage: boolean;
  setIsDraggingImage: (v: boolean) => void;
  setFieldValue: (field: keyof FormState, value: string) => void;
  handleBlur: (field: keyof FormState) => void;
  handleImageInputChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleImageDrop: (e: React.DragEvent<HTMLLabelElement>) => Promise<void>;
}

export default function AddEventSpecialListingDetails({
  type,
  isEventForm,
  businesses,
  formData,
  errors,
  touched,
  showOptionalDetails,
  onToggleOptionalDetails,
  isDraggingImage,
  isUploadingImage,
  setIsDraggingImage,
  setFieldValue,
  handleBlur,
  handleImageInputChange,
  handleImageDrop,
}: Props) {
  if (!isEventForm && businesses.length === 0) return null;

  const currentYear = new Date().getFullYear();
  const minDate = `${currentYear}-01-01T00:00`;
  const maxDate = `${currentYear}-12-31T23:59`;

  return (
    <div className={`${sectionClassName} animate-fade-in-up animate-delay-200`}>
      <div className="relative z-10 space-y-6">
        <H3 className="text-base flex items-center gap-3">
          <span className={ICON_CHIP_CLASS}>
            <CalendarDays className="w-5 h-5" />
          </span>
          Listing Details
        </H3>

        <div>
          <label className="block text-sm font-semibold text-charcoal mb-2 font-urbanist">
            Title <span className="text-coral">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFieldValue("title", e.target.value)}
            onBlur={() => handleBlur("title")}
            className={`${inputClassName} font-urbanist`}
            placeholder={type === "event" ? "Friday Networking Session" : "2-for-1 Brunch Special"}
          />
          {touched.title && errors.title ? (
            <p className="mt-2 text-sm text-coral font-medium">{errors.title}</p>
          ) : null}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-charcoal mb-2 font-urbanist">
              Start date and time <span className="text-coral">*</span>
            </label>
            <div className="relative">
              <Clock3 className="w-4 h-4 text-charcoal/50 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => setFieldValue("startDate", e.target.value)}
                onBlur={() => handleBlur("startDate")}
                min={minDate}
                max={maxDate}
                className={`${inputClassName} pl-10`}
              />
            </div>
            {touched.startDate && errors.startDate ? (
              <p className="mt-2 text-sm text-coral font-medium">{errors.startDate}</p>
            ) : null}
          </div>
          <div>
            <label className="block text-sm font-semibold text-charcoal mb-2 font-urbanist">
              Location <span className="text-coral">*</span>
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-charcoal/50 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFieldValue("location", e.target.value)}
                onBlur={() => handleBlur("location")}
                className={`${inputClassName} pl-10 font-urbanist`}
                placeholder="City, venue, or branch location"
              />
            </div>
            {touched.location && errors.location ? (
              <p className="mt-2 text-sm text-coral font-medium">{errors.location}</p>
            ) : null}
          </div>
        </div>

        <Collapsible open={showOptionalDetails} onOpenChange={() => onToggleOptionalDetails()}>
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 text-sm font-semibold text-navbar-bg hover:text-navbar-bg/80 transition-colors font-urbanist"
            >
              {showOptionalDetails ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
              {showOptionalDetails ? "Hide optional details" : "Add more details"}
            </button>
          </CollapsibleTrigger>

          <CollapsibleContent className="overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
            <div className="space-y-6 pt-2">
              <div>
                <label className="block text-sm font-semibold text-charcoal mb-2 font-urbanist">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFieldValue("description", e.target.value)}
                  rows={5}
                  className={`${textareaClassName} font-urbanist`}
                  placeholder="Share key details and what visitors should expect."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-charcoal mb-2 font-urbanist">
                    End date and time (optional)
                  </label>
                  <div className="relative">
                    <Clock3 className="w-4 h-4 text-charcoal/50 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="datetime-local"
                      value={formData.endDate}
                      onChange={(e) => setFieldValue("endDate", e.target.value)}
                      onBlur={() => handleBlur("endDate")}
                      min={minDate}
                      max={maxDate}
                      className={`${inputClassName} pl-10`}
                    />
                  </div>
                  {touched.endDate && errors.endDate ? (
                    <p className="mt-2 text-sm text-coral font-medium">{errors.endDate}</p>
                  ) : null}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-charcoal mb-2 font-urbanist">
                    Price (optional)
                  </label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 text-charcoal/50 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFieldValue("price", e.target.value)}
                      onBlur={() => handleBlur("price")}
                      className={`${inputClassName} pl-10 font-urbanist`}
                      placeholder="0.00"
                    />
                  </div>
                  {touched.price && errors.price ? (
                    <p className="mt-2 text-sm text-coral font-medium">{errors.price}</p>
                  ) : null}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-charcoal mb-2 font-urbanist">
                  Image (optional)
                </label>
                <div className="space-y-3">
                  <label
                    className={`flex flex-col items-center justify-center rounded-[12px] border-2 border-dashed px-4 py-6 text-center transition-colors duration-200 cursor-pointer ${
                      isDraggingImage
                        ? "border-sage bg-off-white/70"
                        : "border-charcoal/20 bg-white hover:border-sage/40"
                    } ${isUploadingImage ? "opacity-75 cursor-not-allowed" : ""}`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      if (!isUploadingImage) setIsDraggingImage(true);
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      setIsDraggingImage(false);
                    }}
                    onDrop={handleImageDrop}
                  >
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      className="hidden"
                      onChange={handleImageInputChange}
                      disabled={isUploadingImage}
                    />
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-off-white/80 text-charcoal/85 mb-2">
                      <UploadCloud className="w-5 h-5" />
                    </span>
                    <p className="text-sm font-semibold text-charcoal font-urbanist">
                      {isUploadingImage
                        ? "Uploading image..."
                        : "Drop image here or click to upload"}
                    </p>
                    <p className="text-xs text-charcoal/60 mt-1 font-urbanist">
                      JPEG, PNG, or WebP. Max 5MB.
                    </p>
                  </label>

                  {formData.image ? (
                    <div className="rounded-[12px] overflow-hidden border-none bg-white/80 p-2">
                      <img
                        src={formData.image}
                        alt="Event or special preview"
                        className="w-full h-40 object-cover rounded-[8px]"
                      />
                    </div>
                  ) : null}
                </div>
                {touched.image && errors.image ? (
                  <p className="mt-2 text-sm text-coral font-medium">{errors.image}</p>
                ) : null}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}
