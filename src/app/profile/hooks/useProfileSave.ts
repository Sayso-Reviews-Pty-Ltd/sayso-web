"use client";

import { useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { UserProfile } from "../profile.types";

interface UseProfileSaveOptions {
  user: { id: string; profile?: any; email?: string } | null | undefined;
  supabase: SupabaseClient;
  profile: UserProfile;
  profileMutate: () => void;
  updateUser: (data: any) => Promise<void>;
  onSaveSuccess: () => void;
}

export function useProfileSave({
  user,
  supabase,
  profile,
  profileMutate,
  updateUser,
  onSaveSuccess,
}: UseProfileSaveOptions) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarKey, setAvatarKey] = useState(0);
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");

  const handleSaveProfile = async (data?: {
    username: string;
    displayName: string;
    avatarFile: File | null;
  }) => {
    if (!user) return;
    setSaving(true);
    setError(null);

    const usernameToSave = data?.username || username;
    const displayNameToSave = data?.displayName || displayName;
    const avatarFileToSave = data?.avatarFile !== undefined ? data.avatarFile : avatarFile;

    try {
      let avatar_url = profile.avatar_url || null;

      if (avatarFileToSave === null && data?.avatarFile === null) {
        avatar_url = null;

        if (profile.avatar_url) {
          try {
            const urlParts = profile.avatar_url.split("/");
            const fileName = urlParts[urlParts.length - 1].split("?")[0];
            const path = `${user.id}/${fileName}`;

            const { error: deleteError } = await supabase.storage.from("avatars").remove([path]);

            if (deleteError) {
              console.warn("Error deleting old avatar:", deleteError);
            }
          } catch (deleteErr) {
            console.warn("Error deleting old avatar:", deleteErr);
          }
        }
      } else if (avatarFileToSave) {
        try {
          const maxSize = 5 * 1024 * 1024;
          if (avatarFileToSave.size > maxSize) {
            throw new Error("Image file is too large. Maximum size is 5MB.");
          }

          const timestamp = Date.now();
          const fileExt = avatarFileToSave.name.split(".").pop() || "jpg";
          const path = `${user.id}/avatar-${timestamp}.${fileExt}`;

          const { error: uploadErr } = await supabase.storage
            .from("avatars")
            .upload(path, avatarFileToSave, {
              upsert: true,
              cacheControl: "3600",
              contentType: avatarFileToSave.type || `image/${fileExt}`,
            });

          if (uploadErr) {
            let errorMessage = "Failed to upload avatar image";
            if (uploadErr.message) {
              errorMessage = uploadErr.message;
              if (uploadErr.message.includes("413") || uploadErr.message.includes("too large")) {
                errorMessage = "Image file is too large. Please choose a smaller image.";
              } else if (
                uploadErr.message.includes("401") ||
                uploadErr.message.includes("403") ||
                uploadErr.message.includes("permission") ||
                uploadErr.message.includes("unauthorized")
              ) {
                errorMessage = "Permission denied. Please check your account permissions.";
              } else if (
                uploadErr.message.includes("duplicate") ||
                uploadErr.message.includes("already exists")
              ) {
                // continue to get URL
              } else {
                errorMessage = `Upload failed: ${uploadErr.message}`;
              }
            }
            if (
              !uploadErr.message?.includes("duplicate") &&
              !uploadErr.message?.includes("already exists")
            ) {
              throw new Error(errorMessage);
            }
          }

          const { data: pubData } = supabase.storage.from("avatars").getPublicUrl(path);
          if (!pubData?.publicUrl) {
            throw new Error("Failed to get public URL for uploaded image");
          }
          avatar_url = pubData.publicUrl;
          await new Promise((resolve) => setTimeout(resolve, 500));
        } catch (uploadError: any) {
          throw new Error(
            uploadError.message || "Failed to upload profile image. Please try again."
          );
        }
      }

      const usernameValue = usernameToSave.trim() || null;
      const displayNameValue = displayNameToSave.trim() || null;

      await updateUser({
        profile: {
          ...(user.profile || {}),
          avatar_url: avatar_url,
          username: usernameValue,
          display_name: displayNameValue,
        } as any,
      });

      profileMutate();

      if (data) {
        setUsername(usernameToSave);
        setDisplayName(displayNameToSave);
        setAvatarFile(avatarFileToSave);
      }

      setAvatarKey((prev) => prev + 1);
      onSaveSuccess();
      setAvatarFile(null);
    } catch (e: any) {
      setError(e?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return {
    saving,
    error,
    setError,
    avatarFile,
    setAvatarFile,
    avatarKey,
    username,
    setUsername,
    displayName,
    setDisplayName,
    handleSaveProfile,
  };
}
