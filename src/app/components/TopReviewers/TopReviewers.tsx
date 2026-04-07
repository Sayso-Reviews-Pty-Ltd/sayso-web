"use client";

import { useRouter } from "next/navigation";
import { ArrowRight } from "@/app/lib/icons";
import ReviewerCard from "../ReviewerCard/ReviewerCard";
import { Reviewer } from "../../types/community";
import { useReviewersTop } from "../../hooks/useReviewersTop";

interface TopReviewersProps {
  title?: string;
  reviewers?: Reviewer[]; // Optional - will fetch from API if not provided
  cta?: string;
  href?: string;
}

export default function TopReviewers({
  title = "Top Reviewers",
  reviewers: propReviewers,
  cta = "See More",
  href = "/reviewers",
}: TopReviewersProps) {
  const router = useRouter();

  // Use SWR hook only when reviewers are not passed via props
  const { reviewers: fetchedReviewers, loading } = useReviewersTop(propReviewers ? 0 : 12);
  const reviewers = propReviewers ?? fetchedReviewers;

  const handleSeeMore = () => {
    router.push(href);
  };

  if (!propReviewers && loading) {
    return (
      <section className="py-8 bg-off-white relative" aria-label="top reviewers">
        <div className="container mx-auto max-w-[1300px] px-4 relative z-10">
          <div className="text-center text-charcoal/60">Loading top reviewers...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 bg-off-white  relative" aria-label="top reviewers" data-section>
      {/* Subtle section decoration */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-10 left-20 w-32 h-32 bg-gradient-to-br from-sage/10 to-transparent rounded-full blur-lg" />
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-gradient-to-br from-coral/8 to-transparent rounded-full blur-xl" />
      </div>

      <div className="container mx-auto max-w-[1300px] px-4 relative z-10">
        <div className="mb-12 flex flex-wrap items-center justify-between gap-[18px]">
          <h2 className="font-urbanist text-lg font-800 text-charcoal relative">{title}</h2>
          <button
            onClick={handleSeeMore}
            className="group font-urbanist font-700 text-charcoal/70 transition-all duration-300 hover:text-sage text-base flex items-center gap-1"
          >
            <span className="transition-transform duration-300 group-hover:translate-x-[-2px]">
              {cta}
            </span>
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-[2px]" />
          </button>
        </div>

        <div className="overflow-x-auto -mb-6">
          <ul
            className="flex gap-4 md:gap-5 pb-4 sm:pb-5 md:pb-6 pt-2"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {reviewers.map((reviewer, index) => (
              <ReviewerCard key={reviewer.id} reviewer={reviewer} index={index} />
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
