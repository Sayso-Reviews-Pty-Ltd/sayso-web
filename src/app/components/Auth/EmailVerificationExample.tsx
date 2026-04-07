"use client";

import React from "react";
import { useEmailVerification } from "../../hooks/useEmailVerification";
import EmailVerificationModal from "./EmailVerificationModal";

// Example component showing how to use email verification
export default function EmailVerificationExample() {
  const { checkEmailVerification, showModal, pendingAction, closeModal } = useEmailVerification();

  const handlePostReview = () => {
    if (checkEmailVerification("post a review")) {
      // Proceed with review posting logic
      console.log("User can post review - email verified");
    }
    // If email not verified, modal will show automatically
  };

  const handleSaveBusiness = () => {
    if (checkEmailVerification("save this business")) {
      // Proceed with saving business logic
      console.log("User can save business - email verified");
    }
    // If email not verified, modal will show automatically
  };

  const handleJoinLeaderboard = () => {
    if (checkEmailVerification("join the leaderboard")) {
      // Proceed with leaderboard logic
      console.log("User can join leaderboard - email verified");
    }
    // If email not verified, modal will show automatically
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold">Email Verification Example</h2>

      <button
        onClick={handlePostReview}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Post Review (Requires Email Verification)
      </button>

      <button
        onClick={handleSaveBusiness}
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
      >
        Save Business (Requires Email Verification)
      </button>

      <button
        onClick={handleJoinLeaderboard}
        className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
      >
        Join Leaderboard (Requires Email Verification)
      </button>

      {/* Email verification modal */}
      <EmailVerificationModal isOpen={showModal} onClose={closeModal} action={pendingAction} />
    </div>
  );
}
