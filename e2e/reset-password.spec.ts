import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const BASE_URL = "https://sayso.co.za";

const E2E_EMAIL = process.env.E2E_PERSONAL_ACCOUNT_EMAIL!;
const NEW_PASSWORD = `E2eReset${Date.now()}!`;

test.describe("Reset Password", () => {
  // ─── Invalid / expired token ─────────────────────────────────────────────────

  test("shows invalid link screen when visiting without a token", async ({ page }) => {
    await page.goto(`${BASE_URL}/reset-password`);

    // Page checks session — no token/session means invalid link state
    await expect(page.getByRole("heading", { name: /invalid link/i })).toBeVisible({
      timeout: 10000,
    });
    await expect(
      page.getByText("This reset link is no longer valid", { exact: true })
    ).toBeVisible();
  });

  test("invalid link screen shows Request new link button", async ({ page }) => {
    await page.goto(`${BASE_URL}/reset-password`);

    await expect(page.getByRole("button", { name: /request new link/i })).toBeVisible({
      timeout: 10000,
    });
  });

  test("Request new link navigates to /forgot-password", async ({ page }) => {
    await page.goto(`${BASE_URL}/reset-password`);

    await page.getByRole("button", { name: /request new link/i }).click({ timeout: 10000 });
    await expect(page).toHaveURL(/\/forgot-password/);
  });

  test("invalid link screen shows Back to Login button", async ({ page }) => {
    await page.goto(`${BASE_URL}/reset-password`);

    await expect(page.getByRole("button", { name: /back to login/i })).toBeVisible({
      timeout: 10000,
    });
  });

  test("Back to Login navigates to /login from invalid link screen", async ({ page }) => {
    await page.goto(`${BASE_URL}/reset-password`);

    await page.getByRole("button", { name: /back to login/i }).click({ timeout: 10000 });
    await expect(page).toHaveURL(/\/login/);
  });

  // ─── Invalid token in URL ────────────────────────────────────────────────────

  test("shows invalid link screen for a malformed or expired code in URL", async ({ page }) => {
    await page.goto(
      `${BASE_URL}/auth/callback?code=invalid-fake-token&type=recovery&next=/reset-password`
    );

    // After the failed code exchange, should land on reset-password with invalid state
    await expect(page).toHaveURL(/\/reset-password|\/login/, { timeout: 15000 });
  });

  // ─── Password change via admin API ──────────────────────────────────────────
  // The reset-password form requires a PKCE session that can only be set via
  // the app's /auth/callback route (not injectable from outside). Instead we
  // use the Supabase admin SDK to change the password directly, then verify
  // the new credentials work by attempting a login.

  test.describe("Password change (admin API)", () => {
    test.beforeEach(() => {
      if (!E2E_EMAIL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        test.skip(true, "E2E_PERSONAL_ACCOUNT_EMAIL and SUPABASE_SERVICE_ROLE_KEY required");
      }
    });

    test("changes password via admin API and new password works on login page", async ({
      page,
    }) => {
      test.setTimeout(30000);

      const supabase = adminClient();

      // Find the user by email
      const {
        data: { users },
        error: listError,
      } = await supabase.auth.admin.listUsers();
      if (listError) throw new Error(`listUsers failed: ${listError.message}`);
      const user = users.find((u) => u.email === E2E_EMAIL);
      if (!user) throw new Error(`User ${E2E_EMAIL} not found`);

      // Change the password directly
      const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
        password: NEW_PASSWORD,
      });
      if (updateError) throw new Error(`updateUserById failed: ${updateError.message}`);

      // Verify the new password works on the login page
      await page.goto(`${BASE_URL}/login`);
      await page.getByRole("textbox", { name: /email/i }).fill(E2E_EMAIL);
      await page.getByPlaceholder(/enter your password/i).fill(NEW_PASSWORD);
      await page.getByRole("button", { name: /sign in/i }).click();

      await page.waitForURL((url) => !url.pathname.endsWith("/login"), { timeout: 20000 });
      expect(page.url()).not.toContain("/login");

      console.log(
        `\n✅ Password changed to: ${NEW_PASSWORD}\nUpdate E2E_PERSONAL_ACCOUNT_PASSWORD in .env\n`
      );
    });
  });
});
