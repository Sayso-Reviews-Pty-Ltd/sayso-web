"use client";

import React from "react";
import { Eye, EyeOff } from "@/app/lib/icons";
import { Input } from "@/app/components/atoms/Input";

export interface PasswordInputProps {
  label: string;
  value?: string;
  onChange?: (value: string) => void;
  showPassword: boolean;
  onToggleShow: () => void;
  placeholder?: string;
  className?: string;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  label,
  value,
  onChange,
  showPassword,
  onToggleShow,
  placeholder,
  className = "",
}) => {
  const eyeButton = (
    <button
      type="button"
      onClick={onToggleShow}
      className="text-charcoal/70 hover:text-charcoal transition-colors"
    >
      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  );

  return (
    <Input
      type={showPassword ? "text" : "password"}
      label={label}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      rightIcon={eyeButton}
      fullWidth
      className={className}
    />
  );
};
