"use client";

import React from "react";
import {
  Button as ShadButton,
  type ButtonProps as ShadButtonProps,
} from "@/app/components/ui/button";
import { Spinner } from "@/app/components/atoms/Spinner";
import { cn } from "@/app/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends Omit<ShadButtonProps, "variant" | "size"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      disabled,
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <ShadButton
        ref={ref}
        variant={variant}
        size={size}
        disabled={disabled || isLoading}
        className={cn(fullWidth && "w-full", className)}
        {...props}
      >
        {isLoading && <Spinner />}
        {!isLoading && leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
      </ShadButton>
    );
  }
);

Button.displayName = "Button";
