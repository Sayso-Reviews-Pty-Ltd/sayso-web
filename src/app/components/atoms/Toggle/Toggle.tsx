"use client";

import React from "react";
import { Switch, type SwitchSize } from "@/app/components/ui/switch";
import { cn } from "@/app/lib/utils";

export type { SwitchSize as ToggleSize };

export interface ToggleProps {
  enabled: boolean;
  onToggle: () => void;
  disabled?: boolean;
  size?: SwitchSize;
  className?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
  enabled,
  onToggle,
  disabled = false,
  size = "md",
  className,
}) => {
  return (
    <Switch
      checked={enabled}
      onCheckedChange={onToggle}
      disabled={disabled}
      size={size}
      className={cn(className)}
    />
  );
};
