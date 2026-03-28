"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { AlertCircle } from "@/app/lib/icons";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/app/components/ui/breadcrumb";
import { m, AnimatePresence } from "framer-motion";
import { useToast } from "../../contexts/ToastContext";
import { useAuth } from "../../contexts/AuthContext";
import { PageLoader } from "../../components/Loader";
import { usePreviousPageBreadcrumb } from "../../hooks/usePreviousPageBreadcrumb";
import { authStyles } from "../../components/Auth/Shared/authStyles";
import { Urbanist } from "next/font/google";
import { useAddBusinessFormLogic } from "./hooks/useAddBusinessFormLogic";

// Import extracted components
import {
  BasicInfoSection,
  LocationSection,
  ContactSection,
  BusinessImagesSection,
  BusinessHoursSection,
  animations,
} from "./components";

const urbanist = Urbanist({
  weight: ["400", "600", "700", "800"],
  subsets: ["latin"],
  display: "swap",
});

export default function AddBusinessPage() {
  const router = useRouter();
  const { previousHref, previousLabel } = usePreviousPageBreadcrumb({
    fallbackHref: "/my-businesses",
    fallbackLabel: "My Businesses",
  });
  const { showToast } = useToast();
  const { user, isLoading: authLoading } = useAuth();
  const {
    ownershipPricingNotice,
    iconChipClass,
    formData,
    imagePreviews,
    uploadingImages,
    subcategories,
    loadingCategories,
    isSubmitting,
    errors,
    touched,
    nameDuplicateCheck,
    geocodeStatus,
    handleLocationBlurGeocode,
    handleClearCoordinates,
    handleLocationSelect,
    handleInputChange,
    handleHoursChange,
    handleImageUpload,
    removeImage,
    handleBlur,
    handleSubmit,
  } = useAddBusinessFormLogic({
    showToast,
    onSubmissionSuccess: () => {
      router.push("/my-businesses");
      router.refresh();
    },
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/login?redirect=/add-business`);
    }
  }, [user, authLoading, router]);

  // Show loader while checking auth
  if (authLoading) {
    return <PageLoader size="lg" variant="wavy" color="sage" />;
  }

  // Show message if not authenticated (will redirect)
  if (!user) {
    return null;
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: authStyles }} />
      <style dangerouslySetInnerHTML={{ __html: animations }} />
      <div
        className="min-h-dvh bg-off-white relative overflow-hidden font-urbanist"
        style={{
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, sans-serif',
        }}
      >
        <div className="min-h-[100dvh] bg-gradient-to-b from-off-white/0 via-off-white/50 to-off-white">
          <div className="">
            <section className="relative overflow-hidden">
              {/* Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-sage/10 via-off-white to-coral/5" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(157,171,155,0.15)_0%,_transparent_50%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(114,47,55,0.08)_0%,_transparent_50%)]" />

              <div className="w-full px-4 sm:px-6 lg:px-8 relative z-10">
                <Breadcrumb className="pt-4 sm:pt-6 pb-2">
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink asChild>
                        <Link href={previousHref}>{previousLabel}</Link>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage>Add Business</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>

                <div className="max-w-4xl mx-auto pt-8 pb-8">
                  {/* Page Header */}
                  <m.div
                    className="text-center mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                  >
                    <div className="inline-block relative mb-2">
                      <h1
                        className={`${urbanist.className} text-2xl sm:text-3xl font-semibold mb-2 text-center leading-[1.2] tracking-tight text-charcoal`}
                        style={{ fontFamily: urbanist.style.fontFamily }}
                      >
                        Create Business Profile
                      </h1>
                    </div>
                    <m.p
                      className="text-sm sm:text-base text-charcoal/70 font-urbanist max-w-md mx-auto"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3, duration: 0.4 }}
                    >
                      Connect with customers and grow your presence
                    </m.p>
                  </m.div>

                  {/* Screen reader announcements */}
                  <div
                    id="form-announcements"
                    className="sr-only"
                    role="status"
                    aria-live="polite"
                    aria-atomic="true"
                  />

                  <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                    {/* Basic Information Section */}
                    <BasicInfoSection
                      formData={formData}
                      errors={errors}
                      touched={touched}
                      subcategories={subcategories}
                      loadingCategories={loadingCategories}
                      onInputChange={handleInputChange}
                      onBlur={handleBlur}
                      nameDuplicateCheck={nameDuplicateCheck}
                    />

                    {/* Location Information Section */}
                    <LocationSection
                      formData={formData}
                      errors={errors}
                      touched={touched}
                      geocodeStatus={geocodeStatus}
                      onInputChange={handleInputChange}
                      onBlur={handleBlur}
                      onLocationBlur={handleLocationBlurGeocode}
                      onClearCoordinates={handleClearCoordinates}
                      onLocationSelect={handleLocationSelect}
                    />

                    {/* Contact Information Section */}
                    <ContactSection
                      formData={formData}
                      errors={errors}
                      touched={touched}
                      onInputChange={handleInputChange}
                      onBlur={handleBlur}
                    />

                    {/* Business Images Section */}
                    <BusinessImagesSection
                      imagePreviews={imagePreviews}
                      uploadingImages={uploadingImages}
                      onImageUpload={handleImageUpload}
                      onRemoveImage={removeImage}
                    />

                    {/* Business Hours Section */}
                    <BusinessHoursSection formData={formData} onHoursChange={handleHoursChange} />

                    {/* Ownership Pricing Disclaimer */}
                    <m.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                      className="rounded-[12px] border border-coral/20 bg-gradient-to-r from-coral/10 via-coral/5 to-white/90 p-4 sm:p-5 shadow-sm"
                      role="note"
                      aria-label="Business ownership pricing notice"
                    >
                      <div className="flex items-start gap-3">
                        <span className={`${iconChipClass} mt-0.5 h-8 w-8 shrink-0`}>
                          <AlertCircle className="h-4 w-4" />
                        </span>
                        <div>
                          <p
                            className="text-sm sm:text-base font-semibold text-charcoal"
                            style={{
                              fontFamily:
                                "Urbanist, -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
                            }}
                          >
                            Business Ownership Notice
                          </p>
                          <p
                            className="mt-1 text-sm sm:text-base leading-relaxed text-charcoal/80"
                            style={{
                              fontFamily:
                                "Urbanist, -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
                            }}
                          >
                            {ownershipPricingNotice}
                          </p>
                        </div>
                      </div>
                    </m.div>

                    {/* Submit Button */}
                    <m.div
                      className="flex flex-col sm:flex-row gap-4 justify-end pt-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                    >
                      <Link
                        href="/claim-business"
                        className="px-6 py-3 rounded-full border-2 border-charcoal/20 text-charcoal font-urbanist font-600 hover:bg-charcoal/5 transition-all duration-200 text-center"
                      >
                        Cancel
                      </Link>
                      <m.button
                        type="submit"
                        disabled={
                          isSubmitting ||
                          nameDuplicateCheck.checking ||
                          nameDuplicateCheck.available === false
                        }
                        whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                        whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                        style={{
                          fontFamily:
                            "Urbanist, -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
                          fontWeight: 600,
                        }}
                        className="w-full bg-gradient-to-r from-coral to-coral/80 text-white text-body font-semibold py-4 px-6 rounded-full hover:from-coral/90 hover:to-coral transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                      >
                        <AnimatePresence mode="wait">
                          {isSubmitting ? (
                            <m.div
                              key="loading"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              className="flex items-center gap-2"
                            >
                              <m.div className="flex items-center gap-1">
                                {[0, 1, 2, 3].map((i) => (
                                  <m.div
                                    key={i}
                                    className="w-2 h-2 bg-white rounded-full"
                                    animate={{
                                      y: [0, -6, 0],
                                      opacity: [0.6, 1, 0.6],
                                    }}
                                    transition={{
                                      duration: 0.6,
                                      repeat: Infinity,
                                      delay: i * 0.1,
                                      ease: "easeInOut",
                                    }}
                                  />
                                ))}
                              </m.div>
                              <span>Creating...</span>
                            </m.div>
                          ) : (
                            <m.div
                              key="default"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              className="flex items-center gap-2"
                            >
                              <span>Create Business Profile</span>
                            </m.div>
                          )}
                        </AnimatePresence>
                      </m.button>
                    </m.div>
                  </form>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
