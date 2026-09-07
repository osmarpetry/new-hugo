const { test, expect } = require("@playwright/test");

test.describe("Navigation", () => {
  test("navigates to the projects page", async ({ page }) => {
    await page.goto("/");
    await page.locator('a.nav-link[href="/projects/"]').click();
    await expect(page).toHaveURL(/\/projects\//);
    await expect(page.locator("h1")).toContainText("Projects.");
  });

  test("navigates to the blog", async ({ page }) => {
    await page.goto("/");
    await page.locator('a.nav-link[href="/blog/"]').click();
    await expect(page).toHaveURL(/\/blog\//);
    await expect(page.locator("h1")).toContainText("Blog.");
  });

  test("navigates to the resume", async ({ page }) => {
    await page.goto("/");
    await page.locator('a.nav-link[href="/resume/"]').click();
    await expect(page).toHaveURL(/\/resume\//);
    await expect(page.locator(".resume-prose")).toBeVisible();
  });

  test("navigates to the slides", async ({ page }) => {
    await page.goto("/");
    await page.locator('a.nav-link[href="/slides/"]').click();
    await expect(page).toHaveURL(/\/slides\//);
    await expect(page.locator("h1")).toContainText("Slides.");
  });

  test("navigates home through the brand link", async ({ page }) => {
    await page.goto("/projects/");
    await page.locator(".nav-brand").click();
    await expect(page).toHaveURL("/");
  });
});
