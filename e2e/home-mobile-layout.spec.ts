import { test, expect, type Page } from "@playwright/test";

async function openHome(page: Page) {
  await page.goto("/home");
  if (page.url().includes("/onboarding")) {
    await page.goto("/");
  }
}

test.describe("Home mobile layout symmetry", () => {
  test("applies consistent 8px mobile gutters for core home sections", async ({ page }) => {
    await openHome(page);

    await expect(page.getByRole("heading", { name: /Trending Now/i })).toBeVisible({ timeout: 20_000 });

    const sectionLabels = ["Trending Now", "Events & Specials", "Community Highlights"];

    for (const label of sectionLabels) {
      const sectionContainer = page.locator(`section[aria-label="${label}"] > div`).first();
      await expect(sectionContainer).toBeVisible();

      const leftPadding = await sectionContainer.evaluate((el) =>
        window.getComputedStyle(el).paddingLeft
      );
      const rightPadding = await sectionContainer.evaluate((el) =>
        window.getComputedStyle(el).paddingRight
      );

      expect(leftPadding).toBe("8px");
      expect(rightPadding).toBe("8px");
    }
  });
});
