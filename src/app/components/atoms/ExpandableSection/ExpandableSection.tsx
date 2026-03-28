"use client";

import React from "react";
import { ArrowLeft } from "@/app/lib/icons";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/app/components/ui/collapsible";

export interface ExpandableSectionProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  showBorder?: boolean;
  className?: string;
}

export const ExpandableSection: React.FC<ExpandableSectionProps> = ({
  icon: Icon,
  label,
  isExpanded,
  onToggle,
  children,
  showBorder = true,
  className = "",
}) => {
  return (
    <Collapsible open={isExpanded} onOpenChange={() => onToggle()} className={className}>
      {showBorder && <div className="border-b border-charcoal/10 pb-4 mb-6"></div>}
      <CollapsibleTrigger asChild>
        <button className="w-full flex items-center justify-between py-3 hover:bg-charcoal/5 rounded-lg transition-colors group">
          <div className="flex items-center gap-3">
            <Icon className="w-5 h-5 text-charcoal/60 group-hover:text-coral transition-colors" />
            <span className="text-base font-500 text-charcoal group-hover:text-coral transition-colors">
              {label}
            </span>
          </div>
          <ArrowLeft
            className={`w-5 h-5 text-charcoal/60 transition-transform duration-200 ${isExpanded ? "rotate-90" : "-rotate-90"}`}
          />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="overflow-hidden transition-all duration-200 ease-out data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
};
