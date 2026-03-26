// ─────────────────────────────────────────────────────────────────────────────
// Sayso — Full Onboarding E2E Test
// Flow: login → /interests → /subcategories → /deal-breakers → /complete → /home
// Run after resetting Supabase state with the companion shell script.
// ─────────────────────────────────────────────────────────────────────────────
const { chromium } = require("playwright");
const path = require("path");
const fs   = require("fs");

const BASE   = "http://localhost:3000";
const EMAIL  = "hjnengare@gmail.com";
const PASS   = "enviolata79";
const DIR    = path.join(__dirname, "../.playwright-mcp");
const REPORT = [];

if (!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true });

// ─── helpers ─────────────────────────────────────────────────────────────────
async function shot(page, name) {
  await page.screenshot({ path: path.join(DIR, `onboarding-${name}.png`), fullPage: true });
  console.log(`    📸  ${name}`);
}

function pass(label) {
  REPORT.push({ label, result: "PASS" });
  console.log(`  ✅  PASS — ${label}`);
}

function fail(label, reason) {
  REPORT.push({ label, result: "FAIL", reason });
  console.log(`  ❌  FAIL — ${label}: ${reason}`);
}

// Poll for URL match with a trace log
async function waitForRoute(page, matcher, label, maxMs = 20000) {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    await page.waitForTimeout(800);
    if (matcher(page.url())) return page.url();
  }
  const url = page.url();
  console.log(`    ⏱  Timeout waiting for ${label} — current URL: ${url}`);
  return url;
}

