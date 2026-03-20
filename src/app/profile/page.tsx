"use client";

import Link from "next/link";
import { ChevronRight } from "@/app/lib/icons";
import { usePredefinedPageTitle } from "@/app/hooks/usePageTitle";
import Footer from "@/app/components/Footer/Footer";
import { ReviewsList } from "@/components/organisms/ReviewsList";
import { ProfileHeader } from "@/app/components/Profile/ProfileHeader";
import { ProfileStats } from "@/app/components/Profile/ProfileStats";
import { ProfileAchievements } from "@/app/components/Profile/ProfileAchievements";
import { ProfileSavedItems } from "@/app/components/Profile/ProfileSavedItems";
import { useProfilePage } from "./hooks/useProfilePage";
import { ProfileHeaderSkeleton, StatsGridSkeleton, AchievementsSkeleton, ReviewsSkeleton } from "./ProfileSkeletons";
import { ProfilePreferences } from "./ProfilePreferences";
import { ProfileAccountActions } from "./ProfileAccountActions";
import { ProfileDialogs } from "./ProfileDialogs";

function ProfileContent() {
  const {
    user, profile, enhancedProfile, displayLabel, profileLocation, memberSinceLabel,
    profileLoading, statsLoading, achievementsLoading, reviewsLoading,
    userStats, achievements, savedBusinesses, reviewsData,
    reviewsCount, badgesCount, interestsCount, helpfulVotesCount, savedBusinessesCount, totalSavedCount,
    avatarKey, imgError, setImgError, isRealtimeConnected,
    locationStatus, requestLocation,
    isEditOpen, setIsEditOpen,
    saving, error, handleSaveProfile,
    isDeleteDialogOpen, setIsDeleteDialogOpen, reviewToDelete, setReviewToDelete,
    isDeleting, deleteError, setDeleteError, handleConfirmDeleteReview,
    isDeleteAccountDialogOpen, setIsDeleteAccountDialogOpen,
    isDeletingAccount, deleteAccountError, setDeleteAccountError, confirmDeleteAccount,
    handleLogout, handleDeleteAccount,
  } = useProfilePage();

  return (
    <>
      <style jsx global>{`
        .font-urbanist {
          font-family: "Urbanist", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, system-ui, sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          font-feature-settings: "kern" 1, "liga" 1, "calt" 1;
        }
      `}</style>
      <style jsx>{`
        .profile-load-item { opacity: 0; transform: translateY(6px); animation: profileSectionLoadIn 420ms cubic-bezier(0.22, 1, 0.36, 1) both; will-change: opacity, transform; }
        .profile-load-delay-0 { animation-delay: 0ms; }
        .profile-load-delay-1 { animation-delay: 70ms; }
        .profile-load-delay-2 { animation-delay: 120ms; }
        .profile-load-delay-3 { animation-delay: 170ms; }
        .profile-load-delay-4 { animation-delay: 220ms; }
        .profile-load-delay-5 { animation-delay: 270ms; }
        .profile-load-delay-6 { animation-delay: 320ms; }
        .profile-load-delay-7 { animation-delay: 370ms; }
        @keyframes profileSectionLoadIn { 0% { opacity: 0; transform: translateY(6px); } 100% { opacity: 1; transform: translateY(0); } }
        @media (prefers-reduced-motion: reduce) { .profile-load-item { animation: none; opacity: 1; transform: none; } }
      `}</style>

      <div className="min-h-dvh bg-off-white relative overflow-hidden font-urbanist" style={{ fontFamily: "'Urbanist', -apple-system, BlinkMacSystemFont, system-ui, sans-serif" }}>
        <div className="absolute inset-0 bg-gradient-to-br from-sage/10 via-off-white to-coral/5" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(157,171,155,0.15)_0%,_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(114,47,55,0.08)_0%,_transparent_50%)]" />

        <div className="min-h-[100dvh] bg-gradient-to-b from-off-white/0 via-off-white/50 to-off-white relative z-10">
          <main className="relative font-urbanist" id="main-content" role="main" aria-label="User profile content">
            <div className="mx-auto w-full max-w-[2000px] px-2 sm:px-4 lg:px-6 2xl:px-8 relative z-10">
              <nav className="pb-1 profile-load-item profile-load-delay-0" aria-label="Breadcrumb">
                <ol className="flex items-center gap-2 text-sm sm:text-base">
                  <li>
                    <Link href="/home" className="text-charcoal/70 hover:text-charcoal transition-colors duration-200 font-medium" style={{ fontFamily: 'Urbanist, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                      Home
                    </Link>
                  </li>
                  <li className="flex items-center"><ChevronRight className="w-4 h-4 text-charcoal/60" /></li>
                  <li><span className="text-charcoal font-semibold" style={{ fontFamily: 'Urbanist, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>Profile</span></li>
                </ol>
              </nav>

              <div className="pt-2 pb-12 sm:pb-16 md:pb-20">
                <div className="space-y-6">
                  {profileLoading ? <ProfileHeaderSkeleton /> : (
                    <ProfileHeader
                      profile={profile} user={user} enhancedProfile={enhancedProfile}
                      displayLabel={displayLabel} profileLocation={profileLocation}
                      memberSinceLabel={memberSinceLabel} reviewsCount={reviewsCount}
                      avatarKey={avatarKey} imgError={imgError} isRealtimeConnected={isRealtimeConnected}
                      onEditClick={() => setIsEditOpen(true)} onImgError={() => setImgError(true)}
                    />
                  )}

                  <div className="profile-load-item profile-load-delay-2">
                    {statsLoading ? <StatsGridSkeleton /> : (
                      <ProfileStats
                        userStats={userStats} helpfulVotesCount={helpfulVotesCount}
                        reviewsCount={reviewsCount} badgesCount={badgesCount}
                        interestsCount={interestsCount} totalSavedCount={totalSavedCount}
                        savedBusinessesCount={savedBusinessesCount}
                      />
                    )}
                  </div>

                  {savedBusinesses.length > 0 && (
                    <div className="profile-load-item profile-load-delay-3">
                      <ProfileSavedItems savedBusinesses={savedBusinesses} />
                    </div>
                  )}

                  <div className="profile-load-item profile-load-delay-4">
                    {achievementsLoading ? <AchievementsSkeleton /> : <ProfileAchievements achievements={achievements} />}
                  </div>

                  <div className="profile-load-item profile-load-delay-5">
                    {reviewsLoading ? <ReviewsSkeleton /> : (
                      <section className="bg-gradient-to-br from-card-bg via-card-bg to-card-bg/95 backdrop-blur-xl border-none rounded-[12px] shadow-md p-6 sm:p-8" aria-label="Your contributions">
                        {reviewsData.length > 0 ? (
                          <ReviewsList reviews={reviewsData} title="Your Contributions" initialDisplayCount={2} showToggle={true} />
                        ) : (
                          <div className="text-center py-8">
                            <p className="text-charcoal/70">You haven't written any reviews yet.</p>
                          </div>
                        )}
                      </section>
                    )}
                  </div>

                  <ProfilePreferences locationStatus={locationStatus} requestLocation={requestLocation} />
                  <ProfileAccountActions onLogout={handleLogout} onDeleteAccount={handleDeleteAccount} />
                </div>
              </div>
            </div>
          </main>
        </div>

        <Footer />
      </div>

      <ProfileDialogs
        profile={profile}
        isEditOpen={isEditOpen} onCloseEdit={() => setIsEditOpen(false)}
        handleSaveProfile={handleSaveProfile} saving={saving} error={error}
        isDeleteDialogOpen={isDeleteDialogOpen}
        onCloseDeleteDialog={() => { setIsDeleteDialogOpen(false); setReviewToDelete(null); setDeleteError(null); }}
        handleConfirmDeleteReview={handleConfirmDeleteReview} isDeleting={isDeleting} deleteError={deleteError}
        isDeleteAccountDialogOpen={isDeleteAccountDialogOpen}
        onCloseDeleteAccountDialog={() => { setIsDeleteAccountDialogOpen(false); setDeleteAccountError(null); }}
        confirmDeleteAccount={confirmDeleteAccount} isDeletingAccount={isDeletingAccount} deleteAccountError={deleteAccountError}
      />
    </>
  );
}

export default function ProfilePage() {
  usePredefinedPageTitle('profile');
  return <ProfileContent />;
}
