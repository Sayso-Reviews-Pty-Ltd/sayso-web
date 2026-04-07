import { test } from "@playwright/test";
import path from "path";
import fs from "fs";

const EMAIL = "hjnengare@gmail.com";
const PASSWORD = "PlaywrightTest123";
const OUT_DIR = path.join(process.cwd(), "screenshots");

test.describe("Deal Breakers Page Screenshots", () => {
  test.beforeAll(() => {
    if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  });

  test("screenshots: no selection and with selections", async ({ page }) => {
    // ── Login ──────────────────────────────────────────────────────────
    await page.goto("/login");
    await page.getByRole("textbox", { name: /email/i }).fill(EMAIL);
    await page.getByRole("textbox", { name: /password/i }).fill(PASSWORD);
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 20000 });

    // ── Deal Breakers page ─────────────────────────────────────────────
    await page.goto("/deal-breakers");
    // Wait for the flip cards to appear (they use enter-stagger class)
    await page.waitForSelector(".enter-stagger", { timeout: 15000 });
    await page.waitForTimeout(800);

    // ── Screenshot 1: no selections ────────────────────────────────────
    await page.screenshot({
      path: path.join(OUT_DIR, "dealbreakers-no-selection.png"),
      fullPage: true,
    });
    console.log("✓ Saved: dealbreakers-no-selection.png");

    // ── Select 2 deal breaker cards ────────────────────────────────────
    // Cards are divs with cursor-pointer (onClick handler), not buttons
    const cards = page.locator('.enter-stagger > div[class*="cursor-pointer"]');
    const count = await cards.count();
    console.log(`Found ${count} dealbreaker cards`);

    if (count >= 2) {
      await cards.nth(0).click();
      await page.waitForTimeout(600);
      await cards.nth(1).click();
      await page.waitForTimeout(600);
    }

    // ── Screenshot 2: with selections ─────────────────────────────────
    await page.screenshot({
      path: path.join(OUT_DIR, "dealbreakers-with-selection.png"),
      fullPage: true,
    });
    console.log("✓ Saved: dealbreakers-with-selection.png");
  });
});
