import { test } from "@playwright/test";
import path from "path";
import fs from "fs";

const EMAIL = "hjnengare@gmail.com";
const PASSWORD = "PlaywrightTest123";
const OUT_DIR = path.join(process.cwd(), "screenshots");

test.describe("Profile Page Comparison", () => {
  test.beforeAll(() => {
    if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  });

  test("own profile /profile", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("textbox", { name: /email/i }).fill(EMAIL);
    await page.getByRole("textbox", { name: /password/i }).fill(PASSWORD);
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 20000 });

    await page.goto("/profile");
    await page.waitForLoadState("networkidle", { timeout: 15000 });
    await page.waitForTimeout(1500);

    await page.screenshot({ path: path.join(OUT_DIR, "profile-own.png"), fullPage: true });
    console.log("✓ Saved: profile-own.png");
  });

  test("public profile /profile/[username]", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("textbox", { name: /email/i }).fill(EMAIL);
    await page.getByRole("textbox", { name: /password/i }).fill(PASSWORD);
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 20000 });

    await page.goto("/profile/tarynvdberg");
    await page.waitForLoadState("networkidle", { timeout: 15000 });
    await page.waitForTimeout(1500);

    await page.screenshot({ path: path.join(OUT_DIR, "profile-public.png"), fullPage: true });
    console.log("✓ Saved: profile-public.png");
  });
});
