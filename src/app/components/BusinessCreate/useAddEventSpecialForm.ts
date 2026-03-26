"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BusinessOwnershipService } from "@/app/lib/services/businessOwnershipService";
import { ImageUploadService } from "@/app/lib/services/imageUploadService";
import { isValidHttpUrl } from "./addEventSpecialForm.constants";
import type { ContentType, FormState, OwnedBusinessOption } from "./addEventSpecialForm.types";

const makeInitialFormState = (type: ContentType): FormState => ({
  businessId: "",
  title: "",
  description: "",
  startDate: "",
  endDate: "",
  location: "",
  icon: type === "event" ? "calendar" : "sparkles",
  image: "",
  price: "",
  ctaSource: "",
  ctaLabel: "",
  ctaUrl: "",
  whatsappNumber: "",
  whatsappPrefillTemplate: "",
});

export function useAddEventSpecialForm({
  type,
  userId,
  showToast,
  successLabel,
}: {
  type: ContentType;
  userId: string | undefined;
  showToast: (message: string, variant: string, duration?: number) => void;
  successLabel: string;
}) {
  const router = useRouter();
  const isEventForm = type === "event";
  const isSpecialForm = type === "special";
  const draftKey = `sayso-draft-${type}`;
  const draftTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [businesses, setBusinesses] = useState<OwnedBusinessOption[]>([]);
  const [isLoadingBusinesses, setIsLoadingBusinesses] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [showOptionalDetails, setShowOptionalDetails] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const [formData, setFormData] = useState<FormState>(makeInitialFormState(type));

  useEffect(() => {
    if (!userId) return;
    let isActive = true;
    const loadBusinesses = async () => {
      setIsLoadingBusinesses(true);
      try {
        const ownedBusinesses = await BusinessOwnershipService.getBusinessesForOwner(userId);
        if (!isActive) return;
        const options = ownedBusinesses.map((business) => ({
          id: business.id,
          name: business.name,
          location: business.location ?? "",
        }));
        setBusinesses(options);
        if (options.length === 1) {
          setFormData((prev) => ({
            ...prev,
            businessId: prev.businessId || options[0].id,
            location: prev.location || options[0].location || "",
          }));
        }
      } catch (error) {
        console.error("[AddEventSpecialFormPage] Failed to load businesses:", error);
        showToast("Unable to load your businesses. Please try again.", "error", 3500);
      } finally {
        if (isActive) setIsLoadingBusinesses(false);
      }
    };
    void loadBusinesses();
    return () => { isActive = false; };
  }, [userId, showToast]);

  // Check for saved draft on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(draftKey);
      if (saved) {
        const parsed = JSON.parse(saved) as FormState;
        if (parsed?.title?.trim()) setHasDraft(true);
      }
    } catch { /* ignore */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-save draft with debounce
  useEffect(() => {
    if (!formData.title.trim()) return;
    if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
    draftTimerRef.current = setTimeout(() => {
      try { localStorage.setItem(draftKey, JSON.stringify(formData)); } catch { /* ignore */ }
    }, 500);
    return () => { if (draftTimerRef.current) clearTimeout(draftTimerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  const restoreDraft = () => {
    try {
      const saved = localStorage.getItem(draftKey);
      if (saved) {
        setFormData(JSON.parse(saved) as FormState);
        setHasDraft(false);
        showToast("Draft restored.", "success", 2000);
      }
    } catch { /* ignore */ }
  };

  const discardDraft = () => {
    try { localStorage.removeItem(draftKey); } catch { /* ignore */ }
    setHasDraft(false);
  };

  const saveDraft = () => {
    try {
      localStorage.setItem(draftKey, JSON.stringify(formData));
      showToast("Draft saved.", "success", 2000);
    } catch { /* ignore */ }
  };

  const setFieldValue = (field: keyof FormState, value: string) => {
    if (field === "businessId") {
      const selected = businesses.find((business) => business.id === value);
      setFormData((prev) => ({
        ...prev,
        businessId: value,
        location: prev.location || selected?.location || "",
      }));
    } else if (field === "ctaSource") {
      setFormData((prev) => ({
        ...prev,
        ctaSource: value,
        ...(value === "whatsapp" ? null : { whatsappNumber: "", whatsappPrefillTemplate: "" }),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
    if (errors[field]) {
      setErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });
    }
  };

  const validateField = (field: keyof FormState, value: string): boolean => {
    let message = "";
    if (field === "businessId" && isSpecialForm && !value) message = "Please select a business.";
    if (field === "title" && !value.trim()) message = "Please add a title.";
    if (field === "startDate") {
      const currentYear = new Date().getFullYear();
      if (!value) message = "Please choose a start date and time.";
      else if (new Date(value).getFullYear() !== currentYear) message = `Start date must be within ${currentYear}.`;
    }
    if (field === "location" && !value.trim()) message = "Please add a location.";
    if (field === "endDate" && value) {
      const currentYear = new Date().getFullYear();
      if (new Date(value).getFullYear() !== currentYear) {
        message = `End date must be within ${currentYear}.`;
      } else if (formData.startDate) {
        const start = new Date(formData.startDate).getTime();
        const end = new Date(value).getTime();
        if (!Number.isNaN(start) && !Number.isNaN(end) && end < start) message = "End date cannot be before the start date.";
      }
    }
    if (field === "image" && value.trim() && !isValidHttpUrl(value.trim())) message = "Use a valid image URL starting with http:// or https://";
    if (field === "price" && value.trim()) {
      const numericPrice = Number(value);
      if (Number.isNaN(numericPrice) || numericPrice < 0) message = "Price must be a valid non-negative number.";
    }
    if (field === "ctaLabel" && value.trim() && value.trim().length > 140) message = "CTA label must be 140 characters or less.";
    if (field === "ctaUrl" && value.trim() && !isValidHttpUrl(value.trim())) message = "Use a valid CTA URL starting with http:// or https://";
    if (field === "whatsappNumber") {
      const normalized = value.replace(/[^\d]/g, "");
      if (formData.ctaSource === "whatsapp" && normalized.length === 0) message = "WhatsApp number is required for WhatsApp booking.";
      else if (normalized.length > 0 && (normalized.length < 7 || normalized.length > 15)) message = "Use a valid WhatsApp number with 7 to 15 digits.";
    }
    if (field === "whatsappPrefillTemplate" && value.trim().length > 2000) message = "Prefilled message must be 2000 characters or less.";
    setErrors((prev) => {
      const next = { ...prev };
      if (message) next[field] = message;
      else delete next[field];
      return next;
    });
    return !message;
  };

  const handleBlur = (field: keyof FormState) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field, formData[field]);
  };

  const uploadImageFile = async (file: File) => {
    if (!userId) return;
    const validation = ImageUploadService.validateImage(file);
    if (!validation.isValid) {
      showToast(validation.error || "Invalid image file.", "error", 3500);
      return;
    }
    setIsUploadingImage(true);
    try {
      const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const safeExt = extension.replace(/[^a-z0-9]/gi, "") || "jpg";
      const path = `${userId}/${type}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}.${safeExt}`;
      const result = await ImageUploadService.uploadImage(file, "events_and_specials", path);
      if (result.error || !result.url) throw new Error(result.error || "Failed to upload image");
      setFieldValue("image", result.url);
      setTouched((prev) => ({ ...prev, image: true }));
      validateField("image", result.url);
      showToast("Image uploaded successfully.", "success", 2500);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Failed to upload image.", "error", 4000);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleImageInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await uploadImageFile(file);
    event.target.value = "";
  };

  const handleImageDrop = async (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDraggingImage(false);
    const file = event.dataTransfer.files?.[0];
    if (!file) return;
    await uploadImageFile(file);
  };

  const validateForm = () => {
    const requiredFields: Array<keyof FormState> = isSpecialForm
      ? ["businessId", "title", "startDate", "location"]
      : ["title", "startDate", "location"];
    const optionalFields: Array<keyof FormState> = [
      "endDate", "image", "price", "ctaSource", "ctaLabel", "ctaUrl", "whatsappNumber", "whatsappPrefillTemplate",
    ];
    return [...requiredFields, ...optionalFields].every((field) => validateField(field, formData[field]));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!userId) return;
    setTouched({
      businessId: true, title: true, description: true, startDate: true, endDate: true,
      location: true, icon: true, image: true, price: true, ctaSource: true,
      ctaLabel: true, ctaUrl: true, whatsappNumber: true, whatsappPrefillTemplate: true,
    });
    if (!validateForm()) {
      showToast("Please fix the highlighted fields before publishing.", "error", 3500);
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/events-and-specials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title.trim(),
          type,
          businessId: formData.businessId || null,
          startDate: formData.startDate,
          endDate: formData.endDate || null,
          location: formData.location.trim(),
          description: formData.description.trim() || null,
          icon: formData.icon.trim() || null,
          image: formData.image.trim() || null,
          price: formData.price.trim() ? Number(formData.price) : null,
          ctaSource: formData.ctaSource || null,
          ctaLabel: formData.ctaLabel.trim() || null,
          ctaUrl: formData.ctaUrl.trim() || null,
          whatsappNumber: formData.whatsappNumber.replace(/[^\d]/g, "") || null,
          whatsappPrefillTemplate: formData.whatsappPrefillTemplate.trim() || null,
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(typeof result?.error === "string" ? result.error : "We could not publish this listing.");
      }
      try { localStorage.removeItem(draftKey); } catch { /* ignore */ }
      showToast(successLabel, "success", 3000);
      setTimeout(() => {
        router.push(formData.businessId ? "/my-businesses" : "/events-specials");
        router.refresh();
      }, 650);
    } catch (error) {
      console.error("[AddEventSpecialFormPage] Submit failed:", error);
      showToast(error instanceof Error ? error.message : "Failed to publish. Please try again.", "error", 4200);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    businesses, isLoadingBusinesses, isSubmitting, errors, touched,
    isUploadingImage, isDraggingImage, setIsDraggingImage,
    showOptionalDetails, setShowOptionalDetails, hasDraft, formData,
    isEventForm, isSpecialForm, setErrors,
    setFieldValue, handleBlur, handleImageInputChange, handleImageDrop,
    handleSubmit, restoreDraft, discardDraft, saveDraft,
  };
}
