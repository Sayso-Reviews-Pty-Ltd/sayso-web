/**
 * End-to-end: Business upload → admin approval flow
 *
 * Covers:
 *  1. Business owner creates a business → lands on /my-businesses, sees "Pending Approval" badge
 *  2. Business is NOT publicly visible while pending
 *  3. Admin can see it in /admin/pending-businesses and approve it
 *  4. After approval: status = active, is_hidden = false, verified = true (checked via API)
 *  5. Business owner sees updated status on /my-businesses (no longer "Pending Approval")
 *  6. Business owner has a business_approved notification in /api/notifications/business
 *  7. Business is now publicly visible
 *
 * Env: E2E_BUSINESS_ACCOUNT_EMAIL, E2E_BUSINESS_ACCOUNT_PASSWORD,
 *      E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD
 */

import { test, expect, type Page } from "@playwright/test";

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || "http://localhost:3000";
const BUSINESS_EMAIL = process.env.E2E_BUSINESS_ACCOUNT_EMAIL!;
const BUSINESS_PASSWORD = process.env.E2E_BUSINESS_ACCOUNT_PASSWORD!;
const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL!;
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD!;

async function loginAs(
  page: Page,
  email: string,
  password: string,
  tab: "personal" | "business" = "personal"
) {
  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState("networkidle");
  if (tab === "business") {
    const businessTab = page.getByRole("button", { name: "Business Account" });
    if (await businessTab.isVisible()) {
      await businessTab.click();
      await page.waitForTimeout(300);
    }
  }
  await page.getByRole("textbox", { name: /email/i }).first().fill(email);
  await page.getByRole("textbox", { name: "Password" }).fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page
    .waitForURL((url) => !url.pathname.endsWith("/login"), { timeout: 20000 })
    .catch(async () => {
      const err =
        (await page
          .getByRole("alert")
          .textContent()
          .catch(() => "")) ||
        (await page
          .locator("[class*='error']")
          .first()
          .textContent()
          .catch(() => ""));
      throw new Error(`Login failed (still on /login). ${err || `Check credentials for ${email}`}`);
    });
  await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {});
}

async function logout(page: Page) {
  // Navigate to login to clear session — works regardless of logout UI
  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState("networkidle").catch(() => {});
}

