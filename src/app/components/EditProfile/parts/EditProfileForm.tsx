"use client";

import React from "react";
import { m } from "framer-motion";
import { X, User, Upload } from "@/app/lib/icons";
import { Avatar, AvatarImage, AvatarFallback } from '@/app/components/ui/avatar';

interface EditProfileFormProps {
  username: string;
  displayName: string;
  avatarPreview: string | null;
  imgError: boolean;
  saving: boolean;
  error: string | null;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onUsernameChange: (value: string) => void;
  onDisplayNameChange: (value: string) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveAvatar: () => void;
  onUploadClick: () => void;
  onImgError: () => void;
  onSave: () => void;
  onClose: () => void;
}

export function EditProfileForm({
  username,
  displayName,
  avatarPreview,
  imgError,
  saving,
  error,
  fileInputRef,
  onUsernameChange,
  onDisplayNameChange,
  onFileSelect,
  onRemoveAvatar,
  onUploadClick,
  onImgError,
  onSave,
  onClose,
}: EditProfileFormProps) {
  return (
    <div className="relative z-10 px-2 py-6 sm:px-8 sm:py-8 md:px-10 md:py-10">
      {/* Title */}
      <h2
        className="text-2xl font-bold text-white mb-6"
        style={{ fontFamily: 'Urbanist, -apple-system, BlinkMacSystemFont, system-ui, sans-serif', fontWeight: 700 }}
      >
        Edit Profile
      </h2>

      {/* Error Message */}
      {error && (
        <div className="mb-4 bg-orange-50 border border-orange-200 rounded-[12px] p-4 text-center">
          <p className="text-caption font-semibold text-orange-600" style={{ fontFamily: 'Urbanist, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>{error}</p>
        </div>
      )}

      {/* Avatar Section */}
      <div className="mb-6">
        <label
          className="block text-sm font-semibold text-white mb-3"
          style={{ fontFamily: 'Urbanist, -apple-system, BlinkMacSystemFont, system-ui, sans-serif', fontWeight: 600 }}
        >
          Profile Picture
        </label>
        <div className="flex items-center gap-4">
          <m.div layoutId="profile-avatar" className="relative">
            <Avatar className="w-20 h-20 sm:w-24 sm:h-24 border-4 border-white shadow-lg ring-2 ring-sage/20">
              {avatarPreview && !imgError && (
                <AvatarImage
                  src={avatarPreview}
                  alt="Profile preview"
                  onError={onImgError}
                />
              )}
              <AvatarFallback
                delayMs={avatarPreview ? 200 : 0}
                className="bg-navbar-bg/90"
              >
                <User className="text-white/80" size={32} strokeWidth={2.5} />
              </AvatarFallback>
            </Avatar>
          </m.div>
          <div className="flex-1 flex gap-2">
            <button
              type="button"
              onClick={onUploadClick}
              disabled={saving}
              className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 border border-white/20"
              style={{ fontFamily: 'Urbanist, -apple-system, BlinkMacSystemFont, system-ui, sans-serif', fontWeight: 600 }}
            >
              <Upload className="w-4 h-4" />
              <span>Upload</span>
            </button>
            {avatarPreview && (
              <button
                type="button"
                onClick={onRemoveAvatar}
                disabled={saving}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 border border-white/20"
                style={{ fontFamily: 'Urbanist, -apple-system, BlinkMacSystemFont, system-ui, sans-serif', fontWeight: 600 }}
              >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline">Remove</span>
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onFileSelect}
            className="hidden"
            disabled={saving}
          />
        </div>
        <p className="text-xs text-white/70 mt-2" style={{ fontFamily: 'Urbanist, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
          Recommended: Square image, max 5MB
        </p>
      </div>

      {/* Username Field */}
      <div className="mb-6">
        <label
          htmlFor="username"
          className="block text-sm font-semibold text-white mb-2"
          style={{ fontFamily: 'Urbanist, -apple-system, BlinkMacSystemFont, system-ui, sans-serif', fontWeight: 600 }}
        >
          Username <span className="text-coral">*</span>
        </label>
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
            <User className="w-5 h-5" />
          </div>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => onUsernameChange(e.target.value)}
            placeholder="Choose a username"
            disabled={saving}
            className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-body font-medium text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontFamily: 'Urbanist, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
          />
        </div>
        <p className="text-xs text-white/70 mt-2" style={{ fontFamily: 'Urbanist, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
          3-20 characters, letters, numbers, underscores, and hyphens only
        </p>
      </div>

      {/* Display Name Field */}
      <div className="mb-6">
        <label
          htmlFor="displayName"
          className="block text-sm font-semibold text-white mb-2"
          style={{ fontFamily: 'Urbanist, -apple-system, BlinkMacSystemFont, system-ui, sans-serif', fontWeight: 600 }}
        >
          Display Name
        </label>
        <input
          id="displayName"
          type="text"
          value={displayName}
          onChange={(e) => onDisplayNameChange(e.target.value)}
          placeholder="Your display name (optional)"
          disabled={saving}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-body font-medium text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ fontFamily: 'Urbanist, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
        />
        <p className="text-xs text-white/70 mt-2" style={{ fontFamily: 'Urbanist, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
          This is how your name appears to others
        </p>
      </div>

      {/* Buttons */}
      <div className="pt-2 flex justify-center">
        <div className="w-full flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex-1 px-6 py-3 rounded-full text-sm font-semibold bg-white/10 hover:bg-white/20 text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-white/20"
            style={{ fontFamily: 'Urbanist, -apple-system, BlinkMacSystemFont, system-ui, sans-serif', fontWeight: 600 }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={saving || !username.trim()}
            className="flex-1 px-6 py-3 rounded-full text-sm font-semibold bg-gradient-to-r from-coral to-coral/80 hover:from-coral/90 hover:to-coral text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 btn-target btn-press"
            style={{ fontFamily: 'Urbanist, -apple-system, BlinkMacSystemFont, system-ui, sans-serif', fontWeight: 600 }}
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
