"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { m, AnimatePresence } from "framer-motion";
import { ChevronRight } from "@/app/lib/icons";
import { useAuth } from "@/app/contexts/AuthContext";
import { useToast } from "@/app/contexts/ToastContext";
import { usePreviousPageBreadcrumb } from "@/app/hooks/usePreviousPageBreadcrumb";
import { authStyles } from "@/app/components/Auth/Shared/authStyles";
import { animations } from "@/app/(business-portal)/add-business/components/types";
import { COPY, urbanist, fontStyle } from "./addEventSpecialForm.constants";
import { useAddEventSpecialForm } from "./useAddEventSpecialForm";
import AddEventSpecialFormSkeleton from "./AddEventSpecialFormSkeleton";
import AddEventSpecialPublishingContext from "./AddEventSpecialPublishingContext";
import AddEventSpecialListingDetails from "./AddEventSpecialListingDetails";
import AddEventSpecialBookingLink from "./AddEventSpecialBookingLink";
import type { ContentType } from "./addEventSpecialForm.types";

interface AddEventSpecialFormPageProps {
  type: ContentType;
}

export default function AddEventSpecialFormPage({ type }: AddEventSpecialFormPageProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const { user, isLoading: authLoading } = useAuth();
  const copy = COPY[type];
  const targetRoute = useMemo(() => (type === "event" ? "/add-event" : "/add-special"), [type]);
  const backRoute = type === "event" ? "/events-specials" : "/my-businesses";
  const { previousHref, previousLabel } = usePreviousPageBreadcrumb({
    fallbackHref: backRoute,
    fallbackLabel: type === "event" ? "Events & Specials" : "My Businesses",
  });
  const canCreateSpecialByRole =
    user?.profile?.role === "business_owner" ||
    user?.profile?.account_role === "business_owner";

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/login?redirect=${encodeURIComponent(targetRoute)}`);
    }
  }, [authLoading, user, router, targetRoute]);

  const {
    businesses, isLoadingBusinesses, isSubmitting, errors, touched,
    isUploadingImage, isDraggingImage, setIsDraggingImage,
    showOptionalDetails, setShowOptionalDetails, hasDraft, formData,
    isEventForm, isSpecialForm, setErrors,
    setFieldValue, handleBlur, handleImageInputChange, handleImageDrop,
    handleSubmit, restoreDraft, discardDraft, saveDraft,
  } = useAddEventSpecialForm({ type, userId: user?.id, showToast, successLabel: copy.successLabel });

  if (authLoading) return <AddEventSpecialFormSkeleton />;
  if (!user) return null;
  if (isSpecialForm && !canCreateSpecialByRole) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: authStyles }} />
        <style dangerouslySetInnerHTML={{ __html: animations }} />
        <div className="min-h-dvh bg-off-white font-urbanist" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, sans-serif' }}>
          <div className="mx-auto max-w-[920px] px-4 pt-16 pb-16">
            <div className="rounded-[12px] border border-coral/20 bg-coral/5 p-6">
              <h1 className="text-2xl font-semibold text-charcoal mb-3" style={fontStyle}>Special creation is restricted</h1>
              <p className="text-charcoal/80 mb-5" style={fontStyle}>Only verified business owners can create specials.</p>
              <Link href="/claim-business" className="inline-flex rounded-full bg-card-bg px-5 py-2.5 text-sm font-semibold text-white hover:bg-card-bg/90 transition-colors duration-200">
                Verify Business Access
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: authStyles }} />
      <style dangerouslySetInnerHTML={{ __html: animations }} />
      <div className="min-h-dvh bg-off-white font-urbanist" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, sans-serif' }}>
        <div className="container mx-auto max-w-[1300px] px-4 sm:px-6">
          <nav className="pb-1" aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 text-sm sm:text-base">
              <li>
                <Link href={previousHref} className="text-charcoal/70 hover:text-charcoal transition-colors duration-200 font-medium" style={fontStyle}>
                  {previousLabel}
                </Link>
              </li>
              <li className="flex items-center">
                <ChevronRight size={16} className="text-charcoal/60" />
              </li>
              <li>
                <span className="text-charcoal font-semibold" style={fontStyle}>{copy.pageTitle}</span>
              </li>
            </ol>
          </nav>

          <div className="max-w-4xl mx-auto pt-8 pb-8">
            <m.div className="text-center mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}>
              <h1 className={`${urbanist.className} text-2xl sm:text-3xl font-semibold mb-2 text-center leading-[1.2] tracking-tight text-charcoal`} style={{ fontFamily: urbanist.style.fontFamily }}>
                {copy.heroTitle}
              </h1>
              <p className="text-sm sm:text-base text-charcoal/70 max-w-md mx-auto" style={fontStyle}>{copy.heroSubtitle}</p>
            </m.div>

            {hasDraft && (
              <div className="mb-4 flex items-center gap-3 rounded-[12px] border border-charcoal/15 bg-white px-4 py-3 text-sm text-charcoal" style={fontStyle}>
                <span className="flex-1 font-medium">You have a saved draft.</span>
                <button type="button" onClick={restoreDraft} className="font-semibold text-navbar-bg hover:underline">Restore</button>
                <button type="button" onClick={discardDraft} className="font-semibold text-charcoal/50 hover:text-charcoal hover:underline">Discard</button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              <AddEventSpecialPublishingContext
                type={type} isEventForm={isEventForm} isSpecialForm={isSpecialForm}
                isLoadingBusinesses={isLoadingBusinesses} businesses={businesses}
                emptyBusinessesCopy={copy.emptyBusinessesCopy} formData={formData}
                errors={errors} touched={touched} setFieldValue={setFieldValue} handleBlur={handleBlur}
              />
              <AddEventSpecialListingDetails
                type={type} isEventForm={isEventForm} businesses={businesses}
                formData={formData} errors={errors} touched={touched}
                showOptionalDetails={showOptionalDetails}
                onToggleOptionalDetails={() => setShowOptionalDetails((v) => !v)}
                isDraggingImage={isDraggingImage} isUploadingImage={isUploadingImage}
                setIsDraggingImage={setIsDraggingImage} setFieldValue={setFieldValue}
                handleBlur={handleBlur} handleImageInputChange={handleImageInputChange}
                handleImageDrop={handleImageDrop}
              />
              <AddEventSpecialBookingLink
                type={type} isEventForm={isEventForm} businesses={businesses}
                formData={formData} errors={errors} touched={touched}
                setFieldValue={setFieldValue} handleBlur={handleBlur} setErrors={setErrors}
              />

              {(isEventForm || businesses.length > 0) ? (
                <m.div className="flex flex-col sm:flex-row gap-4 justify-end pt-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.35 }}>
                  <Link href={backRoute} className="px-6 py-3 rounded-full border-2 border-charcoal/20 text-charcoal font-urbanist font-600 hover:bg-charcoal/5 transition-all duration-200 text-center">
                    Cancel
                  </Link>
                  <button type="button" onClick={saveDraft} style={fontStyle} className="px-6 py-3 rounded-full border-2 border-navbar-bg/30 text-navbar-bg font-semibold hover:bg-navbar-bg/5 transition-all duration-200 text-center">
                    Save draft
                  </button>
                  <m.button type="submit" disabled={isSubmitting} whileHover={{ scale: isSubmitting ? 1 : 1.02 }} whileTap={{ scale: isSubmitting ? 1 : 0.98 }} style={fontStyle} className="w-full bg-gradient-to-r from-coral to-coral/80 text-white text-body font-semibold py-4 px-6 rounded-full hover:from-coral/90 hover:to-coral transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg">
                    <AnimatePresence mode="wait">
                      {isSubmitting ? (
                        <m.div key="loading" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="flex items-center gap-2">
                          <m.div className="flex items-center gap-1">
                            {[0, 1, 2, 3].map((dot) => (
                              <m.div key={dot} className="w-2 h-2 bg-white rounded-full" animate={{ y: [0, -6, 0], opacity: [0.6, 1, 0.6] }} transition={{ duration: 0.6, repeat: Infinity, delay: dot * 0.1, ease: "easeInOut" }} />
                            ))}
                          </m.div>
                          <span>Publishing...</span>
                        </m.div>
                      ) : (
                        <m.div key="default" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}>
                          <span>{copy.submitLabel}</span>
                        </m.div>
                      )}
                    </AnimatePresence>
                  </m.button>
                </m.div>
              ) : null}
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