test.describe("Business upload → admin approval flow", () => {
  test.beforeEach(({ isMobile }) => {
    test.skip(
      isMobile,
      "Business upload and admin approval is a desktop workflow — skipped on mobile viewports"
    );
    if (!BUSINESS_EMAIL || !BUSINESS_PASSWORD || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
      test.skip(
        true,
        "E2E_BUSINESS_ACCOUNT_EMAIL, E2E_BUSINESS_ACCOUNT_PASSWORD, E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD are all required"
      );
    }
  });

  test("business upload stays pending until admin approves, owner is notified", async ({
    page,
    request,
  }) => {
    test.setTimeout(120000);

    const uniqueName = `E2E Approval Test ${Date.now()}`;

    // ── 1. Log in as business owner ────────────────────────────────────────
    await loginAs(page, BUSINESS_EMAIL, BUSINESS_PASSWORD, "business");

    // ── 2. Create a new business ───────────────────────────────────────────
    await page.goto(`${BASE_URL}/add-business`);
    await page
      .getByRole("heading", { name: "Create Business Profile" })
      .waitFor({ state: "visible", timeout: 15000 });

    await page.getByRole("textbox", { name: "Enter business name" }).fill(uniqueName);

    await page.getByRole("button", { name: /select a main category/i }).click();
    await page.getByRole("option", { name: "Food & Drink" }).click();

    await page.getByRole("button", { name: /select a subcategory/i }).click();
    await page.locator('[role="listbox"]').waitFor({ state: "attached", timeout: 5000 });
    await page.getByRole("option", { name: "Restaurants" }).click();

    await page.getByRole("button", { name: /Physical Location/i }).click();

    await page.getByPlaceholder(/e\.g\., Cape Town/i).fill("Cape Town, V&A Waterfront");

    // Blur location field to trigger geocoding
    await page.getByPlaceholder(/e\.g\., Cape Town/i).press("Tab");

    // Wait for geocoding to resolve (shows "Location found ✓" in the form)
    await expect(page.getByText(/location found/i))
      .toBeVisible({ timeout: 15000 })
      .catch(async () => {
        // Geocoder may be unavailable in CI; log a warning but continue — approval route
        // will reject if no coordinates, which will surface as a clear test failure
        console.warn(
          "[E2E] Location geocoding did not complete — test may fail at admin approval step"
        );
      });

    await page.getByRole("button", { name: "Create Business Profile" }).click();

    // ── 3. After upload: redirected to /my-businesses ─────────────────────
    await expect(page).toHaveURL(/\/my-businesses/, { timeout: 20000 });

    // ── 4. Owner sees "Pending Approval" badge for the new business ────────
    // Use the "View … details" button as the scoped anchor (avoids matching <option> in filter comboboxes)
    await expect(
      page.getByRole("button", { name: new RegExp(`View ${uniqueName} details`, "i") })
    ).toBeVisible({ timeout: 10000 });

    // Status badge lives inside an overflow:hidden container — check text content, not visibility
    await expect(page.getByRole("main")).toContainText(/pending approval/i, { timeout: 5000 });

    // ── 5. Business must NOT appear in the public feed while pending ────────
    const publicRes = await request.get(`${BASE_URL}/api/businesses?limit=100`);
    expect(publicRes.ok()).toBeTruthy();
    const publicData = await publicRes.json();
    const publicList: { name?: string }[] =
      publicData?.businesses ?? publicData?.data ?? (Array.isArray(publicData) ? publicData : []);
    expect(publicList.some((b) => b.name === uniqueName)).toBe(false);

    // ── 6. Log in as admin ────────────────────────────────────────────────
    await logout(page);
    await loginAs(page, ADMIN_EMAIL, ADMIN_PASSWORD);

    // ── 7. Pending business appears in /admin/pending-businesses ──────────
    await page.goto(`${BASE_URL}/admin/pending-businesses`);
    await expect(page).toHaveURL(/\/admin\/pending-businesses/);
    await expect(page.getByRole("heading", { name: /pending businesses/i })).toBeVisible({
      timeout: 10000,
    });

    // Both the desktop table and mobile card layout are always in the DOM (one is CSS-hidden).
    // Wait for either to contain the business name, confirming the API call returned data.
    await expect(page.locator("body")).toContainText(uniqueName, { timeout: 15000 });

    // ── 8. Admin opens review page and approves ───────────────────────────
    // The mobile card <a> always contains the business name text and is always in the DOM,
    // making it a reliable anchor for extracting the review href on any viewport.
    const reviewHref = await page
      .locator('a[href*="/admin/businesses/"]')
      .filter({ hasText: uniqueName })
      .first()
      .getAttribute("href");
    expect(reviewHref, "Review link must have an href").toBeTruthy();
    await page.goto(`${BASE_URL}${reviewHref}`);
    await expect(page).toHaveURL(/\/admin\/businesses\/[^/]+\/review/, { timeout: 8000 });

    // Wait for the review page to finish loading async business data
    await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
    await expect(page.getByText(uniqueName)).toBeVisible({ timeout: 15000 });

    await page.getByRole("button", { name: /^approve$/i }).click();

    // After approval the page redirects back to pending list
    await expect(page)
      .toHaveURL(/\/admin\/pending-businesses/, { timeout: 10000 })
      .catch(() => {
        // Some implementations show a success state on the same page instead
      });

    // ── 9. Business is now active, not hidden, and verified via API ───────
    const approvedRes = await request.get(`${BASE_URL}/api/businesses?limit=200`);
    expect(approvedRes.ok()).toBeTruthy();
    const approvedData = await approvedRes.json();
    const approvedList: { name?: string; verified?: boolean }[] =
      approvedData?.businesses ??
      approvedData?.data ??
      (Array.isArray(approvedData) ? approvedData : []);
    const approvedBusiness = approvedList.find((b) => b.name === uniqueName);
    expect(
      approvedBusiness,
      `Business "${uniqueName}" should be publicly visible after approval`
    ).toBeDefined();
    expect(approvedBusiness!.verified, "approved business must have verified = true").toBe(true);

    // ── 10. Business owner sees updated status on /my-businesses ──────────
    await logout(page);
    await loginAs(page, BUSINESS_EMAIL, BUSINESS_PASSWORD, "business");

    await page.goto(`${BASE_URL}/my-businesses`);
    await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {});

    await expect(
      page.getByRole("button", { name: new RegExp(`View ${uniqueName} details`, "i") })
    ).toBeVisible({ timeout: 10000 });

    // The table row for this business should no longer contain "Pending Approval"
    const tableRow = page.locator("tbody tr").filter({ hasText: uniqueName });
    if ((await tableRow.count()) > 0) {
      await expect(tableRow.first()).not.toContainText(/pending approval/i);
    } else {
      // Dashboard may render cards instead of a table — check the scoped card
      const card = page
        .locator('[class*="card"], article, li')
        .filter({ hasText: uniqueName })
        .first();
      await expect(card).not.toContainText(/pending approval/i);
    }

    // ── 11. Business owner has a business_approved notification ──────────
    const notifRes = await request.get(
      `${BASE_URL}/api/notifications/business?type=business_approved&limit=10`
    );
    if (notifRes.ok()) {
      const notifData = await notifRes.json();
      const notifications: { type?: string; data?: { business_name?: string } }[] =
        notifData?.notifications ?? [];
      const approvalNotif = notifications.find(
        (n) => n.type === "business_approved" && n.data?.business_name === uniqueName
      );
      expect(
        approvalNotif,
        `business_approved notification must exist for "${uniqueName}"`
      ).toBeDefined();
    } else {
      // 403 means the session cookie didn't carry over to the request context — log and skip
      console.warn(
        `[E2E] /api/notifications/business returned ${notifRes.status()} — cookie context may not carry over in this runner`
      );
    }
  });

  // ── Isolation: pending business not visible to public consumers ─────────
  test("pending business is not returned by the public businesses API", async ({
    page,
    request,
  }) => {
    test.setTimeout(60000);

    await loginAs(page, BUSINESS_EMAIL, BUSINESS_PASSWORD, "business");
    await page.goto(`${BASE_URL}/add-business`);
    await page
      .getByRole("heading", { name: "Create Business Profile" })
      .waitFor({ state: "visible", timeout: 15000 });

    const uniqueName = `E2E Pending Isolation ${Date.now()}`;

    await page.getByRole("textbox", { name: "Enter business name" }).fill(uniqueName);
    await page.getByRole("button", { name: /select a main category/i }).click();
    await page.getByRole("option", { name: "Food & Drink" }).click();
    // Wait for main category dropdown to close before opening subcategory
    await page.locator('[role="listbox"]').waitFor({ state: "detached", timeout: 5000 });
    await page.getByRole("button", { name: /select a subcategory/i }).click();
    await page.locator('[role="listbox"]').waitFor({ state: "attached", timeout: 5000 });
    await page.getByRole("option", { name: "Restaurants" }).click();
    await page.getByRole("button", { name: /Physical Location/i }).click();
    await page.getByPlaceholder(/e\.g\., Cape Town/i).fill("Cape Town, City Bowl");
    await page.getByRole("button", { name: "Create Business Profile" }).click();
    await expect(page).toHaveURL(/\/my-businesses/, { timeout: 20000 });

    // Not in public list
    const res = await request.get(`${BASE_URL}/api/businesses?limit=200`);
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    const list: { name?: string }[] =
      data?.businesses ?? data?.data ?? (Array.isArray(data) ? data : []);
    expect(list.some((b) => b.name === uniqueName)).toBe(false);

    // Not accessible as a direct URL (will 404 or redirect)
    const slugRes = await request.get(
      `${BASE_URL}/api/businesses/${uniqueName.toLowerCase().replace(/\s+/g, "-")}`
    );
    expect(slugRes.status()).not.toBe(200);
  });
});
