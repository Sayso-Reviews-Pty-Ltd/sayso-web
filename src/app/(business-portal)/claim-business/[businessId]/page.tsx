"use client";

import Link from "next/link";
import { ArrowLeft, Store } from "@/app/lib/icons";
import PhoneOtpModal from "../../../components/BusinessClaim/PhoneOtpModal";
import { Loader } from "../../../components/Loader";
import { FONT, ICON_CHIP_CLASS } from "./claimBusiness.constants";
import { useClaimBusinessPage } from "./hooks/useClaimBusinessPage";
import { ClaimBusinessFormContent } from "./parts/ClaimBusinessFormContent";

function ClaimBusinessNotFound() {
  return (
    <div className="min-h-dvh bg-off-white">
      <div className="mx-auto max-w-[640px] px-4 py-12 text-center">
        <span className={`${ICON_CHIP_CLASS} w-14 h-14 mx-auto mb-4`}>
          <Store className="w-6 h-6" />
        </span>
        <h1 className="text-lg font-semibold text-charcoal mb-2" style={{ fontFamily: FONT }}>
          Business not found
        </h1>
        <p className="text-base text-charcoal/70 mb-6" style={{ fontFamily: FONT }}>
          We couldn&apos;t find that business. It may have been removed or the link is incorrect.
        </p>
        <Link
          href="/claim-business"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-card-bg text-white text-sm font-semibold hover:bg-card-bg/90 transition-colors"
          style={{ fontFamily: FONT }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Claim Business
        </Link>
      </div>
    </div>
  );
}

export default function ClaimBusinessFormPage() {
  const {
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
  } = useClaimBusinessPage();

  if (authLoading || loading) {
    return (
      <div className="min-h-dvh bg-off-white flex items-center justify-center">
        <Loader size="lg" variant="wavy" color="sage" />
      </div>
    );
  }

  if (notFound || !business) {
    return <ClaimBusinessNotFound />;
  }

  return (
    <>
      <ClaimBusinessFormContent
        business={business}
        formData={formData}
        isSubmitting={isSubmitting}
        isSendingOtp={isSendingOtp}
        formError={formError}
        claimStateMessage={claimStateMessage}
        otpSession={otpSession}
        otpModalOpen={otpModalOpen}
        hasValidContact={hasValidContact}
        errorRef={errorRef}
        updateFormData={updateFormData}
        onSubmit={handleSubmit}
        onReopenOtp={() => setOtpModalOpen(true)}
      />

      <PhoneOtpModal
        open={otpModalOpen}
        session={otpSession}
        onClose={() => setOtpModalOpen(false)}
        onSessionUpdate={(next) => setOtpSession(next)}
        onVerified={handleOtpVerified}
      />
    </>
  );
}
