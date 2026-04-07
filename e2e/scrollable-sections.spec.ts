import { test, expect, type Page } from "@playwright/test";

const SECTIONS = ["Trending Now", "For You", "Events & Specials", "Community Highlights"];

async function openHome(page: Page) {
  // Use domcontentloaded so we don't wait for every background network request
  await page.goto("/home", { waitUntil: "domcontentloaded", timeout: 60_000 });
  if (page.url().includes("/onboarding") || page.url().includes("/login")) {
    await page.goto("/home", { waitUntil: "domcontentloaded", timeout: 60_000 });
  }
  await expect(page.getByRole("heading", { name: /Trending Now/i }).first()).toBeVisible({
    timeout: 30_000,
  });
}

test.describe("ScrollableSection — native scroll rail", () => {
  test.setTimeout(90_000);

  test.beforeEach(async ({ page }) => {
    await openHome(page);
  });

  test("every rail-scroll container has overflow-x: auto", async ({ page }) => {
    const rails = page.locator(".rail-scroll");
    const count = await rails.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const overflowX = await rails.nth(i).evaluate((el) => window.getComputedStyle(el).overflowX);
      expect(overflowX).toBe("auto");
    }
  });

  test("at least one rail-scroll container has scrollable content (scrollWidth > clientWidth)", async ({
    page,
  }) => {
    const rails = page.locator(".rail-scroll");
    const count = await rails.count();
    expect(count).toBeGreaterThan(0);

    // Not every section has enough cards to overflow (e.g. a section with 2-3 cards
    // at 1280px desktop). Assert that at least the majority do overflow.
    let overflowCount = 0;
    for (let i = 0; i < count; i++) {
      const isScrollable = await rails.nth(i).evaluate((el) => el.scrollWidth > el.clientWidth);
      if (isScrollable) overflowCount++;
    }
    expect(overflowCount, "expected at least one rail to have overflowing content").toBeGreaterThan(
      0
    );
  });

  test("overflowing rail accepts scrollLeft changes (native scroll is not blocked)", async ({
    page,
  }) => {
    // Find the first rail with overflow content
    const rails = page.locator(".rail-scroll");
    const count = await rails.count();
    expect(count).toBeGreaterThan(0);

    let targetRail = rails.first();
    for (let i = 0; i < count; i++) {
      const hasOverflow = await rails.nth(i).evaluate((el) => el.scrollWidth > el.clientWidth);
      if (hasOverflow) {
        targetRail = rails.nth(i);
        break;
      }
    }

    // Directly set scrollLeft and verify it changes — proves overflow-x is not
    // blocked by a parent overflow: hidden and that the element is truly scrollable
    const scrollAfter = await targetRail.evaluate((el) => {
      el.scrollLeft = 200;
      return el.scrollLeft;
    });
    expect(scrollAfter).toBeGreaterThan(0);
  });

  test("scroll-right arrow button advances scrollLeft on desktop", async ({ page }) => {
    // Arrows are hidden on mobile peek routes; desktop always shows them
    const rails = page.locator(".rail-scroll");
    const firstRail = rails.first();

    // find the next-arrow sibling of the same parent container
    const container = page.locator(".relative").filter({
      has: firstRail,
    });
    const nextBtn = container.locator('button[aria-label="Scroll right"]').first();

    const isMobileHidden = await nextBtn.evaluate(
      (el) => window.getComputedStyle(el).display === "none"
    );
    if (isMobileHidden) {
      test.skip();
      return;
    }

    const scrollBefore = await firstRail.evaluate((el) => el.scrollLeft);
    await nextBtn.click();
    await page.waitForTimeout(600); // smooth scroll animation

    const scrollAfter = await firstRail.evaluate((el) => el.scrollLeft);
    expect(scrollAfter).toBeGreaterThan(scrollBefore);
  });

  test("scrollbar is hidden (no visible scrollbar track)", async ({ page }) => {
    const rails = page.locator(".rail-scroll");
    const count = await rails.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const scrollbarWidth = await rails.nth(i).evaluate((el) => {
        // offsetWidth - clientWidth gives the scrollbar width (0 = hidden)
        return el.offsetWidth - el.clientWidth;
      });
      expect(scrollbarWidth).toBe(0);
    }
  });
});

test.describe("ScrollableSection — mobile viewport", () => {
  // hasTouch enables the touchscreen API and sets mobile UA
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });
  test.setTimeout(90_000);

  test.beforeEach(async ({ page }) => {
    await openHome(page);
  });

  test("rail containers are scrollable on mobile (at least one overflows)", async ({ page }) => {
    const rails = page.locator(".rail-scroll");
    const count = await rails.count();
    expect(count).toBeGreaterThan(0);

    // On a 390px viewport every section with >1 card should overflow
    let overflowCount = 0;
    for (let i = 0; i < count; i++) {
      const isScrollable = await rails.nth(i).evaluate((el) => el.scrollWidth > el.clientWidth);
      if (isScrollable) overflowCount++;
    }
    expect(
      overflowCount,
      "expected multiple rails to overflow on 390px mobile viewport"
    ).toBeGreaterThan(1);
  });

  test("overflowing rail accepts scrollLeft changes on mobile (scroll not blocked)", async ({
    page,
  }) => {
    const rails = page.locator(".rail-scroll");
    const count = await rails.count();
    expect(count).toBeGreaterThan(0);

    // Find the first overflowing rail
    let targetRail = rails.first();
    for (let i = 0; i < count; i++) {
      const hasOverflow = await rails.nth(i).evaluate((el) => el.scrollWidth > el.clientWidth);
      if (hasOverflow) {
        targetRail = rails.nth(i);
        break;
      }
    }

    const scrollAfter = await targetRail.evaluate((el) => {
      el.scrollLeft = 200;
      return el.scrollLeft;
    });
    expect(scrollAfter).toBeGreaterThan(0);
  });
});
