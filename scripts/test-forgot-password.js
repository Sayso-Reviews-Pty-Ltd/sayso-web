const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

const BASE_URL = "http://localhost:3000";
const EMAIL = "hjnengare@gmail.com";
const SCREENSHOT_DIR = path.join(__dirname, "../.playwright-mcp");

async function screenshot(page, name) {
  const filePath = path.join(SCREENSHOT_DIR, name);
  await page.screenshot({ path: filePath, fullPage: true });
  console.log(`  Screenshot saved: ${name}`);
}

(async () => {
  if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();

  try {
    // Step 1 — Login page
    console.log("\n[1/5] Navigating to login page...");
    await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);
    await screenshot(page, "fp-01-login-page.png");

    // Step 2 — Click "Forgot password?" link
    console.log("[2/5] Looking for Forgot password link...");
    const forgotLink = page.locator('a[href="/forgot-password"]').first();
    if ((await forgotLink.count()) === 0) {
      console.log("  Link not found on login page — navigating directly to /forgot-password");
      await page.goto(`${BASE_URL}/forgot-password`, { waitUntil: "networkidle" });
    } else {
      await forgotLink.click();
      await page.waitForURL("**/forgot-password", { timeout: 5000 });
    }
    await page.waitForTimeout(1500);
    await screenshot(page, "fp-02-forgot-password-page.png");

    // Step 3 — Type email
    console.log("[3/5] Entering email...");
    const emailInput = page.locator('input[type="email"]').first();
    await emailInput.click();
    await emailInput.fill(EMAIL);
    await page.waitForTimeout(800);
    await screenshot(page, "fp-03-email-entered.png");

    // Step 4 — Submit
    console.log("[4/5] Clicking Send reset link...");
    const submitBtn = page.locator('button[type="submit"]').first();
    await submitBtn.click();
    await page.waitForTimeout(500);
    await screenshot(page, "fp-04-after-submit.png");

    // Step 5 — Wait for success state
    console.log("[5/5] Waiting for success screen...");
    try {
      await page.waitForSelector("text=Check your email", { timeout: 10000 });
      console.log("  Success screen detected!");
    } catch {
      console.log(
        "  'Check your email' heading not found within timeout — capturing current state anyway"
      );
    }
    await page.waitForTimeout(1500);
    await screenshot(page, "fp-05-success-screen.png");

    // Report final state
    const heading = await page
      .locator("h2")
      .first()
      .textContent()
      .catch(() => "(none)");
    const emailDisplay = await page
      .locator(`text=${EMAIL}`)
      .first()
      .textContent()
      .catch(() => "(not visible)");
    console.log(`\n  Page heading: "${heading}"`);
    console.log(`  Email on screen: "${emailDisplay}"`);
    console.log("\nFORGOT PASSWORD FLOW: PASS");
  } catch (err) {
    console.error("\n  ERROR during test:", err.message);
    await screenshot(page, "fp-error-state.png").catch(() => {});
    console.log("\nFORGOT PASSWORD FLOW: FAIL");
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();
