import { test } from "@playwright/test";
import path from "path";
import fs from "fs";

const EMAIL = "hjnengare@gmail.com";
const PASSWORD = "PlaywrightTest123";
const OUT_DIR = path.join(process.cwd(), "screenshots");
const TARGET_USERNAME = "tarynvdberg"; // 16 badges

test.describe("Profile Page Screenshots", () => {
  test.beforeAll(() => {
    if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  });

  test("profile page with 5+ badges", async ({ page }) => {
    // ── Login ──────────────────────────────────────────────────────────
    await page.goto("/login");
    await page.getByRole("textbox", { name: /email/i }).fill(EMAIL);
    await page.getByRole("textbox", { name: /password/i }).fill(PASSWORD);
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 20000 });

    // ── Navigate to profile with many badges ──────────────────────────
    await page.goto(`/profile/${TARGET_USERNAME}`);
    await page.waitForLoadState("networkidle", { timeout: 15000 });
    await page.waitForTimeout(1500);

    // ── Full page screenshot ───────────────────────────────────────────
    await page.screenshot({
      path: path.join(OUT_DIR, "profile-with-badges-full.png"),
      fullPage: true,
    });
    console.log("✓ Saved: profile-with-badges-full.png");

    // ── Viewport screenshot (above-the-fold hero) ─────────────────────
    await page.screenshot({
      path: path.join(OUT_DIR, "profile-with-badges-viewport.png"),
      fullPage: false,
    });
    console.log("✓ Saved: profile-with-badges-viewport.png");
  });
});
