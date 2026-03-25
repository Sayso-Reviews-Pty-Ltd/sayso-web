import { test, expect } from '@playwright/test';

const BASE_URL = 'https://sayso.co.za';
const existingEmail = process.env.E2E_PERSONAL_ACCOUNT_EMAIL!;
const existingPassword = process.env.E2E_PERSONAL_ACCOUNT_PASSWORD!;

test.describe('Personal User Authentication', () => {
  test.beforeEach(async ({ page }) => {
    if (!existingEmail || !existingPassword) {
      test.skip(true, 'E2E_PERSONAL_ACCOUNT_EMAIL and E2E_PERSONAL_ACCOUNT_PASSWORD required');
    }
  });

  // ─── Registration ──────────────────────────────────────────────────────────

  test.describe('Registration', () => {
    test('shows registration form with personal account selected by default', async ({ page }) => {
      await page.goto(`${BASE_URL}/register`);

      const personalBtn = page.getByRole('button', { name: /personal account/i });
      await expect(personalBtn).toBeVisible();
      await expect(personalBtn).toHaveClass(/bg-navbar-bg/);

      await expect(page.getByRole('button', { name: /register/i })).toBeVisible();
      await expect(page.getByRole('textbox', { name: /username/i })).toBeVisible();
      await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible();
    });

    test('shows validation errors on empty submit', async ({ page }) => {
      await page.goto(`${BASE_URL}/register`);

      const submitBtn = page.getByRole('button', { name: /create account/i });
      await expect(submitBtn).toBeDisabled();
    });

    test('blocks submit without terms consent', async ({ page }) => {
      await page.goto(`${BASE_URL}/register`);

      await page.getByRole('textbox', { name: /username/i }).fill(`testuser${Date.now()}`);
      await page.getByRole('textbox', { name: /email/i }).fill(`test${Date.now()}@example.com`);
      await page.getByPlaceholder(/create a password/i).fill('StrongPass123!');

      // consent not checked — submit should remain disabled
      await expect(page.getByRole('button', { name: /create account/i })).toBeDisabled();
    });

    test('shows duplicate email error for existing account', async ({ page }) => {
      await page.goto(`${BASE_URL}/register`);

      await page.getByRole('textbox', { name: /username/i }).fill(`dupuser${Date.now()}`);
      await page.getByRole('textbox', { name: /email/i }).fill(existingEmail);
      await page.getByPlaceholder(/create a password/i).fill('StrongPass123!');
      await page.getByRole('checkbox').check();

      await page.getByRole('button', { name: /create account/i }).click();

      await expect(
        page.getByText(/account already exists|email already registered/i)
      ).toBeVisible({ timeout: 15000 });
    });

    test('switch to login from duplicate email error screen', async ({ page }) => {
      await page.goto(`${BASE_URL}/register`);

      await page.getByRole('textbox', { name: /username/i }).fill(`dupuser${Date.now()}`);
      await page.getByRole('textbox', { name: /email/i }).fill(existingEmail);
      await page.getByPlaceholder(/create a password/i).fill('StrongPass123!');
      await page.getByRole('checkbox').check();

      await page.getByRole('button', { name: /create account/i }).click();
      await expect(page.getByRole('button', { name: /switch to login/i })).toBeVisible({ timeout: 15000 });

      await page.getByRole('button', { name: /switch to login/i }).click();
      await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
    });

    test('registers a new personal account successfully', async ({ page }) => {
      test.setTimeout(60000);

      const uniqueUsername = `e2euser${Date.now()}`;
      const uniqueEmail = `e2e+${Date.now()}@hjnengare.gmail.com`;

      await page.goto(`${BASE_URL}/register`);

      await page.getByRole('textbox', { name: /username/i }).fill(uniqueUsername);
      await page.getByRole('textbox', { name: /email/i }).fill(uniqueEmail);
      await page.getByPlaceholder(/create a password/i).fill('StrongPass123!');
      await page.getByRole('checkbox').check();

      await page.getByRole('button', { name: /create account/i }).click();

      // Should redirect away from register on success
      await page.waitForURL((url) => !url.pathname.endsWith('/register'), { timeout: 30000 });
    });
  });

  // ─── Login ─────────────────────────────────────────────────────────────────

  test.describe('Login', () => {
    test('shows login form correctly', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);

      await expect(page.getByRole('button', { name: /personal account/i })).toBeVisible();
      await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible();
      await expect(page.getByPlaceholder(/enter your password/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /forgot password/i })).toBeVisible();
    });

    test('shows error with wrong password', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);

      await page.getByRole('textbox', { name: /email/i }).fill(existingEmail);
      await page.getByPlaceholder(/enter your password/i).fill('wrongpassword123');
      await page.getByRole('button', { name: /sign in/i }).click();

      await expect(
        page.locator('form').getByText(/incorrect email or password/i)
      ).toBeVisible({ timeout: 10000 });
    });

    test('shows error with unregistered email', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);

      await page.getByRole('textbox', { name: /email/i }).fill('nobody@nonexistent.com');
      await page.getByPlaceholder(/enter your password/i).fill('SomePass123!');
      await page.getByRole('button', { name: /sign in/i }).click();

      await expect(
        page.locator('form').getByText(/incorrect email or password/i)
      ).toBeVisible({ timeout: 10000 });
    });

    test('logs in successfully with valid credentials', async ({ page }) => {
      test.setTimeout(30000);

      await page.goto(`${BASE_URL}/login`);

      await page.getByRole('textbox', { name: /email/i }).fill(existingEmail);
      await page.getByPlaceholder(/enter your password/i).fill(existingPassword);
      await page.getByRole('button', { name: /sign in/i }).click();

      await page.waitForURL((url) => !url.pathname.endsWith('/login'), { timeout: 20000 });

      // Should land on home or onboarding — not on login
      expect(page.url()).not.toContain('/login');
    });

    test('redirects to originally requested page after login', async ({ page }) => {
      test.setTimeout(30000);

      await page.goto(`${BASE_URL}/login?redirect=/saved`);

      await page.getByRole('textbox', { name: /email/i }).fill(existingEmail);
      await page.getByPlaceholder(/enter your password/i).fill(existingPassword);
      await page.getByRole('button', { name: /sign in/i }).click();

      await page.waitForURL((url) => url.pathname.includes('/saved'), { timeout: 20000 });
    });

    test('can switch between login and register tabs', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);

      await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();

      await page.getByRole('button', { name: /^register$/i }).click();
      await expect(page.getByRole('button', { name: /create account/i })).toBeVisible();

      await page.getByRole('button', { name: /^login$/i }).click();
      await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
    });

    test('forgot password link navigates to correct page', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      await page.getByRole('link', { name: /forgot password/i }).click();
      await expect(page).toHaveURL(/\/forgot-password/);
    });
  });

  // ─── Onboarding Gate ───────────────────────────────────────────────────────

  test.describe('Unauthenticated Access', () => {
    test('redirects unauthenticated user from /home to /onboarding', async ({ page }) => {
      await page.goto(`${BASE_URL}/home`);
      await expect(page).toHaveURL(/\/onboarding/);
    });

    test('onboarding page has Get Started, Log In and Create Account links', async ({ page }) => {
      await page.goto(`${BASE_URL}/onboarding`);

      await expect(page.getByRole('link', { name: /get started/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /log in/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /create account/i })).toBeVisible();
    });

    test('search page is accessible without authentication', async ({ page }) => {
      await page.goto(`${BASE_URL}/search`);
      await expect(page).toHaveURL(/\/search/);
      await expect(page.getByRole('banner')).toBeVisible();
    });
  });
});
