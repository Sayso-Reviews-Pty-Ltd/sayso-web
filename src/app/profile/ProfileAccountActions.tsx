"use client";

import { AlertTriangle } from "@/app/lib/icons";
import { DangerAction } from "@/components/molecules/DangerAction";

interface Props {
  onLogout: () => void;
  onDeleteAccount: () => void;
}

export function ProfileAccountActions({ onLogout, onDeleteAccount }: Props) {
  return (
    <section
      className="bg-gradient-to-br from-card-bg via-card-bg to-card-bg/95 backdrop-blur-xl border-none rounded-[12px] shadow-md p-6 sm:p-8 space-y-4 profile-load-item profile-load-delay-7"
      aria-label="Account actions"
    >
      <div className="flex items-center gap-3">
        <span className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-full bg-off-white/70 hover:bg-off-white/90 transition-colors">
          <AlertTriangle className="w-4 h-4 text-charcoal/85" />
        </span>
        <h3 className="text-base font-semibold text-charcoal">Account Actions</h3>
      </div>
      <div className="space-y-4">
        <DangerAction
          title="Log Out"
          description="Sign out of your account on this device."
          buttonText="Log Out"
          onAction={onLogout}
          variant="primary"
          showBorder={false}
        />
        <DangerAction
          title="Delete Account"
          description="Permanently delete your account and all associated data. This action cannot be undone."
          buttonText="Delete Account"
          onAction={onDeleteAccount}
          variant="secondary"
          showBorder={true}
        />
      </div>
    </section>
  );
}
