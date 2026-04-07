import { test, expect } from "@playwright/test";

const BASE_URL = "https://sayso.co.za";

test.describe("Forgot Password", () => {
  // ─── Page loads correctly ───────────────────────────────────────────────────

  test("shows forgot password form correctly", async ({ page }) => {
    await page.goto(`${BASE_URL}/forgot-password`);

    await expect(page.getByRole("textbox", { name: /email/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /send reset/i })).toBeVisible();
    // Back button is icon-only link (first /login link on page)
    await expect(page.locator('a[href="/login"]').first()).toBeVisible();
  });

  test("navigates from login forgot-password link", async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.getByRole("link", { name: /forgot password/i }).click();
    await expect(page).toHaveURL(/\/forgot-password/);
    await expect(page.getByRole("textbox", { name: /email/i })).toBeVisible();
  });

  // ─── Validation ─────────────────────────────────────────────────────────────

  test("submit button is disabled with empty email", async ({ page }) => {
    await page.goto(`${BASE_URL}/forgot-password`);
    await expect(page.getByRole("button", { name: /send reset/i })).toBeDisabled();
  });

  test("shows validation error for invalid email format", async ({ page }) => {
    await page.goto(`${BASE_URL}/forgot-password`);

    const emailInput = page.getByRole("textbox", { name: /email/i });
    await emailInput.fill("notanemail");
    await emailInput.blur();

    await expect(page.getByText(/valid email|invalid email/i)).toBeVisible({ timeout: 5000 });
  });

  // ─── Success flow ────────────────────────────────────────────────────────────

  test("submits successfully and shows email sent confirmation", async ({ page }) => {
    test.setTimeout(30000);

    // Use a unique email each run to avoid Supabase rate-limiting (same UI response for any email)
    const testEmail = `reset-test-${Date.now()}@nonexistent-domain.com`;

    await page.goto(`${BASE_URL}/forgot-password`);

    await page.getByRole("textbox", { name: /email/i }).fill(testEmail);
    await page.getByRole("button", { name: /send reset/i }).click();

    // Should show the success screen
    await expect(page.getByRole("heading", { name: "Email sent" })).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(testEmail)).toBeVisible();
    await expect(page.getByText(/reset link expires/i)).toBeVisible();
  });

  test("success screen has back-to-login button that navigates to /login", async ({ page }) => {
    test.setTimeout(30000);

    const testEmail = `reset-test-${Date.now()}@nonexistent-domain.com`;

    await page.goto(`${BASE_URL}/forgot-password`);

    await page.getByRole("textbox", { name: /email/i }).fill(testEmail);
    await page.getByRole("button", { name: /send reset/i }).click();

    await expect(page.getByRole("heading", { name: "Email sent" })).toBeVisible({ timeout: 15000 });

    await page.getByRole("button", { name: /back to login/i }).click();
    await expect(page).toHaveURL(/\/login/);
  });

  // ─── Non-existent email (Supabase returns success for security) ─────────────

  test("shows success screen for non-existent email (email enumeration protection)", async ({
    page,
  }) => {
    test.setTimeout(30000);

    await page.goto(`${BASE_URL}/forgot-password`);

    await page.getByRole("textbox", { name: /email/i }).fill("nobody123@nonexistent.com");
    await page.getByRole("button", { name: /send reset/i }).click();

    // Supabase does not reveal whether email exists — always shows success
    await expect(page.getByRole("heading", { name: "Email sent" })).toBeVisible({ timeout: 15000 });
  });
});
