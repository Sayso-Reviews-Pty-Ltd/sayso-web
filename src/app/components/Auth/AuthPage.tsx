"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useSearchParams } from "next/navigation";

import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { useScrollReveal } from "../../hooks/useScrollReveal";
import { usePasswordStrength, validatePassword } from "./Register/usePasswordStrength";
import { AuthPageView } from "./AuthPageView";

type AccountType = "personal" | "business";
type AuthMode = "login" | "register";

interface AuthPageProps {
  defaultAuthMode: AuthMode;
}

export default function AuthPage({ defaultAuthMode }: AuthPageProps) {
  const prefersReduced = usePrefersReducedMotion();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const searchParams = useSearchParams();

  const { register, login, isLoading: authLoading, error: authError } = useAuth();
  const { showToast } = useToast();

  const [accountType, setAccountType] = useState<AccountType>("personal");
  const [authMode, setAuthMode] = useState<AuthMode>(defaultAuthMode);


  const [personalUsername, setPersonalUsername] = useState("");
  const [businessUsername, setBusinessUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [consent, setConsent] = useState(false);

  const [usernameTouched, setUsernameTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const [mounted, setMounted] = useState(false);
  const [existingAccountError, setExistingAccountError] = useState(false);

  type UsernameAvailability = 'idle' | 'checking' | 'available' | 'taken';
  const [usernameAvailability, setUsernameAvailability] = useState<UsernameAvailability>('idle');
  const usernameCheckTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isLoading = authLoading;
  const isRegisterMode = authMode === "register";
  const isBusiness = accountType === "business";

  const passwordStrength = usePasswordStrength(password, email);

  useScrollReveal({ threshold: 0.1, rootMargin: "0px 0px -50px 0px", once: true });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle success messages from URL (e.g., cross-device email verification)
  useEffect(() => {
    const message = searchParams?.get("message");
    if (message) {
      // Decode the message and show as toast
      const decodedMessage = decodeURIComponent(message.replace(/\+/g, " "));
      showToast(decodedMessage, "sage", 8000);
      
      // Clean the URL
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.delete("message");
        window.history.replaceState({}, "", url.pathname + (url.search || ""));
      }
    }
  }, [searchParams, showToast]);

  useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(navigator.onLine);
    updateOnlineStatus();

    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);

    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, []);

  useEffect(() => {
    setError("");
    setExistingAccountError(false);
  }, [authMode]);

  useEffect(() => {
    // Switching account types: preserve email/password/consent — only reset username + errors
    setPersonalUsername("");
    setBusinessUsername("");
    setError("");
    setExistingAccountError(false);
    setUsernameTouched(false);
    setUsernameAvailability('idle');
    if (usernameCheckTimerRef.current) clearTimeout(usernameCheckTimerRef.current);
  }, [accountType]);

  const scheduleUsernameCheck = useCallback((value: string) => {
    if (usernameCheckTimerRef.current) clearTimeout(usernameCheckTimerRef.current);
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(value)) {
      setUsernameAvailability('idle');
      return;
    }
    setUsernameAvailability('checking');
    usernameCheckTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/username/check?username=${encodeURIComponent(value)}`);
        if (!res.ok) { setUsernameAvailability('idle'); return; }
        const data = await res.json();
        setUsernameAvailability(data.available ? 'available' : 'taken');
      } catch {
        setUsernameAvailability('idle');
      }
    }, 500);
  }, []);

  const resetFormState = () => {
    setPersonalUsername("");
    setBusinessUsername("");
    setEmail("");
    setPassword("");
    setConsent(false);
    setError("");
    setExistingAccountError(false);
    setUsernameTouched(false);
    setEmailTouched(false);
    setPasswordTouched(false);
    setUsernameAvailability('idle');
    if (usernameCheckTimerRef.current) clearTimeout(usernameCheckTimerRef.current);
  };

  const validateUsername = (value: string) => /^[a-zA-Z0-9_]{3,20}$/.test(value);
  const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const getUsernameError = () => {
    if (!usernameTouched) return "";
    const usernameValue = isBusiness ? businessUsername : personalUsername;
    if (!usernameValue) return "Username is required";
    if (usernameValue.length < 3) return "Username must be at least 3 characters";
    if (usernameValue.length > 20) return "Username must be less than 20 characters";
    if (!validateUsername(usernameValue)) {
      return "Username can only contain letters, numbers, and underscores";
    }
    if (usernameAvailability === 'taken') return "Username is already taken";
    return "";
  };

  const getEmailError = () => {
    if (!emailTouched) return "";
    if (!email) return "Email is required";
    if (!validateEmail(email)) return "Please enter a valid email address";
    return "";
  };

  const getPasswordError = () => {
    if (!passwordTouched) return "";
    if (!password) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters";
    return "";
  };

  const isFormDisabled = mounted ? submitting || isLoading : false;
  const isSubmitDisabled = mounted
    ? submitting ||
      isLoading ||
      (isRegisterMode
        ? !consent ||
          passwordStrength.score < 3 ||
          !email ||
          !password ||
          !validateEmail(email) ||
          usernameAvailability !== 'available' ||
          (isBusiness
            ? !businessUsername ||
              !validateUsername(businessUsername)
            : !personalUsername || !validateUsername(personalUsername))
        : !email ||
          !password ||
          !validateEmail(email))
    : true;

  const handleLogin = async () => {
    if (!email?.trim() || !password?.trim()) {
      setError("Complete all fields");
      showToast("All fields required", "warning", 2500);
      return;
    }

    if (!validateEmail(email.trim())) {
      const errorMsg = "Email invalid";
      setError(errorMsg);
      showToast(errorMsg, "warning", 2500);
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    const desiredRole = isBusiness ? "business_owner" : "user";
    const loggedInUser = await login(normalizedEmail, password, desiredRole);

    if (loggedInUser) {
      showToast("Welcome back", "sage", 2000);
      return;
    }

    const errorMsg = authError || "Incorrect email or password. Please try again.";
    setError(errorMsg);
    showToast(errorMsg, "error", 3000);
  };

  const handleRegister = async () => {
    const usernameValue = isBusiness ? businessUsername : personalUsername;

    if (!usernameValue?.trim() || !email?.trim() || !password?.trim()) {
      setError("Please fill in all fields");
      showToast("Please fill in all fields", "warning", 3000);
      return;
    }

    if (!validateUsername(usernameValue.trim())) {
      setError("Please enter a valid username");
      showToast("Please enter a valid username", "warning", 3000);
      return;
    }

    if (!validateEmail(email.trim())) {
      const msg = "Please enter a valid email address (e.g. name@example.com).";
      setError(msg);
      showToast("Please enter a valid email address.", "warning", 3000);
      return;
    }

    if (email.trim().length > 254) {
      const msg = "Email address is too long (maximum 254 characters).";
      setError(msg);
      showToast("Email address is too long.", "warning", 3000);
      return;
    }

    if (email.trim().includes("..") || email.trim().startsWith(".") || email.trim().endsWith(".")) {
      const msg = "Email address format is invalid.";
      setError(msg);
      showToast("Email address format is invalid.", "warning", 3000);
      return;
    }

    if (!consent) {
      setError("Please accept the Terms and Privacy Policy");
      showToast("Please accept the Terms and Privacy Policy", "warning", 3000);
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      showToast(passwordError, "warning", 4000);
      return;
    }

    if (passwordStrength.score < 3) {
      const msg = "Please create a stronger password";
      setError(msg);
      showToast(msg, "warning", 3000);
      return;
    }

    if (!isOnline) {
      const msg = "You're offline. Please check your connection and try again.";
      setError(msg);
      showToast(msg, "error", 4000);
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    const desiredRole = isBusiness ? "business_owner" : "user";
    const result = await register(
      normalizedEmail,
      password,
      usernameValue.trim(),
      desiredRole,
      undefined,
      consent
    );

    if (result.success) {
      resetFormState();
      showToast(
        isBusiness
          ? "Business account created! Check your email to confirm your account."
          : "Account created! Check your email to confirm your account.",
        "success",
        5000
      );
      return;
    }

    const registrationError = result.errorMessage;
    const registrationErrorCode = result.errorCode;

    if (registrationError) {
      const lower = registrationError.toLowerCase();
      if (lower.includes("fetch") || lower.includes("network")) {
        const msg =
          "Connection error. Please check your internet and try again.";
        setError(msg);
        showToast(msg, "error", 4000);
      } else if (
        registrationErrorCode === 'user_exists' ||
        registrationErrorCode === 'duplicate_account_type' ||
        lower.includes("already in use") ||
        lower.includes("already registered") ||
        lower.includes("already exists") ||
        lower.includes("email already") ||
        lower.includes("already taken") ||
        lower.includes("duplicate") ||
        lower.includes("user_exists")
      ) {
        setExistingAccountError(true);
        setError(registrationError);
        showToast(registrationError, "error", 4000);
      } else if (
        lower.includes("invalid email") ||
        (lower.includes("email address") && lower.includes("invalid"))
      ) {
        const msg =
          "Email address is invalid. Please use a valid address like name@example.com.";
        setError(msg);
        showToast(msg, "error", 4000);
      } else if (
        lower.includes("password") &&
        (lower.includes("weak") || lower.includes("requirements"))
      ) {
        const msg = "Password must be at least 6 characters long.";
        setError(msg);
        showToast(msg, "error", 4000);
      } else if (lower.includes("too many requests") || lower.includes("rate limit")) {
        const msg = "Too many attempts. Please wait a moment and try again.";
        setError(msg);
        showToast(msg, "error", 4000);
      } else {
        setError(registrationError);
        showToast(registrationError, "error", 4000);
      }
    } else {
      const msg = "Registration failed. Please try again.";
      setError(msg);
      showToast(msg, "error", 4000);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting || isLoading) return;

    setError("");
    setExistingAccountError(false);
    setSubmitting(true);

    try {
      if (isRegisterMode) {
        await handleRegister();
      } else {
        await handleLogin();
      }
    } catch (err: unknown) {
      console.error("Auth error:", err);
      const msg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setError(msg);
      showToast(msg, "error", 4000);
    } finally {
      setSubmitting(false);
    }
  };

  const title = isBusiness
    ? isRegisterMode
      ? "Register Your Business"
      : "Business Login"
    : isRegisterMode
      ? "Create Your Account"
      : "Welcome Back";

  const subtitle = isBusiness
    ? isRegisterMode
      ? "Register your business to manage your presence and connect with customers."
      : "Sign in to manage your business presence and respond to reviews."
    : isRegisterMode
      ? "Sign up today - share honest reviews, climb leaderboards, and rate any business!"
      : "Sign in to continue discovering sayso";

  const motionVariants = prefersReduced
    ? { initial: false, animate: { opacity: 1, y: 0 }, exit: { opacity: 1, y: 0 } }
    : { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -10 } };

  const handleSwitchToLogin = () => {
    setExistingAccountError(false);
    setError("");
    setAuthMode("login");
    setEmailTouched(true);
  };

  const handleTryDifferentEmail = () => {
    setExistingAccountError(false);
    setError("");
    setEmail("");
  };

  return (
    <AuthPageView
      containerRef={containerRef}
      prefersReduced={prefersReduced}
      title={title}
      subtitle={subtitle}
      accountType={accountType}
      authMode={authMode}
      existingAccountError={existingAccountError}
      usernameChecking={usernameAvailability === 'checking'}
      motionVariants={motionVariants}
      error={error}
      isOnline={isOnline}
      isRegisterMode={isRegisterMode}
      isBusiness={isBusiness}
      isFormDisabled={isFormDisabled}
      isSubmitDisabled={isSubmitDisabled}
      personalUsername={personalUsername}
      businessUsername={businessUsername}
      usernameTouched={usernameTouched}
      usernameError={getUsernameError()}
      email={email}
      emailTouched={emailTouched}
      emailError={getEmailError()}
      password={password}
      passwordTouched={passwordTouched}
      passwordError={getPasswordError()}
      passwordStrength={passwordStrength}
      consent={consent}
      onSetAccountType={setAccountType}
      onSetAuthMode={setAuthMode}
      onSwitchToLogin={handleSwitchToLogin}
      onTryDifferentEmail={handleTryDifferentEmail}
      onSubmit={handleSubmit}
      onPersonalUsernameChange={(value) => {
        setPersonalUsername(value);
        if (!usernameTouched) setUsernameTouched(true);
        scheduleUsernameCheck(value);
      }}
      onBusinessUsernameChange={(value) => {
        setBusinessUsername(value);
        if (!usernameTouched) setUsernameTouched(true);
        scheduleUsernameCheck(value);
      }}
      onUsernameBlur={() => setUsernameTouched(true)}
      onEmailChange={(value) => {
        setEmail(value);
        if (!emailTouched) setEmailTouched(true);
      }}
      onEmailBlur={() => setEmailTouched(true)}
      onPasswordChange={(value) => {
        setPassword(value);
        if (!passwordTouched) setPasswordTouched(true);
      }}
      onPasswordBlur={() => setPasswordTouched(true)}
      onConsentChange={setConsent}
    />
  );
}