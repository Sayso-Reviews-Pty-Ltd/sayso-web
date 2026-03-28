"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useMemo,
  useEffect,
  ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import {
  FLASH_TOAST_TTL_MS,
  clearFlashToast,
  readFlashToast,
  writeFlashToast,
} from "@/app/lib/toast/flashToast";

type ToastType = "success" | "error" | "info" | "warning" | "sage";

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  showToastOnce: (key: string, message: string, type?: ToastType, duration?: number) => void;
  queueFlashToast: (
    message: string,
    type?: ToastType,
    duration?: number,
    options?: { targetPath: string; onceKey?: string }
  ) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const seenToastsRef = useRef<Set<string>>(
    typeof window !== "undefined"
      ? new Set<string>(JSON.parse(sessionStorage.getItem("shown-toasts") || "[]"))
      : new Set<string>()
  );

  const showToast = useCallback((message: string, type: ToastType = "info", duration = 4000) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const opts = { id, duration };
    switch (type) {
      case "success":
        toast.success(message, opts);
        break;
      case "error":
        toast.error(message, opts);
        break;
      case "warning":
        toast.warning(message, opts);
        break;
      case "sage":
        toast.success(message, opts);
        break;
      default:
        toast.info(message, opts);
        break;
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    toast.dismiss(id);
  }, []);

  const showToastOnce = useCallback(
    (key: string, message: string, type: ToastType = "info", duration = 4000) => {
      if (seenToastsRef.current.has(key)) return;
      seenToastsRef.current.add(key);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("shown-toasts", JSON.stringify(Array.from(seenToastsRef.current)));
      }
      showToast(message, type, duration);
    },
    [showToast]
  );

  useEffect(() => {
    if (!pathname) return;
    const pendingToast = readFlashToast();
    if (!pendingToast) return;
    if (pendingToast.targetPath !== pathname) return;

    if (pendingToast.onceKey && seenToastsRef.current.has(pendingToast.onceKey)) {
      clearFlashToast();
      return;
    }

    if (pendingToast.onceKey) {
      showToastOnce(
        pendingToast.onceKey,
        pendingToast.message,
        pendingToast.type,
        pendingToast.duration
      );
    } else {
      showToast(pendingToast.message, pendingToast.type, pendingToast.duration);
    }
    clearFlashToast();
  }, [pathname, showToast, showToastOnce]);

  const queueFlashToast = useCallback(
    (
      message: string,
      type: ToastType = "info",
      duration = 4000,
      options?: { targetPath: string; onceKey?: string }
    ) => {
      if (typeof window === "undefined" || !options?.targetPath) return;
      writeFlashToast({
        message,
        type,
        duration,
        targetPath: options.targetPath,
        onceKey: options.onceKey,
        expiresAt: Date.now() + FLASH_TOAST_TTL_MS,
      });
    },
    []
  );

  const value = useMemo(
    () => ({
      showToast,
      showToastOnce,
      queueFlashToast,
      removeToast,
    }),
    [showToast, showToastOnce, queueFlashToast, removeToast]
  );

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
