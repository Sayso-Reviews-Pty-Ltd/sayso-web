"use client";

import { ArrowLeft } from "@/app/lib/icons";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/atoms/Button";
import { cn } from "@/app/lib/utils";

interface OnboardingBackButtonProps {
  href?: string;
  className?: string;
  label?: string;
}

export default function OnboardingBackButton({
  href,
  className = "",
  label = "Back",
}: OnboardingBackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    if (href) {
      router.push(href);
    } else {
      router.back();
    }
  };

  return (
    <Button
      variant="bare"
      onClick={handleBack}
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2 rounded-full",
        "text-white hover:text-white",
        "bg-navbar-bg/90 hover:bg-navbar-bg",
        "transition-all duration-200",
        "font-medium text-sm min-h-0",
        className
      )}
    >
      <ArrowLeft className="w-4 h-4" />
      {label}
    </Button>
  );
}
