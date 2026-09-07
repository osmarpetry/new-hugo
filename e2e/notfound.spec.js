const { test, expect } = require("@playwright/test");

/**
 * A static host maps unknown routes to 404.html itself (Netlify does it by
 * default), so what is tested here is the page, not the status code.
 */
test.describe("404 page", () => {
  test("renders the not-found card", async ({ page }) => {
    await page.goto("/404.html");
    await expect(page.locator("h1")).toContainText("Page not found.");
    await expect(page.locator(".not-found-description")).toBeVisible();
    await expect(page.locator('a.action-link[href="/"]')).toContainText(
      "Back to landing page"
    );
    await expect(page.locator('button.action-link[type="button"]')).toContainText(
      "Go back"
    );
  });

  test("is excluded from search engines", async ({ page }) => {
    await page.goto("/404.html");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      /noindex/
    );
  });

  test("navigates home from the 404 page", async ({ page }) => {
    await page.goto("/404.html");
    await page.locator('a.action-link[href="/"]').click();
    await expect(page).toHaveURL("/");
    await expect(page.locator("h1")).toContainText("Osmar Petry");
  });

  test("goes back to the previous page", async ({ page }) => {
    await page.goto("/projects/");
    await page.goto("/404.html");
    await page.locator('button.action-link[type="button"]').click();
    await expect(page).toHaveURL(/\/projects\//);
  });
});
