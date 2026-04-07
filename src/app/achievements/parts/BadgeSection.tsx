"use client";

import { useRef } from "react";
import { m, useInView } from "framer-motion";
import { Map, Star, Target, Users } from "@/app/lib/icons";
import type { Badge } from "@/app/components/Badges/BadgeCard";
import { BadgeTile } from "./BadgeTile";

export const GROUP_META = {
  explorer: {
    label: "Category Explorer",
    Icon: Map,
    gradient: "from-blue-500/20 to-cyan-500/20",
    border: "border-blue-400/30",
    accent: "#60A5FA",
    glow: "rgba(96,165,250,0.3)",
    tagBg: "bg-blue-500/15",
    tagText: "text-blue-300",
  },
  specialist: {
    label: "Category Specialist",
    Icon: Star,
    gradient: "from-purple-500/20 to-fuchsia-500/20",
    border: "border-purple-400/30",
    accent: "#C084FC",
    glow: "rgba(192,132,252,0.3)",
    tagBg: "bg-purple-500/15",
    tagText: "text-purple-300",
  },
  milestone: {
    label: "Milestones",
    Icon: Target,
    gradient: "from-amber-500/20 to-yellow-500/20",
    border: "border-amber-400/30",
    accent: "#FBBF24",
    glow: "rgba(251,191,36,0.3)",
    tagBg: "bg-amber-500/15",
    tagText: "text-amber-300",
  },
  community: {
    label: "Community",
    Icon: Users,
    gradient: "from-emerald-500/20 to-teal-500/20",
    border: "border-emerald-400/30",
    accent: "#34D399",
    glow: "rgba(52,211,153,0.3)",
    tagBg: "bg-emerald-500/15",
    tagText: "text-emerald-300",
  },
} as const;

export function BadgeSection({
  group,
  badges,
  onSelectBadge,
}: {
  group: keyof typeof GROUP_META;
  badges: Badge[];
  onSelectBadge: (b: Badge) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const meta = GROUP_META[group];
  const { Icon } = meta;

  const earned = badges.filter((b) => b.earned).length;
  const total = badges.length;
  const pct = total > 0 ? Math.round((earned / total) * 100) : 0;

  if (!badges || badges.length === 0) return null;

  return (
    <m.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`rounded-3xl border bg-gradient-to-br ${meta.gradient} ${meta.border} backdrop-blur-sm p-6 mb-6`}
    >
      {/* Section header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: `${meta.glow}`, border: `1px solid ${meta.accent}40` }}
          >
            <Icon className="w-5 h-5" style={{ color: meta.accent }} />
          </div>
          <div>
            <h2 className="font-urbanist font-800 text-lg text-white leading-none">{meta.label}</h2>
            <p className="font-urbanist text-xs text-white/50 mt-0.5">
              {earned} of {total} unlocked
            </p>
          </div>
        </div>

        {/* Mini progress pill */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${meta.tagBg} ${meta.tagText}`}
        >
          <div className="w-12 h-1.5 rounded-full bg-white/10 overflow-hidden">
            <m.div
              className="h-full rounded-full"
              style={{ background: meta.accent }}
              initial={{ width: 0 }}
              animate={inView ? { width: `${pct}%` } : {}}
              transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
            />
          </div>
          <span className="font-urbanist font-700 text-xs">{pct}%</span>
        </div>
      </div>

      {/* Badge grid */}
      <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-7 lg:grid-cols-8 xl:grid-cols-10 gap-3">
        {badges.map((badge, i) => (
          <m.div
            key={badge.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{
              duration: 0.3,
              delay: i * 0.04,
              type: "spring",
              stiffness: 300,
              damping: 20,
            }}
          >
            <BadgeTile badge={badge} onClick={() => onSelectBadge(badge)} />
          </m.div>
        ))}
      </div>
    </m.div>
  );
}
