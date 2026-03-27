import { test, expect, type Page } from "@playwright/test";

const BIZ_EMAIL = process.env.E2E_BIZ_OWNER_EMAIL || "hnengare@gmail.com";
const BIZ_PASSWORD = process.env.E2E_BIZ_OWNER_PASSWORD || "enviolata79";

async function loginAsBusinessOwner(page: Page) {
  await page.goto("/business/login");
  await page.getByPlaceholder(/you@example\.com/i).fill(BIZ_EMAIL);
  await page.getByPlaceholder(/enter your password/i).fill(BIZ_PASSWORD);
  await page.getByRole("button", { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/my-businesses/, { timeout: 20000 });
}

test.describe("Business Owner Dashboard E2E", () => {
  test("business login page loads with all expected elements", async ({ page }) => {
    await page.goto("/business/login");
    await page.waitForLoadState("networkidle");

    await expect(page.getByPlaceholder(/you@example\.com/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByPlaceholder(/enter your password/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
    await expect(page.getByText(/forgot password/i).first()).toBeVisible();
    await expect(page.getByText(/sign up/i).first()).toBeVisible();
    await expect(page.getByText(/personal account/i).first()).toBeVisible();
  });

  test("business login form validates empty submission", async ({ page }) => {
    await page.goto("/business/login");
    await page.waitForLoadState("domcontentloaded");

    const signInButton = page.getByRole("button", { name: /sign in/i });
    await expect(signInButton).toBeDisabled();
  });

  test("successful login redirects to /my-businesses", async ({ page }) => {
    test.setTimeout(30000);
    await loginAsBusinessOwner(page);

    await expect(page.getByText(/My Businesses/i).first()).toBeVisible({ timeout: 15000 });
  });

  test("my-businesses dashboard shows expected sections", async ({ page }) => {
    test.setTimeout(45000);
    await loginAsBusinessOwner(page);

    await expect(page.getByRole("heading", { name: /My Businesses/i }).first()).toBeVisible({
      timeout: 15000,
    });

    const addBusinessLink = page.getByRole("link", { name: /Add Business/i }).first();
    await expect(addBusinessLink).toBeVisible();

    const hasBusinesses = await page
      .getByText(/No businesses or events yet/i)
      .isVisible()
      .catch(() => false);

    if (hasBusinesses) {
      await expect(page.getByText(/No businesses or events yet/i)).toBeVisible();
      await expect(page.getByRole("link", { name: /Add Business/i }).first()).toBeVisible();
    } else {
      await expect(page.getByText(/Events & Specials/i).first()).toBeVisible({ timeout: 10000 });
    }
  });

  test("individual business dashboard loads with stats and actions", async ({ page }) => {
    test.setTimeout(60000);
    await loginAsBusinessOwner(page);

    const businessLink = page
      .getByRole("link", { name: /view.*details/i })
      .or(page.getByRole("button", { name: /view.*details/i }))
      .first();
    const hasBusinesses = await businessLink.isVisible({ timeout: 10000 }).catch(() => false);

    if (!hasBusinesses) {
      test.skip(true, "No businesses found for this account");
      return;
    }

    await businessLink.click();
    await page.waitForLoadState("domcontentloaded");

    await expect(page.locator("[aria-label='Business statistics']")).toBeVisible({
      timeout: 20000,
    });

    await expect(page.getByText(/Average Rating/i).first()).toBeVisible();
    await expect(page.getByText(/Reviews/i).first()).toBeVisible();
    await expect(page.getByText(/Profile Views/i).first()).toBeVisible();

    await expect(page.locator("[aria-label='Quick actions']")).toBeVisible();
    await expect(page.getByText(/Edit Details/i).first()).toBeVisible();
    await expect(page.getByText(/Upload Photos/i).first()).toBeVisible();
    await expect(page.getByText(/View Reviews/i).first()).toBeVisible();

    await expect(page.locator("[aria-label='Growth suggestions']")).toBeVisible();
    await expect(page.getByText(/Grow Your Visibility/i).first()).toBeVisible();
  });

  test("/claim-business page loads without crash", async ({ page }) => {
    test.setTimeout(30000);

    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });

    await loginAsBusinessOwner(page);

    await page.goto("/claim-business");
    await page.waitForLoadState("domcontentloaded");

    await expect(page.getByText(/own or manage a business/i).first()).toBeVisible({
      timeout: 15000,
    });

    await expect(page.getByPlaceholder(/search for your business/i)).toBeVisible();

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    await expect(page.getByText(/need help claiming your business/i).first()).toBeVisible({
      timeout: 5000,
    });

    await page.waitForTimeout(1500);

    const criticalErrors = consoleErrors.filter(
      (e) =>
        e.includes("React.Children.only") ||
        e.includes("Unhandled Runtime Error") ||
        e.includes("Application error")
    );
    expect(criticalErrors).toEqual([]);
  });

  test("business registration page loads correctly", async ({ page }) => {
    await page.goto("/business/register");
    await page.waitForLoadState("networkidle");

    await expect(page.getByPlaceholder(/choose a username/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByPlaceholder(/you@example\.com/i)).toBeVisible();
    await expect(
      page
        .getByPlaceholder(/create a password/i)
        .or(page.getByPlaceholder(/password/i))
        .first()
    ).toBeVisible();
  });

  test("no console crashes across dashboard navigation", async ({ page }) => {
    test.setTimeout(60000);
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });

    await loginAsBusinessOwner(page);

    await page.goto("/claim-business");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(1500);

    await page.goto("/add-business");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(1500);

    await page.goto("/my-businesses");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(1500);

    const crashes = consoleErrors.filter(
      (e) =>
        e.includes("React.Children.only") ||
        e.includes("Unhandled Runtime Error") ||
        e.includes("Application error") ||
        e.includes("ChunkLoadError")
    );
    expect(crashes).toEqual([]);
  });
});
