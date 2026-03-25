# Personal User Authentication — Test Results

**Date:** 2026-03-25
**Tester:** Claude Code (Playwright MCP + manual observation)
**Environment:** Production — https://www.sayso.co.za
**Test account:** hjnengare@gmail.com
**Browser:** Chromium (Desktop Chrome)
**Gmail MCP status:** Not yet approved — email verification flow tested manually, documented as pending

---

## Summary

| Category | Tests Run | Passed | Failed | Bugs Found |
|----------|-----------|--------|--------|------------|
| Registration | 4 | 2 | 2 | 2 |
| Login | 4 | 3 | 1 | 1 |
| Forgot Password | 1 | 1 | 0 | 1 (cosmetic) |
| Unauthenticated Access | 2 | 2 | 0 | 0 |
| **Total** | **11** | **8** | **3** | **4** |

---

## Bugs Found

### 🔴 BUG-001 — Username taken: no error message shown
**Severity:** High
**Page:** `/register`
**Steps to reproduce:**
1. Go to `/register`
2. Enter a username that is already taken (e.g. `hjnengare`)
3. Fill in email, password, check terms

**Expected:** Error message below username field explaining it is already taken
**Actual:** Username field shows a red error icon only. No text. Submit button stays disabled with zero explanation. User has no idea why they cannot proceed.
**Screenshot:** `test-03-username-taken-error.png`

---

### 🔴 BUG-002 — Duplicate email shows generic error instead of recovery screen
**Severity:** High
**Page:** `/register`
**Steps to reproduce:**
1. Go to `/register`
2. Enter a unique username, existing email (`hjnengare@gmail.com`), valid password, check terms
3. Click "Create account"

**Expected:** "Account Already Exists" screen with "Switch to Login" and "Try Different Email" buttons
**Actual:** Generic toast — "Registration failed. Please try again." — with no recovery action
**Console log:** `Email already registered for a Personal account` — detection works, UI does not surface it correctly
**Screenshot:** `test-04-duplicate-email-error.png`

---

### 🔴 BUG-003 — Unverified account login shows wrong error
**Severity:** High
**Page:** `/login`
**Steps to reproduce:**
1. Register a new account with a real email
2. Do NOT verify email
3. Try to log in with correct credentials

**Expected:** Redirect to email verification page OR clear message "Please verify your email before logging in"
**Actual:** "Incorrect email or password. Please try again." — misleading, implies wrong credentials when the real issue is unverified email
**Console log:** Supabase returns 400 — but the UI maps all 400s to the same generic password error
**Screenshot:** `test-05-wrong-password.png`

---

### 🟡 BUG-004 — Hyphenated word break on forgot password page
**Severity:** Low (cosmetic)
**Page:** `/forgot-password`
**Steps to reproduce:**
1. Go to `/forgot-password`
2. Observe the body copy

**Expected:** "Enter the email address associated with your account and we'll send you a link to reset your password."
**Actual:** "ac-count" is broken mid-word due to CSS word-break or container overflow
**Screenshot:** `test-06-forgot-password.png`

---

## Full Test Results

### Registration

| # | Test | Result | Notes |
|---|------|--------|-------|
| R-01 | Form renders with Personal Account selected by default | ✅ PASS | All fields visible, submit disabled on empty form |
| R-02 | Submit disabled without terms consent | ✅ PASS | Confirmed `[disabled]` attribute on button |
| R-03 | Username already taken — validation feedback | ❌ FAIL | Red icon only, no message — BUG-001 |
| R-04 | Duplicate email — recovery screen | ❌ FAIL | Generic toast instead of recovery UI — BUG-002 |

---

### Login

| # | Test | Result | Notes |
|---|------|--------|-------|
| L-01 | Login form renders correctly | ✅ PASS | Email, Password, Forgot password, Sign in, Google SSO all present |
| L-02 | Wrong password shows error | ✅ PASS | "Incorrect email or password. Please try again." shown inline + toast |
| L-03 | Unverified account login | ❌ FAIL | Shows wrong error message — BUG-003 |
| L-04 | Tab switching Login ↔ Register | ✅ PASS | Heading, fields and buttons update correctly on tab switch |

---

### Forgot Password

| # | Test | Result | Notes |
|---|------|--------|-------|
| FP-01 | Page loads and form renders | ✅ PASS | Email field, Send reset link button, Sign in link all present |
| FP-02 | Copy text rendering | ⚠️ COSMETIC | "ac-count" hyphenated mid-word — BUG-004 |

---

### Unauthenticated Access

| # | Test | Result | Notes |
|---|------|--------|-------|
| U-01 | `/home` redirects to `/onboarding` | ✅ PASS | Redirect fires correctly |
| U-02 | Onboarding page has correct CTAs | ✅ PASS | Get Started, Log In, Create Account all present and correctly linked |

---

## Pending Tests (requires Gmail MCP approval)

The following tests could not be completed because the Gmail MCP server has not yet been approved in `/mcp`. Once approved, these should be run:

| # | Test | Requires |
|---|------|---------|
| EV-01 | Registration sends verification email | Gmail MCP — read inbox |
| EV-02 | Verification email contains correct link | Gmail MCP — parse email body |
| EV-03 | Clicking verification link activates account | Gmail MCP + Playwright |
| EV-04 | Login succeeds after email verification | Gmail MCP + Playwright |
| EV-05 | Verified account lands on correct page post-login | Gmail MCP + Playwright |
| FP-03 | Password reset email is received | Gmail MCP — read inbox |
| FP-04 | Reset link navigates to reset password page | Gmail MCP + Playwright |
| FP-05 | Password can be changed via reset flow | Gmail MCP + Playwright |

**To enable:** Restart VS Code → open `/mcp` → approve the `gmail` server.

---

## Recommendations

| Priority | Action |
|----------|--------|
| 🔴 High | BUG-003: Detect unverified email on login (Supabase returns specific error code) and redirect to `/verify-email` |
| 🔴 High | BUG-002: Ensure `existingAccountError` state is triggered on duplicate email — check why it's not firing on production |
| 🔴 High | BUG-001: Show inline error text below username field when username is taken |
| 🟡 Low | BUG-004: Add `hyphens: none` or `overflow-wrap: break-word` to forgot password copy container |
