import { test, expect, Page } from "@playwright/test";

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || "http://localhost:3000";
const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL!;
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD!;
const PERSONAL_EMAIL = process.env.E2E_PERSONAL_ACCOUNT_EMAIL!;
const PERSONAL_PASSWORD = process.env.E2E_PERSONAL_ACCOUNT_PASSWORD!;

async function loginAs(
  page: Page,
  email: string,
  password: string,
  accountType: "personal" | "business" = "personal"
) {
  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState("networkidle");
  if (accountType === "business") {
    await page.getByRole("button", { name: "Business Account" }).click();
    await page.waitForTimeout(300);
  }
  await page.getByRole("textbox", { name: /email/i }).first().fill(email);
  await page.getByRole("textbox", { name: "Password" }).fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  // Wait until we navigate away from /login
  await page.waitForURL((url) => !url.pathname.endsWith("/login"), { timeout: 20000 });
  // Let auth context and any post-login redirects settle
  await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {});
}

test.describe("Submit new business", () => {
  test.beforeEach(async ({ page }) => {
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
      test.skip(true, "E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD required");
      return;
    }
    await loginAs(page, ADMIN_EMAIL, ADMIN_PASSWORD);
  });

  test("fills and submits the add-business form", async ({ page }) => {
    test.setTimeout(60000);
    const uniqueName = `E2E Business ${Date.now()}`;

    await page.goto(`${BASE_URL}/add-business`);
    await page
      .getByRole("heading", { name: "Create Business Profile" })
      .waitFor({ state: "visible", timeout: 15000 });

    // Business name
    await page.getByRole("textbox", { name: "Enter business name" }).fill(uniqueName);

    // Main category
    await page.getByRole("button", { name: /select a main category/i }).click();
    await page.getByRole("option", { name: "Food & Drink" }).click();

    // Subcategory
    await page.getByRole("button", { name: /select a subcategory/i }).click();
    await page.getByRole("option", { name: "Restaurants" }).click();

    // Business type — required after subcategory is chosen
    await page.getByRole("button", { name: /Physical Location/i }).click();

    // Description
    await page.getByPlaceholder("Describe your business...").fill("E2E automated test business");

    // Location
    await page.getByPlaceholder(/e\.g\., Cape Town/i).fill("Cape Town, V&A Waterfront");

    // Contact
    await page.getByPlaceholder("+27 21 123 4567").fill("+27 21 555 0100");
    await page.getByPlaceholder("business@example.com").fill("e2e-test@example.com");
    await page.getByPlaceholder("https://www.example.com").fill("https://e2e-test.example.com");

    // Apply Standard hours preset
    await page.getByRole("button", { name: /Standard/i }).click();

    // Submit
    await page.getByRole("button", { name: "Create Business Profile" }).click();

    // Expect redirect to /my-businesses and business listed
    await expect(page).toHaveURL(/\/my-businesses/, { timeout: 20000 });
    await expect(
      page.getByRole("button", { name: new RegExp(`View ${uniqueName} details`) })
    ).toBeVisible({ timeout: 10000 });
  });

  test("shows validation errors on empty submit", async ({ page }) => {
    await page.goto(`${BASE_URL}/add-business`);
    await page
      .getByRole("heading", { name: "Create Business Profile" })
      .waitFor({ state: "visible", timeout: 15000 });

    // Trigger validation by blurring the name field without filling it
    await page.getByRole("textbox", { name: "Enter business name" }).focus();
    await page.getByRole("textbox", { name: "Enter business name" }).blur();

    await expect(page.getByText("Please enter your business name")).toBeVisible({ timeout: 5000 });
  });
});

