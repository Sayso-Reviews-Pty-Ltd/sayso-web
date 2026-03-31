import { Award, ThumbsUp, TrendingUp } from "@/app/lib/icons";

interface ReviewerStatsGridProps {
  helpfulVotes: number;
  badgesCount: number;
  reviewCount: number;
  averageRating: number;
}

const cardClass =
  "bg-gradient-to-br from-card-bg via-card-bg to-card-bg/95 backdrop-blur-xl border-none rounded-[12px] shadow-md p-4";

const iconPillClass =
  "grid h-8 w-8 flex-shrink-0 place-items-center rounded-full bg-off-white/70 hover:bg-off-white/90 transition-colors";

export default function ReviewerStatsGrid({
  helpfulVotes,
  badgesCount,
  reviewCount,
  averageRating,
}: ReviewerStatsGridProps) {
  return (
    <section className="grid grid-cols-2 sm:grid-cols-4 gap-4" aria-label="Reviewer statistics">
      <div className={cardClass}>
        <div className="flex items-center gap-2 mb-2">
          <span className={iconPillClass}>
            <ThumbsUp className="w-4 h-4 text-charcoal/85" />
          </span>
          <span className="text-sm text-charcoal/70">Helpful</span>
        </div>
        <p className="text-2xl font-bold text-charcoal">{helpfulVotes.toLocaleString("en-US")}</p>
        <p className="text-xs text-charcoal/60">Received</p>
      </div>

      <div className={cardClass}>
        <div className="flex items-center gap-2 mb-2">
          <span className={iconPillClass}>
            <Award className="w-4 h-4 text-charcoal/85" />
          </span>
          <span className="text-sm text-charcoal/70">Badges</span>
        </div>
        <p className="text-2xl font-bold text-charcoal">{badgesCount.toLocaleString("en-US")}</p>
        <p className="text-xs text-charcoal/60">Achievements unlocked</p>
      </div>

      <div className={cardClass}>
        <div className="flex items-center gap-2 mb-2">
          <span className={iconPillClass}>
            <TrendingUp className="w-4 h-4 text-charcoal/85" />
          </span>
          <span className="text-sm text-charcoal/70">Reviews</span>
        </div>
        <p className="text-2xl font-bold text-charcoal">{reviewCount.toLocaleString("en-US")}</p>
        <p className="text-xs text-charcoal/60">Total written</p>
      </div>

      <div className={cardClass}>
        <div className="flex items-center gap-2 mb-2">
          <span className={iconPillClass}>
            <TrendingUp className="w-4 h-4 text-charcoal/85" />
          </span>
          <span className="text-sm text-charcoal/70">Rating</span>
        </div>
        <p className="text-2xl font-bold text-charcoal">{averageRating.toFixed(1)}</p>
        <p className="text-xs text-charcoal/60">Average</p>
      </div>
    </section>
  );
}
