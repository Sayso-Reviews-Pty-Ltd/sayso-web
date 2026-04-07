"use client";

import { ReactNode } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { PageLoader } from "../Loader";

interface ProtectedRouteProps {
  children: ReactNode;
  requiresAuth?: boolean;
  requiresOnboarding?: boolean;
  allowedOnboardingSteps?: string[];
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  requiresAuth = true,
  requiresOnboarding = false,
  allowedOnboardingSteps = [],
  redirectTo: _redirectTo,
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const onboardingStep = user?.profile?.onboarding_step ?? null;

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-off-white">
        <PageLoader size="lg" variant="wavy" color="sage" />
      </div>
    );
  }

  if (requiresAuth && !user) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-off-white">
        <PageLoader size="lg" variant="wavy" color="sage" />
      </div>
    );
  }

  if (requiresOnboarding && user && allowedOnboardingSteps.length > 0) {
    const currentStep = onboardingStep ?? "";
    if (!allowedOnboardingSteps.includes(currentStep)) {
      return (
        <div className="min-h-[100dvh] flex items-center justify-center bg-off-white">
          <PageLoader size="lg" variant="wavy" color="sage" />
        </div>
      );
    }
  }

  return <>{children}</>;
}

// Convenience wrapper components
export function PublicRoute({ children }: { children: ReactNode }) {
  return <ProtectedRoute requiresAuth={false}>{children}</ProtectedRoute>;
}

export function PrivateRoute({ children }: { children: ReactNode }) {
  return <ProtectedRoute requiresAuth={true}>{children}</ProtectedRoute>;
}

export function OnboardingRoute({ children, step }: { children: ReactNode; step: string }) {
  return (
    <ProtectedRoute requiresAuth={true} requiresOnboarding={true} allowedOnboardingSteps={[step]}>
      {children}
    </ProtectedRoute>
  );
}
