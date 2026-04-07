"use client";

import { useEffect } from "react";
import { useToast } from "../../contexts/ToastContext";
import { useAuth } from "../../contexts/AuthContext";

export default function AuthToast() {
  const { showToast } = useToast();
  const { user, error } = useAuth();

  // Show error toasts for auth errors
  useEffect(() => {
    if (error) {
      showToast(error, "error", 4000);
    }
  }, [error, showToast]);

  return null; // This component doesn't render anything visible
}

// Helper functions that can be used in auth forms
export const showAuthSuccess = (
  showToast: (message: string, type: string, duration?: number) => void,
  message: string
) => {
  showToast(message, "success", 3000);
};

export const showAuthError = (
  showToast: (message: string, type: string, duration?: number) => void,
  message: string
) => {
  showToast(message, "error", 4000);
};
