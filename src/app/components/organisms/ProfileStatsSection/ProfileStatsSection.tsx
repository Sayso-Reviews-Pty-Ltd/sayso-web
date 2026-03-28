"use client";

import React from "react";
import { StatsGrid, Stat } from "@/components/molecules/StatsGrid";
import { H2 } from "@/app/components/ui/typography";

export interface ProfileStatsSectionProps {
  stats: Stat[];
  title?: string;
  columns?: 2 | 3 | 4;
  className?: string;
}

export const ProfileStatsSection: React.FC<ProfileStatsSectionProps> = ({
  stats,
  title = "Stats Overview",
  columns = 3,
  className = "",
}) => {
  return (
    <div
      className={`p-6 sm:p-8 bg-card-bg rounded-[12px] shadow-sm mb-6 font-urbanist ${className}`}
    >
      <H2 className="text-sm font-bold mb-4">{title}</H2>
      <StatsGrid stats={stats} columns={columns} />
    </div>
  );
};
