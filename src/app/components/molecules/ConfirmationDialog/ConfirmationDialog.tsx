"use client";

import React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { m } from "framer-motion";
import { AlertTriangle } from "@/app/lib/icons";

export interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  isLoading?: boolean;
  requireConfirmText?: string;
  error?: string | null;
}

const variantStyles = {
  danger: {
    iconBg: "bg-gradient-to-br from-coral/20 to-coral/10",
    iconColor: "text-coral",
    iconRing: "ring-coral/20",
    button: "bg-white/50 text-coral border border-coral hover:bg-coral hover:text-white",
    buttonShadow: "shadow-coral/10 hover:shadow-coral/20",
  },
  warning: {
    iconBg: "bg-gradient-to-br from-amber-500/20 to-amber-500/10",
    iconColor: "text-amber-600",
    iconRing: "ring-amber-500/20",
    button:
      "bg-white/50 text-amber-600 border border-amber-500 hover:bg-amber-500 hover:text-white",
    buttonShadow: "shadow-amber-500/10 hover:shadow-amber-500/20",
  },
  info: {
    iconBg: "bg-gradient-to-br from-sage/20 to-sage/10",
    iconColor: "text-sage",
    iconRing: "ring-sage/20",
    button: "bg-white/50 text-sage border border-sage hover:bg-card-bg hover:text-white",
    buttonShadow: "shadow-sage/10 hover:shadow-sage/20",
  },
};

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  isLoading = false,
  requireConfirmText,
  error,
}) => {
  const [confirmInput, setConfirmInput] = React.useState("");

  React.useEffect(() => {
    if (!isOpen) setConfirmInput("");
  }, [isOpen]);

  const handleConfirm = () => {
    if (requireConfirmText && confirmInput !== requireConfirmText) return;
    onConfirm();
  };

  const canConfirm = !requireConfirmText || confirmInput === requireConfirmText;
  const styles = variantStyles[variant];

  return (
    <DialogPrimitive.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isLoading) onClose();
      }}
    >
      <DialogPrimitive.Portal>
        {/* Backdrop — Radix handles scroll lock and focus trap */}
        <DialogPrimitive.Overlay className="fixed inset-0 z-[9998] bg-charcoal/40 backdrop-blur-sm" />

        {/* Content wrapper — Radix manages ARIA, ESC, and portal */}
        <DialogPrimitive.Content
          className="fixed left-[50%] top-[50%] z-[9999] w-full max-w-md translate-x-[-50%] translate-y-[-50%] p-4 focus:outline-none"
          onEscapeKeyDown={(e) => {
            if (isLoading) e.preventDefault();
          }}
          onInteractOutside={(e) => {
            if (isLoading) e.preventDefault();
          }}
          aria-describedby={undefined}
        >
          {/* Accessible title and description (visually hidden) */}
          <DialogPrimitive.Title className="sr-only">{title}</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">{message}</DialogPrimitive.Description>

          <m.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="bg-gradient-to-br from-card-bg via-card-bg to-card-bg/95 backdrop-blur-xl rounded-[24px] shadow-2xl relative overflow-hidden"
          >
            {/* Decorative gradient orbs */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-coral/10 to-transparent rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-sage/10 to-transparent rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 p-6 sm:p-8">
              {/* Icon */}
              <m.div
                className="flex items-center justify-center mb-6"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <div
                  className={`w-18 h-18 ${styles.iconBg} rounded-full flex items-center justify-center ring-8 ${styles.iconRing} p-4`}
                >
                  <AlertTriangle className={`w-8 h-8 ${styles.iconColor}`} strokeWidth={2} />
                </div>
              </m.div>

              {/* Title (visible) */}
              <m.h3
                className="font-urbanist text-xl font-semibold text-charcoal text-center mb-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.3 }}
              >
                {title}
              </m.h3>

              {/* Message (visible) */}
              <m.p
                className="font-urbanist text-sm text-charcoal/70 text-center mb-6 leading-relaxed"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                {message}
              </m.p>

              {/* Confirm text input */}
              {requireConfirmText && (
                <m.div
                  className="mb-6"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, duration: 0.3 }}
                >
                  <label className="font-urbanist block text-sm font-medium text-charcoal/80 mb-2">
                    Type{" "}
                    <span className="font-semibold bg-coral/10 text-coral px-2 py-0.5 rounded-md">
                      {requireConfirmText}
                    </span>{" "}
                    to confirm:
                  </label>
                  <input
                    type="text"
                    value={confirmInput}
                    onChange={(e) => setConfirmInput(e.target.value)}
                    className="font-urbanist w-full px-4 py-3 rounded-full text-sm text-charcoal border-2 border-charcoal/10 bg-white/80 focus:border-coral/50 focus:outline-none focus:ring-4 focus:ring-coral/10 transition-all duration-300"
                    placeholder={requireConfirmText}
                    autoFocus
                  />
                </m.div>
              )}

              {/* Error */}
              {error && (
                <m.div
                  className="mb-6 p-4 rounded-2xl bg-coral/10 border border-coral/20"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <p className="text-sm text-coral font-medium">{error}</p>
                </m.div>
              )}

              {/* Buttons */}
              <m.div
                className="flex gap-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="font-urbanist flex-1 px-6 py-3 rounded-full text-sm font-semibold bg-white/60 text-charcoal border border-charcoal/10 hover:bg-white hover:border-charcoal/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                >
                  {cancelText}
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={isLoading || !canConfirm}
                  className={`font-urbanist flex-1 px-6 py-3 rounded-full text-sm font-semibold ${styles.button} transition-all duration-300 shadow-lg ${styles.buttonShadow} disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white/50 disabled:hover:text-coral`}
                >
                  {isLoading ? "Processing..." : confirmText}
                </button>
              </m.div>
            </div>
          </m.div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};
