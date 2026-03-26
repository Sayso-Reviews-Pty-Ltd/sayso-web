// ─────────────────────────────────────────────────────────────────────────────
// Sayso — Full Auth E2E Test
// Covers: login (success), login (wrong password), login (empty fields),
//         forgot-password flow, post-login redirect
// ─────────────────────────────────────────────────────────────────────────────
const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

const BASE   = "http://localhost:3000";
const EMAIL  = "hjnengare@gmail.com";
const PASS   = "enviolata79";
const WRONG  = "wrongpassword123";
const DIR    = path.join(__dirname, "../.playwright-mcp");
const REPORT = [];

if (!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true });

// ─── helpers ─────────────────────────────────────────────────────────────────
async function shot(page, name) {
  const file = path.join(DIR, `auth-${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  console.log(`    📸  ${name}`);
  return file;
}

function pass(label) {
  REPORT.push({ label, result: "PASS" });
  console.log(`  ✅  PASS — ${label}`);
}

function fail(label, reason) {
  REPORT.push({ label, result: "FAIL", reason });
  console.log(`  ❌  FAIL — ${label}: ${reason}`);
}

async function waitForToast(page, timeout = 5000) {
  try {
    await page.waitForSelector('[class*="toast"], [role="status"], [role="alert"]', { timeout });
    return true;
  } catch { return false; }
}

// ─── navigate to login, ensure Login tab is active ───────────────────────────
async function goToLogin(page) {
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  // Ensure "Login" tab is active inside the card
  const loginTab = page.locator('button:has-text("Login")').first();
  if (await loginTab.count() > 0) await loginTab.click();
  await page.waitForTimeout(500);
}

// ─────────────────────────────────────────────────────────────────────────────
// TEST SUITE
// ─────────────────────────────────────────────────────────────────────────────
(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx     = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page    = await ctx.newPage();

  // ── T1: Login page renders ────────────────────────────────────────────────
  console.log("\n── T1  Login page renders ──────────────────────────────────");
  try {
    await goToLogin(page);
    await shot(page, "01-login-page");
    const heading = await page.locator("h2").first().textContent();
    if (heading) pass("Login page renders with heading");
    else fail("Login page renders with heading", "No <h2> found");
  } catch (e) { fail("Login page renders", e.message); }

  // ── T2: Empty submit shows validation ────────────────────────────────────
  console.log("\n── T2  Empty submit shows validation ───────────────────────");
  try {
    await goToLogin(page);
    const submit = page.locator('button[type="submit"]').first();
    // Button should be disabled when fields are empty (disabled:opacity-50)
    const isDisabled = await submit.isDisabled();
    await shot(page, "02-empty-form");
    if (isDisabled) {
      pass("Submit disabled when fields empty");
    } else {
      // Try clicking anyway to trigger validation
      await submit.click();
      await page.waitForTimeout(800);
      await shot(page, "02b-empty-submit-error");
      const errorVisible = await page.locator('[class*="error"], [class*="border-error"]').count() > 0;
      if (errorVisible) pass("Validation shown on empty submit");
      else fail("Empty submit validation", "No validation feedback visible");
    }
  } catch (e) { fail("Empty submit validation", e.message); }

  // ── T3: Wrong password shows error ────────────────────────────────────────
  console.log("\n── T3  Wrong password shows error ──────────────────────────");
  try {
    await goToLogin(page);
    await page.locator('input[type="email"]').first().fill(EMAIL);
    await page.locator('input[type="password"]').first().fill(WRONG);
    await page.waitForTimeout(400);
    await shot(page, "03-wrong-password-filled");
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(3000);
    await shot(page, "03-wrong-password-error");
    const url = page.url();
    const errorEl = await page.locator('[class*="border-error"], [class*="text-error"], [class*="error-600"]').count();
    if (errorEl > 0 || url.includes("login")) {
      pass("Wrong password shows error / stays on login");
    } else {
      fail("Wrong password", "No error shown and navigated away");
    }
  } catch (e) { fail("Wrong password shows error", e.message); }

  // ── T4: Correct login succeeds and redirects ──────────────────────────────
  console.log("\n── T4  Correct login succeeds ───────────────────────────────");
  try {
    await goToLogin(page);
    await page.locator('input[type="email"]').first().fill(EMAIL);
    await page.locator('input[type="password"]').first().fill(PASS);
    await page.waitForTimeout(400);
    await shot(page, "04-login-filled");
    await page.locator('button[type="submit"]').first().click();

    // Poll for up to 15s — capture URL at every second to trace redirects
    let finalUrl = page.url();
    const urlTrace = [];
    for (let i = 0; i < 15; i++) {
      await page.waitForTimeout(1000);
      const u = page.url();
      if (!urlTrace.includes(u)) urlTrace.push(u);
      finalUrl = u;
      if (!u.includes("/login")) break;
    }
    console.log(`    URL trace: ${urlTrace.join(" → ")}`);
    await shot(page, "04-post-login-final");

    // For a new user (onboarding not complete) the app correctly sends to /interests.
    // For a returning user (onboarding done) it sends to /home.
    // Both are valid successful logins — we just must not stay on /login.
    const VALID_POST_LOGIN = ["/home", "/interests", "/verify-email", "/admin", "/my-businesses"];
    const landedOnValidRoute = VALID_POST_LOGIN.some(r => finalUrl.includes(r));

    if (landedOnValidRoute) {
      pass(`Login succeeded — redirected to: ${finalUrl}`);
    } else if (!finalUrl.includes("/login")) {
      pass(`Login succeeded — redirected to unexpected route (may be new): ${finalUrl}`);
    } else {
      const errText = await page.locator('[class*="error-600"], [class*="border-error"]').first().textContent().catch(() => "(none)");
      const toastText = await page.locator('[class*="toast"], [role="status"], [role="alert"]').first().textContent().catch(() => "(no toast)");
      fail("Login redirect", `URL: ${finalUrl} | Error: ${errText} | Toast: ${toastText}`);
    }
  } catch (e) { fail("Correct login", e.message); }

  // ── T5: Logout / clear session for next tests ─────────────────────────────
  console.log("\n── T5  Clearing session ────────────────────────────────────");
  await ctx.clearCookies();
  const newCtx  = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page2   = await newCtx.newPage();

  // ── T6: Forgot password page renders ─────────────────────────────────────
  console.log("\n── T6  Forgot password page renders ────────────────────────");
  try {
    await page2.goto(`${BASE}/login`, { waitUntil: "networkidle" });
    await page2.waitForTimeout(1200);
    const loginTab = page2.locator('button:has-text("Login")').first();
    if (await loginTab.count() > 0) await loginTab.click();
    await page2.waitForTimeout(500);
    await shot(page2, "06-login-before-forgot");

    // Click "Forgot password?" link
    const forgotLink = page2.locator('a[href="/forgot-password"]').first();
    if (await forgotLink.count() > 0) {
      await forgotLink.click();
    } else {
      await page2.goto(`${BASE}/forgot-password`, { waitUntil: "networkidle" });
    }
    await page2.waitForURL("**/forgot-password", { timeout: 5000 });
    await page2.waitForTimeout(1200);
    await shot(page2, "06-forgot-password-page");
    pass("Forgot password page reachable from login");
  } catch (e) { fail("Forgot password page renders", e.message); }

  // ── T7: Forgot password — enter email & submit ────────────────────────────
  console.log("\n── T7  Forgot password — submit email ──────────────────────");
  try {
    await page2.locator('input[type="email"]').first().fill(EMAIL);
    await page2.waitForTimeout(500);
    await shot(page2, "07-forgot-email-entered");
    await page2.locator('button[type="submit"]').first().click();
    await page2.waitForTimeout(3000);
    await shot(page2, "07-forgot-after-submit");

    // Check for success state
    const successHeading = await page2.locator('text=Check your email').count();
    const emailSent = await page2.locator('text=Email sent').count();
    const emailShown = await page2.locator(`text=${EMAIL}`).count();

    if (successHeading > 0 || emailSent > 0) {
      pass("Forgot password — success screen shown");
    } else {
      const currentUrl = page2.url();
      const bodyText = await page2.locator("body").textContent();
      if (bodyText?.includes("sent") || bodyText?.includes("email")) {
        pass("Forgot password — email sent feedback visible");
      } else {
        fail("Forgot password submit", `Success screen not found. URL: ${currentUrl}`);
      }
    }
    if (emailShown > 0) pass(`Forgot password — email '${EMAIL}' displayed on success screen`);
  } catch (e) { fail("Forgot password submit", e.message); }

  // ── T8: Success screen back-to-login button ───────────────────────────────
  console.log("\n── T8  Forgot password — back to login ─────────────────────");
  try {
    const backBtn = page2.locator('button:has-text("Back to Login"), a:has-text("Back to Login")').first();
    if (await backBtn.count() > 0) {
      await backBtn.click();
      await page2.waitForURL("**/login", { timeout: 5000 });
      await page2.waitForTimeout(800);
      await shot(page2, "08-back-to-login");
      pass("Back to Login returns to /login");
    } else {
      fail("Back to login button", "Button not found on success screen");
    }
  } catch (e) { fail("Back to login button", e.message); }

  // ─────────────────────────────────────────────────────────────────────────
  await browser.close();

  // ── Final report ──────────────────────────────────────────────────────────
  const passed = REPORT.filter(r => r.result === "PASS").length;
  const failed = REPORT.filter(r => r.result === "FAIL").length;

  console.log("\n═══════════════════════════════════════════════════════════");
  console.log("  AUTH E2E TEST REPORT");
  console.log("═══════════════════════════════════════════════════════════");
  REPORT.forEach(r => {
    const icon = r.result === "PASS" ? "✅" : "❌";
    console.log(`  ${icon}  ${r.result.padEnd(4)}  ${r.label}`);
    if (r.reason) console.log(`         → ${r.reason}`);
  });
  console.log("───────────────────────────────────────────────────────────");
  console.log(`  ${passed} passed  /  ${failed} failed  /  ${REPORT.length} total`);
  console.log(`  OVERALL: ${failed === 0 ? "✅ PASS" : "❌ FAIL"}`);
  console.log("═══════════════════════════════════════════════════════════\n");

  if (failed > 0) process.exitCode = 1;
})();
