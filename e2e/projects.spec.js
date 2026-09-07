const { test, expect } = require("@playwright/test");

test.describe("Projects page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/projects/");
  });

  test("displays the projects heading", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Projects.");
  });

  test("displays project cards with optimized cover images", async ({ page }) => {
    const cards = page.locator(".project-card");
    await expect(cards.first()).toBeVisible();
    expect(await cards.count()).toBe(24);

    const img = page.locator(".project-media__image").first();
    await expect(img).toHaveAttribute("srcset", /\.webp\s\d+w/);
    await expect(img).toHaveAttribute("width", /\d+/);
  });

  test("lists the text-only projects as rows", async ({ page }) => {
    await expect(page.locator(".project-teaser-item").first()).toBeVisible();
  });

  test("displays the about section at the bottom", async ({ page }) => {
    await expect(page.locator("#about")).toBeVisible();
    await expect(page.locator("#about h2")).toContainText("About me");
  });
});
