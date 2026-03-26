type AuthAction = "login" | "register";

function normalizeRawMessage(raw: string): string {
  return raw
    .replace(/^AuthApiError:\s*/i, "")
    .replace(/^Error:\s*/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function getClearAuthMessage(rawMessage: string | null | undefined, action: AuthAction): string {
  const fallback =
    action === "login"
      ? "We could not sign you in right now. Please try again."
      : "We could not create your account right now. Please try again.";

  if (!rawMessage) return fallback;

  const normalized = normalizeRawMessage(rawMessage);
  const lower = normalized.toLowerCase();

  if (
    lower.includes("invalid login credentials") ||
    lower.includes("invalid email or password") ||
    lower.includes("invalid_grant")
  ) {
    return "Incorrect email or password. Please check your details and try again.";
  }

  if (lower.includes("email not confirmed") || lower.includes("not confirmed")) {
    return "Please verify your email before signing in. Check your inbox for the confirmation link.";
  }

  if (
    lower.includes("already in use") ||
    lower.includes("already registered") ||
    lower.includes("already exists") ||
    lower.includes("user_exists") ||
    lower.includes("duplicate")
  ) {
    return "This email is already registered. Log in or use a different email address.";
  }

  if (
    lower.includes("failed to fetch") ||
    lower.includes("network") ||
    lower.includes("fetch") ||
    lower.includes("status of 400") ||
    lower.includes("token")
  ) {
    return "We could not reach authentication services. Please check your connection and try again.";
  }

  if (lower.includes("too many requests") || lower.includes("rate limit")) {
    return "Too many attempts. Please wait a moment before trying again.";
  }

  if (lower.includes("password") && (lower.includes("weak") || lower.includes("requirements"))) {
    return "Your password does not meet the minimum requirements.";
  }

  return normalized || fallback;
}
