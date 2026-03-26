import { expect, test } from "@playwright/test";

test.describe("Business auth feedback", () => {
  test("shows clear inline feedback when business login token request returns 400", async ({ page }) => {
    await page.route("**/auth/v1/token**", async (route) => {
      if (route.request().method() !== "POST") {
        await route.continue();
        return;
      }

      await route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({
          error: "invalid_grant",
          error_description: "Invalid login credentials",
        }),
      });
    });

    await page.goto("/business/login");
    await page.getByPlaceholder("you@example.com").fill("owner@example.com");
    await page.getByPlaceholder("Enter your password").fill("WrongPass123!");
    await page.getByRole("button", { name: /^sign in$/i }).click();

    await expect(
      page.getByText(/incorrect email or password|email or password is incorrect/i)
    ).toBeVisible({ timeout: 10000 });
  });

  test("shows clear inline feedback when business signup request returns 400", async ({ page }) => {
    await page.route("**/auth/v1/signup**", async (route) => {
      if (route.request().method() !== "POST") {
        await route.continue();
        return;
      }

      await route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({
          code: "user_already_registered",
          msg: "User already registered",
        }),
      });
    });

    await page.goto("/business/register");
    await page.getByPlaceholder("Choose a username").fill("biz_owner_test");
    await page.getByPlaceholder("you@example.com").fill("owner@example.com");
    await page.getByPlaceholder("Create a password").fill("StrongPass123!");
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: /create business account/i }).click();

    await expect(
      page.getByText(/email already registered|email is already in use|already exists/i)
    ).toBeVisible({ timeout: 10000 });
  });
});
