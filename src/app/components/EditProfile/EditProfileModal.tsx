"use client";

import React, { useState, useRef, useEffect } from "react";
import { authStyles } from "../Auth/Shared/authStyles";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/app/components/ui/dialog";
import { EditProfileForm } from "./parts/EditProfileForm";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { username: string; displayName: string; avatarFile: File | null }) => Promise<void>;
  currentUsername: string;
  currentDisplayName: string | null;
  currentAvatarUrl: string | null;
  saving?: boolean;
  error?: string | null;
}

export function EditProfileModal({
  isOpen,
  onClose,
  onSave,
  currentUsername,
  currentDisplayName,
  currentAvatarUrl,
  saving = false,
  error: externalError = null,
}: EditProfileModalProps) {
  const [username, setUsername] = useState(currentUsername || "");
  const [displayName, setDisplayName] = useState(currentDisplayName || "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(currentAvatarUrl);
  const [error, setError] = useState<string | null>(externalError);
  const [imgError, setImgError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update local state when props change
  useEffect(() => {
    if (isOpen) {
      setUsername(currentUsername || "");
      setDisplayName(currentDisplayName || "");
      setAvatarPreview(currentAvatarUrl);
      setAvatarFile(null);
      setError(null);
      setImgError(false);
    }
  }, [isOpen, currentUsername, currentDisplayName, currentAvatarUrl]);

  // Update error when external error changes
  useEffect(() => {
    setError(externalError);
  }, [externalError]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError("Image file is too large. Maximum size is 5MB.");
      return;
    }

    setError(null);
    setAvatarFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    // Note: We pass null explicitly to indicate removal
    // The parent component will handle clearing the avatar_url in the database
  };

  const handleSave = async () => {
    // Validate username
    if (!username.trim()) {
      setError("Username is required");
      return;
    }

    // Username validation: alphanumeric, underscore, hyphen, 3-20 chars
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    if (!usernameRegex.test(username.trim())) {
      setError("Username must be 3-20 characters and contain only letters, numbers, underscores, and hyphens");
      return;
    }

    setError(null);
    await onSave({
      username: username.trim(),
      displayName: displayName.trim() || null,
      avatarFile,
    });
  };

  const handleClose = () => {
    if (!saving) {
      onClose();
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: authStyles }} />
      <Dialog open={isOpen} onOpenChange={(open) => { if (!open && !saving) onClose(); }}>
        <DialogContent className="max-w-lg p-0 gap-0 bg-gradient-to-br from-card-bg via-card-bg to-card-bg/95 border-none max-h-[90vh] overflow-y-auto">
          <DialogTitle className="sr-only">Edit Profile</DialogTitle>
          <DialogDescription className="sr-only">Update your username, display name, and profile picture</DialogDescription>
          <EditProfileForm
            username={username}
            displayName={displayName}
            avatarPreview={avatarPreview}
            imgError={imgError}
            saving={saving}
            error={error}
            fileInputRef={fileInputRef}
            onUsernameChange={(value) => { setUsername(value); setError(null); }}
            onDisplayNameChange={setDisplayName}
            onFileSelect={handleFileSelect}
            onRemoveAvatar={handleRemoveAvatar}
            onUploadClick={() => fileInputRef.current?.click()}
            onImgError={() => setImgError(true)}
            onSave={handleSave}
            onClose={handleClose}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
