export const FONT = "'Urbanist', -apple-system, BlinkMacSystemFont, system-ui, sans-serif";

export const ICON_CHIP_CLASS =
  "inline-flex items-center justify-center rounded-full bg-off-white/80 text-charcoal/85 transition-colors duration-200 hover:bg-off-white/90";

export const SMALL_ICON_CHIP_CLASS = `${ICON_CHIP_CLASS} h-6 w-6`;

export const ERROR_CODE_MESSAGES: Record<string, string> = {
  NOT_AUTHENTICATED: "Please log in to claim this business.",
  MISSING_FIELDS: "Please fill in all required details.",
  INVALID_EMAIL: "Please enter a valid email address.",
  INVALID_PHONE: "Please enter a valid phone number.",
  EMAIL_DOMAIN_MISMATCH:
    "This email doesn't match the business website domain. Use an official business email.",
  DUPLICATE_CLAIM: "You already have a claim in progress for this business.",
  ALREADY_OWNER: "You already own this business.",
  BUSINESS_NOT_FOUND: "We couldn't find that business. Please try again.",
  RLS_BLOCKED: "We couldn't process your claim right now. Please try again.",
  DB_ERROR: "We couldn't process your claim right now. Please try again.",
  SERVER_ERROR: "Something went wrong on our side. Please try again.",
};

export const OTP_SEND_ERROR_MESSAGES: Record<string, string> = {
  OTP_SEND_RATE_LIMITED: "Too many OTP requests. Please try again later.",
  PHONE_VERIFICATION_UNAVAILABLE: "Business phone verification is not available.",
  CLAIM_NOT_FOUND: "Claim not found. Please restart the claim flow.",
  FORBIDDEN: "You can only verify your own claim.",
};
