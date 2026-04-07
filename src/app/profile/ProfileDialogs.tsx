"use client";

import { EditProfileModal } from "@/app/components/EditProfile/EditProfileModal";
import { ConfirmationDialog } from "@/components/molecules/ConfirmationDialog";
import type { UserProfile } from "./profile.types";

interface Props {
  profile: UserProfile;
  isEditOpen: boolean;
  onCloseEdit: () => void;
  handleSaveProfile: (data: {
    username: string;
    displayName: string;
    avatarFile: File | null;
  }) => Promise<void>;
  saving: boolean;
  error: string | null;
  isDeleteDialogOpen: boolean;
  onCloseDeleteDialog: () => void;
  handleConfirmDeleteReview: () => Promise<void>;
  isDeleting: boolean;
  deleteError: string | null;
  isDeleteAccountDialogOpen: boolean;
  onCloseDeleteAccountDialog: () => void;
  confirmDeleteAccount: () => Promise<void>;
  isDeletingAccount: boolean;
  deleteAccountError: string | null;
}

export function ProfileDialogs({
  profile,
  isEditOpen,
  onCloseEdit,
  handleSaveProfile,
  saving,
  error,
  isDeleteDialogOpen,
  onCloseDeleteDialog,
  handleConfirmDeleteReview,
  isDeleting,
  deleteError,
  isDeleteAccountDialogOpen,
  onCloseDeleteAccountDialog,
  confirmDeleteAccount,
  isDeletingAccount,
  deleteAccountError,
}: Props) {
  return (
    <>
      <EditProfileModal
        isOpen={isEditOpen}
        onClose={onCloseEdit}
        onSave={async (data) => {
          await handleSaveProfile(data);
        }}
        currentUsername={profile.username || ""}
        currentDisplayName={profile.display_name || null}
        currentAvatarUrl={profile.avatar_url || null}
        saving={saving}
        error={error}
      />

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={onCloseDeleteDialog}
        onConfirm={handleConfirmDeleteReview}
        title="Delete Review"
        message="Are you sure you want to delete this review? This action cannot be undone."
        confirmText={isDeleting ? "Deleting..." : "Delete"}
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
        error={deleteError}
      />

      <ConfirmationDialog
        isOpen={isDeleteAccountDialogOpen}
        onClose={onCloseDeleteAccountDialog}
        onConfirm={confirmDeleteAccount}
        title="Delete Account"
        message="Are you sure you want to permanently delete your account? This action cannot be undone and all your data will be permanently removed."
        confirmText={isDeletingAccount ? "Deleting..." : "Delete Account"}
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeletingAccount}
        error={deleteAccountError}
        requireConfirmText="DELETE"
      />
    </>
  );
}
