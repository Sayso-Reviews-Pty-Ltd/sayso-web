"use client";

import React from "react";
import { AchievementItem, AchievementItemProps } from "@/components/molecules/AchievementItem";
import { H2, P } from "@/app/components/ui/typography";

export interface AchievementsListProps {
  achievements: AchievementItemProps[];
  title?: string;
  className?: string;
}

export const AchievementsList: React.FC<AchievementsListProps> = ({
  achievements,
  title = "Your Achievements",
  className = "",
}) => {
  return (
    <div
      className={`p-6 sm:p-8 bg-card-bg rounded-[12px] shadow-sm mb-6 font-urbanist ${className}`}
    >
      <H2 className="text-sm font-bold mb-4">{title}</H2>
      {achievements.length > 0 ? (
        <div className="space-y-3">
          {achievements.map((achievement, index) => (
            <AchievementItem key={index} {...achievement} />
          ))}
        </div>
      ) : (
        <P className="text-center text-charcoal/60 py-8 text-xs font-semibold">
          No achievements yet. Keep exploring!
        </P>
      )}
    </div>
  );
};