test.describe("Submit new event", () => {
  test.beforeEach(async ({ page }) => {
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
      test.skip(true, "E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD required");
      return;
    }
    await loginAs(page, ADMIN_EMAIL, ADMIN_PASSWORD);
  });

  test("fills and submits the add-event form", async ({ page }) => {
    test.setTimeout(60000);
    const uniqueTitle = `E2E Test Event ${Date.now()}`;

    await page.goto(`${BASE_URL}/add-event`);
    await page
      .getByRole("heading", { name: "Create Event" })
      .waitFor({ state: "visible", timeout: 15000 });
    await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {});

    // Title
    await page.getByPlaceholder("Friday Networking Session").fill(uniqueTitle);

    // Start date (datetime-local input) — blur to trigger React onChange
    const dateInput = page.locator('input[type="datetime-local"]').first();
    await dateInput.fill("2026-06-15T18:00");
    await dateInput.dispatchEvent("change");

    // Location
    await page
      .getByPlaceholder("City, venue, or branch location")
      .fill("Cape Town, V&A Waterfront");

    // Let React flush all state updates
    await page.waitForTimeout(500);

    // Start watching for the API response before clicking submit
    const responsePromise = page
      .waitForResponse(
        (resp) =>
          resp.url().includes("/api/events-and-specials") && resp.request().method() === "POST",
        { timeout: 20000 }
      )
      .catch(() => null);

    // Submit via requestSubmit to bypass any Framer Motion click interference
    await page
      .locator("form")
      .first()
      .evaluate((el) => (el as HTMLFormElement).requestSubmit());

    const apiResponse = await responsePromise;
    if (!apiResponse) {
      throw new Error(
        "Form submit did not trigger POST /api/events-and-specials — check validation errors"
      );
    }
    expect(
      apiResponse.status(),
      `API returned ${apiResponse.status()}: ${await apiResponse.text().catch(() => "")}`
    ).toBe(201);

    // Wait for success toast then redirect (form redirects after 650ms delay)
    await expect(page.getByText("Event published successfully")).toBeVisible({ timeout: 10000 });
    await expect(page).toHaveURL(/\/events-specials|\/my-businesses/, { timeout: 10000 });
  });

  test("shows validation errors on empty submit", async ({ page }) => {
    await page.goto(`${BASE_URL}/add-event`);
    await page
      .getByRole("heading", { name: "Create Event" })
      .waitFor({ state: "visible", timeout: 15000 });

    // Submit without filling anything
    await page.getByRole("button", { name: "Publish Event" }).click();

    // The form marks all fields as touched and shows per-field errors + a toast
    await expect(page.getByText("Please add a title.")).toBeVisible({ timeout: 5000 });
    await expect(
      page.getByText("Please fix the highlighted fields before publishing.")
    ).toBeVisible({ timeout: 5000 });
  });
});

test.describe("Submit new special", () => {
  test("restricts access for non-business-owner accounts", async ({ page }) => {
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
      test.skip(true, "E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD required");
      return;
    }
    await loginAs(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    await page.goto(`${BASE_URL}/add-special`);
    await page.waitForTimeout(3000);

    // Admin does not have business_owner role — restriction gate should be shown
    await expect(
      page.getByRole("heading", { name: /special creation is restricted/i })
    ).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole("link", { name: /verify business access/i })).toBeVisible();
  });

  test("fills and submits the add-special form as business owner", async ({ page }) => {
    test.setTimeout(60000);

    const businessOwnerEmail = process.env.E2E_BUSINESS_ACCOUNT_EMAIL || PERSONAL_EMAIL;
    const businessOwnerPassword = process.env.E2E_BUSINESS_ACCOUNT_PASSWORD || PERSONAL_PASSWORD;

    if (!businessOwnerEmail || !businessOwnerPassword) {
      test.skip(true, "No business owner credentials available — set E2E_BUSINESS_ACCOUNT_EMAIL");
      return;
    }

    await loginAs(page, businessOwnerEmail, businessOwnerPassword, "business");
    await page.goto(`${BASE_URL}/add-special`);

    // Wait for auth to fully resolve — either the form or the restriction gate will appear
    await Promise.race([
      page
        .getByRole("heading", { name: "Create Special" })
        .waitFor({ state: "visible", timeout: 20000 }),
      page
        .getByRole("heading", { name: /special creation is restricted/i })
        .waitFor({ state: "visible", timeout: 20000 }),
    ]).catch(() => {});

    // Skip if this account lacks business_owner role
    const isRestricted = await page
      .getByRole("heading", { name: /special creation is restricted/i })
      .isVisible()
      .catch(() => false);
    if (isRestricted) {
      test.skip(true, "Account does not have business_owner role — skipping special submission");
      return;
    }

    await page
      .getByRole("heading", { name: "Create Special" })
      .waitFor({ state: "visible", timeout: 5000 });

    // Title
    const uniqueSpecialTitle = `E2E Test Special ${Date.now()}`;
    await page.getByPlaceholder(/2-for-1 Brunch Special/i).fill(uniqueSpecialTitle);

    // Start date
    await page.locator('input[type="datetime-local"]').first().fill("2026-06-20T12:00");

    // Location
    await page.getByPlaceholder("City, venue, or branch location").fill("Cape Town, City Bowl");

    // Submit
    await page.getByRole("button", { name: /publish special/i }).click();

    await expect(page.getByText("Special published successfully")).toBeVisible({ timeout: 10000 });
    await expect(page).toHaveURL(/\/my-businesses|\/events-specials/, { timeout: 10000 });
  });
});
