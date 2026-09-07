const { test, expect } = require("@playwright/test");

test.describe("Slides page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/slides/");
  });

  test("displays the slides heading", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Slides.");
  });

  test("renders every deck as a card linking to its local PDF", async ({
    page,
  }) => {
    const cards = page.locator(".slide-card");
    expect(await cards.count()).toBe(24);
    await expect(cards.first().locator(".slide-card__link")).toHaveAttribute(
      "href",
      /^\/assets\/pdfs\/slides\/.+\.pdf$/
    );
  });

  test("serves the deck thumbnails as optimized images", async ({ page }) => {
    const thumb = page.locator(".slide-card__thumb").first();
    await expect(thumb).toHaveAttribute("srcset", /\.webp\s\d+w/);
    await expect(thumb).toHaveAttribute("loading", "lazy");
  });
});