// ─────────────────────────────────────────────────────────────────────────────
(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx     = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page    = await ctx.newPage();

  try {
    // ── SETUP: Login ──────────────────────────────────────────────────────────
    console.log("\n── SETUP  Login ────────────────────────────────────────────");
    await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1200);

    const loginTab = page.locator('button:has-text("Login")').first();
    if (await loginTab.count()) await loginTab.click();
    await page.waitForTimeout(400);

    await page.locator('input[type="email"]').first().fill(EMAIL);
    await page.locator('input[type="password"]').first().fill(PASS);
    await page.locator('button[type="submit"]').first().click();

    const postLogin = await waitForRoute(page, u => !u.includes("/login"), "post-login", 20000);
    if (postLogin.includes("/login")) {
      fail("Login", "Could not log in — aborting");
      throw new Error("Login failed");
    }
    console.log(`  ✔   Logged in → ${postLogin}`);

    // Navigate to /interests if not already there
    if (!page.url().includes("/interests")) {
      await page.goto(`${BASE}/interests`, { waitUntil: "networkidle" });
      await page.waitForTimeout(2000);
    }

    // ── STEP 1: Interests ─────────────────────────────────────────────────────
    console.log("\n── STEP 1  /interests ──────────────────────────────────────");
    await page.waitForTimeout(1500);
    await shot(page, "01-interests-loaded");

    // Wait for buttons to animate in
    try {
      await page.waitForSelector('button[data-interest-id]', { timeout: 12000 });
    } catch {
      await shot(page, "01-interests-timeout");
      fail("Interests page loads", "No interest buttons appeared within 12s");
      throw new Error("No interest buttons");
    }

    const allInterestBtns = page.locator('button[data-interest-id]');
    const enabledBtns     = page.locator('button[data-interest-id]:not([disabled])');
    const totalCount      = await allInterestBtns.count();
    const enabledCount    = await enabledBtns.count();
    console.log(`    ${totalCount} interest buttons (${enabledCount} enabled)`);

    if (totalCount >= 3) pass(`Interests page loads ${totalCount} categories`);
    else fail("Interests page loads categories", `Only ${totalCount} found`);

    // Click first 3 enabled interest buttons
    for (let i = 0; i < Math.min(3, enabledCount); i++) {
      await enabledBtns.nth(i).click();
      await page.waitForTimeout(400);
    }
    await shot(page, "01-interests-3-selected");

    const selectedInterests = await page.locator('button[data-interest-id][aria-pressed="true"]').count();
    if (selectedInterests >= 3) pass(`${selectedInterests} interests selected`);
    else fail("Select 3 interests", `Only ${selectedInterests} show as selected`);

    // Continue button
    const continueBtn1 = page.locator('button:has-text("Continue")').first();
    await page.waitForTimeout(300);
    const enabled1 = await continueBtn1.isEnabled();
    if (enabled1) pass("Continue enabled after 3 interest selections");
    else fail("Interests continue enabled", "Button is still disabled");

    await continueBtn1.click();
    const afterInterests = await waitForRoute(page, u => u.includes("/subcategories"), "/subcategories", 15000);
    await shot(page, "01-interests-navigated");

    if (afterInterests.includes("/subcategories")) pass("Navigated to /subcategories");
    else fail("Interests → /subcategories", `Landed on ${afterInterests}`);

    // ── STEP 2: Subcategories ─────────────────────────────────────────────────
    console.log("\n── STEP 2  /subcategories ──────────────────────────────────");
    await page.waitForTimeout(2000);
    await shot(page, "02-subcategories-loaded");

    // Pills are <m.button> elements — filter out the Continue/navigation buttons
    // Pills have border-2 and rounded-full classes, and contain short label text
    await page.waitForSelector('button[class*="rounded-full"][class*="border-2"]', { timeout: 10000 });
    const pillBtns = page.locator('button[class*="rounded-full"][class*="border-2"]:not([disabled])');
    const pillCount = await pillBtns.count();
    console.log(`    ${pillCount} subcategory pills`);

    if (pillCount >= 1) pass(`Subcategories page loads ${pillCount} pills`);
    else fail("Subcategories page loads pills", "No pills found");

    // Select first 3 pills
    const pillsToSelect = Math.min(3, pillCount);
    for (let i = 0; i < pillsToSelect; i++) {
      await pillBtns.nth(i).click();
      await page.waitForTimeout(350);
    }
    await shot(page, "02-subcategories-selected");
    pass(`${pillsToSelect} subcategories selected`);

    const continueBtn2 = page.locator('button:has-text("Continue")').first();
    await page.waitForTimeout(300);
    const enabled2 = await continueBtn2.isEnabled();
    if (enabled2) pass("Continue enabled on subcategories");
    else fail("Subcategories continue enabled", "Button still disabled");

    await continueBtn2.click();
    const afterSubcats = await waitForRoute(page, u => u.includes("/deal-breakers"), "/deal-breakers", 15000);
    await shot(page, "02-subcategories-navigated");

    if (afterSubcats.includes("/deal-breakers")) pass("Navigated to /deal-breakers");
    else fail("Subcategories → /deal-breakers", `Landed on ${afterSubcats}`);

    // ── STEP 3: Deal-breakers ─────────────────────────────────────────────────
    console.log("\n── STEP 3  /deal-breakers ──────────────────────────────────");
    await page.waitForTimeout(2000);
    await shot(page, "03-dealbreakers-loaded");

    // DealBreakerCard inner click div has class h-32 (unique to these cards)
    await page.waitForSelector('div[class*="h-32"]:not([class*="cursor-not-allowed"])', { timeout: 10000 });
    const dbCards = page.locator('div[class*="h-32"]:not([class*="cursor-not-allowed"])');
    const dbCount = await dbCards.count();
    console.log(`    ${dbCount} deal-breaker cards`);

    if (dbCount >= 1) pass(`Deal-breakers page loads ${dbCount} cards`);
    else fail("Deal-breakers page loads cards", "No cards found");

    // Select 1 deal-breaker — canProceed only requires length > 0
    await dbCards.nth(0).click();
    await page.waitForTimeout(1000); // wait for 3D flip to settle
    await shot(page, "03-dealbreakers-selected");
    pass("1 deal-breaker selected (sufficient to unlock Complete Setup)");

    // Scroll to bottom so the Complete Setup button is in view on mobile viewport
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(800);
    await shot(page, "03-after-scroll");

    // Debug: dump all button texts so we can see what's rendered
    const allBtnTexts = await page.evaluate(() =>
      Array.from(document.querySelectorAll('button')).map(b => b.textContent?.trim())
    );
    console.log("    All buttons on page:", JSON.stringify(allBtnTexts));
    console.log("    Current URL:", page.url());

    // Wait for any onboarding action button (variant=complete renders "Complete Setup")
    await page.waitForSelector('button:not([type="submit"])', { timeout: 10000 });
    const completeBtn = page.locator('button:has-text("Complete Setup")').first();

    const enabled3 = await completeBtn.isEnabled({ timeout: 8000 }).catch(() => false);
    if (enabled3) pass("Complete Setup button enabled");
    else fail("Complete Setup enabled", "Button still disabled after selections");

    await completeBtn.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await completeBtn.click({ force: true });
    const afterDealbreakers = await waitForRoute(page, u => u.includes("/complete"), "/complete", 15000);
    await shot(page, "03-dealbreakers-navigated");

    if (afterDealbreakers.includes("/complete")) pass("Navigated to /complete");
    else fail("Deal-breakers → /complete", `Landed on ${afterDealbreakers}`);

    // ── STEP 4: Complete ──────────────────────────────────────────────────────
    console.log("\n── STEP 4  /complete ───────────────────────────────────────");
    await page.waitForTimeout(1500);
    await shot(page, "04-complete-loaded");

    const allSetCount = await page.locator("text=You're all set!").count();
    if (allSetCount > 0) pass("\"You're all set!\" heading visible");
    else fail("Complete page heading", "\"You're all set!\" not found");

    const badgeCount = await page.locator("text=Setup Complete").count();
    if (badgeCount > 0) pass("Setup Complete badge visible");
    else fail("Setup Complete badge", "Not found");

    // Wait for auto-redirect to /home (fires after 2s on the page)
    const afterComplete = await waitForRoute(page, u => u.includes("/home"), "/home", 12000);
    await shot(page, "04-complete-redirected");

    if (afterComplete.includes("/home")) {
      pass("Auto-redirected to /home ✨");
    } else {
      // Try CTA manually
      const cta = page.locator('[data-testid="onboarding-complete-cta"]').first();
      if (await cta.count()) {
        await cta.click();
        const afterCta = await waitForRoute(page, u => u.includes("/home"), "/home after CTA", 10000);
        if (afterCta.includes("/home")) pass("Continue to Home CTA → /home");
        else fail("Complete → /home", `CTA landed on ${afterCta}`);
      } else {
        fail("Complete auto-redirect", `Still on ${afterComplete}`);
      }
    }

    console.log(`\n  Final URL: ${page.url()}`);

  } catch (err) {
    console.error("\n  FATAL:", err.message);
    await shot(page, "fatal-error").catch(() => {});
    if (!REPORT.some(r => r.label === "Login" && r.result === "FAIL")) {
      fail("Unexpected error", err.message);
    }
  } finally {
    await browser.close();
  }

  // ── Report ────────────────────────────────────────────────────────────────
  const passed = REPORT.filter(r => r.result === "PASS").length;
  const failed = REPORT.filter(r => r.result === "FAIL").length;
  console.log("\n═══════════════════════════════════════════════════════════");
  console.log("  ONBOARDING E2E TEST REPORT");
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
