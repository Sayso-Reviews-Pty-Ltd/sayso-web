"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import { useReviewerProfile } from "../../hooks/useReviewerProfile";
import { ChevronUp } from "@/app/lib/icons";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/app/components/ui/breadcrumb";
import Footer from "../../components/Footer/Footer";
import { ReviewsList } from "@/components/organisms/ReviewsList";
import ReviewerProfileSkeleton from "../../components/ReviewerCard/ReviewerProfileSkeleton";
import ReviewerHeaderCard from "./parts/ReviewerHeaderCard";
import ReviewerStatsGrid from "./parts/ReviewerStatsGrid";
import ReviewerBadgesSection from "./parts/ReviewerBadgesSection";

export default function ReviewerProfilePage() {
  const params = useParams();
  const reviewerId = params?.id as string;
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [imgError, setImgError] = useState(false);

  const { reviewer, loading, isRealtimeConnected } = useReviewerProfile(reviewerId || null);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 100);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (loading) {
    return (
      <>
        <style jsx global>{`
          .font-urbanist {
            font-family:
              "Urbanist",
              -apple-system,
              BlinkMacSystemFont,
              "Helvetica Neue",
              Helvetica,
              Arial,
              system-ui,
              sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            font-feature-settings:
              "kern" 1,
              "liga" 1,
              "calt" 1;
          }
        `}</style>
        <ReviewerProfileSkeleton />
        <Footer />
      </>
    );
  }

  if (!reviewer) {
    return (
      <div className="min-h-[100dvh] bg-off-white">
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="text-charcoal">Reviewer not found</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        .font-urbanist {
          font-family:
            "Urbanist",
            -apple-system,
            BlinkMacSystemFont,
            "Helvetica Neue",
            Helvetica,
            Arial,
            system-ui,
            sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          font-feature-settings:
            "kern" 1,
            "liga" 1,
            "calt" 1;
        }
      `}</style>

      <div className="min-h-dvh bg-off-white relative overflow-hidden font-urbanist">
        <div className="absolute inset-0 bg-gradient-to-br from-sage/10 via-off-white to-coral/5" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(157,171,155,0.15)_0%,_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(114,47,55,0.08)_0%,_transparent_50%)]" />

        <div className="min-h-[100dvh] bg-gradient-to-b from-off-white/0 via-off-white/50 to-off-white relative z-10">
          <main
            className="relative font-urbanist"
            id="main-content"
            role="main"
            aria-label="Reviewer profile content"
          >
            <div className="mx-auto w-full max-w-[2000px] px-2 sm:px-4 lg:px-6 2xl:px-8 relative z-10">
              <Breadcrumb className="pb-1">
                <BreadcrumbList className="text-sm sm:text-base">
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link href="/home">Home</Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Reviewer Profile</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>

              <div className="pt-2 pb-12 sm:pb-16 md:pb-20">
                <div className="space-y-6">
                  <ReviewerHeaderCard
                    name={reviewer.name}
                    profilePicture={reviewer.profilePicture}
                    badge={reviewer.badge}
                    trophyBadge={reviewer.trophyBadge}
                    location={reviewer.location}
                    memberSince={reviewer.memberSince}
                    averageRating={reviewer.averageRating}
                    reviewCount={reviewer.reviewCount}
                    imgError={imgError}
                    isRealtimeConnected={isRealtimeConnected}
                    onImgError={() => setImgError(true)}
                  />

                  <ReviewerStatsGrid
                    helpfulVotes={reviewer.helpfulVotes}
                    badgesCount={reviewer.badgesCount}
                    reviewCount={reviewer.reviewCount}
                    averageRating={reviewer.averageRating}
                  />

                  <ReviewerBadgesSection badges={reviewer.badges} />

                  <section
                    className="bg-gradient-to-br from-card-bg via-card-bg to-card-bg/95 backdrop-blur-xl border-none rounded-[12px] shadow-md p-6 sm:p-8"
                    aria-label="Reviews written by this reviewer"
                  >
                    <ReviewsList
                      reviews={
                        reviewer.reviews?.length > 0
                          ? reviewer.reviews.map((review) => ({
                              businessName: review.businessName,
                              businessImageUrl: review.businessImageUrl,
                              businessCategory: review.businessType,
                              rating: review.rating,
                              reviewText: review.text,
                              reviewTitle: null,
                              helpfulCount: review.likes,
                              tags: review.tags || [],
                              isFeatured: reviewer.badge === "top",
                              createdAt: review.date,
                              businessId: review.businessId,
                            }))
                          : []
                      }
                      title={`Reviews by ${reviewer.name}`}
                      initialDisplayCount={2}
                      showToggle={true}
                    />
                  </section>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-8 right-8 z-40 w-14 h-14 bg-gradient-to-r from-navbar-bg to-navbar-bg/90 hover:from-navbar-bg/90 hover:to-navbar-bg backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl border border-white/30 hover:scale-110 transition-all duration-300"
          aria-label="Scroll to top"
        >
          <ChevronUp className="w-7 h-7 text-white" strokeWidth={2.5} />
        </button>
      )}

      <Footer />
    </>
  );
}
