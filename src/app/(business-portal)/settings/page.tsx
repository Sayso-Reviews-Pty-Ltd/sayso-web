"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { LogOut, Trash2, UserRound, Mail, ShieldAlert } from "@/app/lib/icons";
import { animations } from "../add-business/components";

const FONT_STACK = "Urbanist, -apple-system, BlinkMacSystemFont, system-ui, sans-serif";
const ICON_CHIP_CLASS =
  "inline-flex items-center justify-center rounded-full bg-off-white/80 text-charcoal/85 transition-colors duration-200 hover:bg-off-white/90";
const SMALL_ICON_CHIP_CLASS = `${ICON_CHIP_CLASS} h-6 w-6`;

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // Edit Profile state
  const [displayName, setDisplayName] = useState("");
  const [savedDisplayName, setSavedDisplayName] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);
  const [nameSuccess, setNameSuccess] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  // Notification Preferences state
  const [notifPrefs, setNotifPrefs] = useState({ reviews: true, messages: true, bookings: true });
  const [notifSaved, setNotifSaved] = useState(false);

  useEffect(() => {
    const initial = user?.profile?.display_name || user?.profile?.username || "";
    setDisplayName(initial);
    setSavedDisplayName(initial);
  }, [user?.profile?.display_name, user?.profile?.username]);

  useEffect(() => {
    fetch("/api/user/profile")
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        const prefs = data?.data?.notification_preferences;
        if (prefs && typeof prefs === "object") {
          setNotifPrefs({
            reviews: prefs.reviews !== false,
            messages: prefs.messages !== false,
            bookings: prefs.bookings !== false,
          });
        }
      })
      .catch(() => {/* keep defaults */});
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    setDeleteError(null);

    try {
      const response = await fetch("/api/user/delete-account", {
        method: "DELETE",
        cache: "no-store",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete account");
      }

      // Account successfully deleted
      setIsDeleteConfirmOpen(false);
      window.location.href = "/onboarding";
    } catch (error: any) {
      console.error("Error deleting account:", error);
      setIsDeletingAccount(false);
      setDeleteError(`Failed to delete account: ${error.message}`);
    }
  };

  const handleSaveName = async () => {
    if (displayName === savedDisplayName || isSavingName) return;
    setIsSavingName(true);
    setNameError(null);
    setNameSuccess(false);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ display_name: displayName }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.message || "Failed to save");
      }
      setSavedDisplayName(displayName);
      setNameSuccess(true);
      setTimeout(() => setNameSuccess(false), 3000);
    } catch (err: any) {
      setNameError(err.message);
    } finally {
      setIsSavingName(false);
    }
  };

  const handleToggleNotif = async (key: "reviews" | "messages" | "bookings") => {
    const updated = { ...notifPrefs, [key]: !notifPrefs[key] };
    setNotifPrefs(updated);
    setNotifSaved(false);
    try {
      await fetch("/api/user/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      setNotifSaved(true);
      setTimeout(() => setNotifSaved(false), 2000);
    } catch {
      setNotifPrefs(notifPrefs);
    }
  };

  const username = user?.profile?.username || user?.profile?.display_name || user?.email?.split("@")[0] || "User";

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: animations }} />
      <div className="mx-auto w-full max-w-5xl p-4 sm:p-6 lg:p-8">
        <div className="space-y-5">
          {/* Account Summary */}
          <section className="relative bg-white border border-charcoal/10 rounded-[16px] shadow-sm p-5 sm:p-6">
            <div className="relative flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-charcoal/10 flex items-center justify-center text-charcoal font-bold text-base shadow-sm" style={{ fontFamily: FONT_STACK }}>
                {username.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-charcoal/55 uppercase tracking-wide mb-2" style={{ fontFamily: FONT_STACK }}>
                  Account Profile
                </p>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2.5 text-charcoal">
                    <span className={SMALL_ICON_CHIP_CLASS}>
                      <UserRound className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-sm sm:text-base font-semibold truncate" style={{ fontFamily: FONT_STACK }}>{username}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-charcoal/75">
                    <span className={SMALL_ICON_CHIP_CLASS}>
                      <Mail className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-sm truncate" style={{ fontFamily: FONT_STACK }}>{user?.email}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Edit Profile */}
          <section className="bg-white border border-charcoal/10 rounded-[16px] shadow-sm p-5 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-charcoal mb-4" style={{ fontFamily: FONT_STACK }}>
              Edit Profile
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-charcoal/55 uppercase tracking-wide block mb-2" style={{ fontFamily: FONT_STACK }}>
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={e => {
                    setDisplayName(e.target.value);
                    setNameSuccess(false);
                    setNameError(null);
                  }}
                  placeholder="Your display name"
                  className="rounded-full border border-charcoal/15 px-4 py-3 text-sm font-semibold text-charcoal bg-white focus:outline-none focus:ring-2 focus:ring-navbar-bg/30 w-full"
                  style={{ fontFamily: FONT_STACK }}
                />
              </div>
              {nameError && (
                <p className="text-xs text-coral" style={{ fontFamily: FONT_STACK }}>{nameError}</p>
              )}
              {nameSuccess && (
                <p className="text-xs font-semibold text-emerald-600" style={{ fontFamily: FONT_STACK }}>Name saved</p>
              )}
              <button
                onClick={handleSaveName}
                disabled={displayName === savedDisplayName || isSavingName}
                className="px-5 py-2.5 bg-charcoal text-white text-sm font-semibold rounded-full transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-charcoal/90"
                style={{ fontFamily: FONT_STACK }}
              >
                {isSavingName ? "Saving…" : "Save"}
              </button>
            </div>
          </section>

          {/* Notification Preferences */}
          <section className="bg-white border border-charcoal/10 rounded-[16px] shadow-sm p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base sm:text-lg font-semibold text-charcoal" style={{ fontFamily: FONT_STACK }}>
                Notifications
              </h2>
              {notifSaved && (
                <span className="text-xs font-semibold text-emerald-600" style={{ fontFamily: FONT_STACK }}>Saved</span>
              )}
            </div>
            <div className="space-y-4">
              {(
                [
                  { key: "reviews", label: "New reviews" },
                  { key: "messages", label: "New messages" },
                  { key: "bookings", label: "Booking enquiries" },
                ] as const
              ).map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-charcoal" style={{ fontFamily: FONT_STACK }}>{label}</span>
                  <button
                    role="switch"
                    aria-checked={notifPrefs[key]}
                    onClick={() => handleToggleNotif(key)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-navbar-bg/30 focus:ring-offset-1 ${notifPrefs[key] ? "bg-charcoal" : "bg-charcoal/20"}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${notifPrefs[key] ? "translate-x-6" : "translate-x-1"}`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Session Actions */}
          <section className="bg-white border border-charcoal/10 rounded-[16px] shadow-sm p-5 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-charcoal mb-4" style={{ fontFamily: FONT_STACK }}>
              Session
            </h2>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 bg-charcoal/5 hover:bg-charcoal/10 border border-charcoal/15 hover:border-charcoal/25 rounded-[12px] text-charcoal font-semibold transition-all duration-200 text-sm"
              style={{ fontFamily: FONT_STACK }}
            >
              <span className={SMALL_ICON_CHIP_CLASS}>
                <LogOut className="w-3.5 h-3.5" />
              </span>
              Log Out
            </button>
          </section>

          {/* Danger Zone */}
          <section className="bg-white border border-coral/30 rounded-[16px] shadow-sm p-5 sm:p-6">
            <div className="flex items-center gap-2.5 mb-4">
              <span className={SMALL_ICON_CHIP_CLASS}>
                <ShieldAlert className="w-4 h-4" />
              </span>
              <h2 className="text-base sm:text-lg font-semibold text-charcoal" style={{ fontFamily: FONT_STACK }}>
                Danger Zone
              </h2>
            </div>

            <p className="text-sm text-charcoal/75 mb-4" style={{ fontFamily: FONT_STACK }}>
              Deleting your account permanently removes your profile, businesses, and activity data.
            </p>

            {!isDeleteConfirmOpen ? (
              <button
                onClick={() => setIsDeleteConfirmOpen(true)}
                className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 bg-white hover:bg-coral/5 border border-coral/40 hover:border-coral/55 rounded-[12px] text-coral font-semibold transition-all duration-200 text-sm"
                style={{ fontFamily: FONT_STACK }}
              >
                <span className={SMALL_ICON_CHIP_CLASS}>
                  <Trash2 className="w-3.5 h-3.5" />
                </span>
                Delete Account
              </button>
            ) : (
              <div className="bg-white border border-coral/35 rounded-[12px] shadow-sm p-4 sm:p-5 space-y-4">
                <div>
                  <h3 className="font-semibold text-charcoal mb-2" style={{ fontFamily: FONT_STACK }}>Delete Account</h3>
                  <p className="text-sm text-charcoal/75 mb-3" style={{ fontFamily: FONT_STACK }}>
                    This action cannot be undone. All your data, including your businesses, will be permanently deleted.
                  </p>
                  {deleteError && (
                    <p className="text-sm text-coral mb-3" style={{ fontFamily: FONT_STACK }}>{deleteError}</p>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setIsDeleteConfirmOpen(false)}
                    disabled={isDeletingAccount}
                    className="flex-1 px-4 py-2.5 bg-charcoal/10 hover:bg-charcoal/20 text-charcoal font-medium rounded-lg text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ fontFamily: FONT_STACK }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={isDeletingAccount}
                    className="flex-1 px-4 py-2.5 bg-coral hover:bg-coral/90 text-white font-medium rounded-lg text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ fontFamily: FONT_STACK }}
                  >
                    {isDeletingAccount ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
