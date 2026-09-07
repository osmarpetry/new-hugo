const { test, expect } = require("@playwright/test");

test.describe("Blog index", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/blog/");
  });

  test("displays the blog heading and every post as a card", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Blog.");
    const cards = page.locator(".posts-index-card");
    await expect(cards.first()).toBeVisible();
    expect(await cards.count()).toBe(39);
  });

  test("shows 'All posts' as the active chip by default", async ({ page }) => {
    const allPosts = page.locator(".posts-filter__chip").first();
    await expect(allPosts).toHaveClass(/is-active/);
    await expect(allPosts).toContainText("All posts");
    await expect(page.locator(".breadcrumb__current")).toContainText("All Posts");
  });

  /**
   * The filter is server-rendered now: every chip is a real link to a tag page,
   * so the state lives in the URL instead of in JavaScript.
   */
  test("filters by tag through a real URL", async ({ page }) => {
    const chip = page.locator('.posts-filter__chip[href="/tags/testing/"]');
    await expect(chip).toBeVisible();
    await chip.click();

    await expect(page).toHaveURL(/\/tags\/testing\/$/);
    await expect(
      page.locator('.posts-filter__chip[href="/tags/testing/"]')
    ).toHaveClass(/is-active/);
    await expect(page.locator(".breadcrumb__current")).toContainText("testing");

    const cards = page.locator(".posts-index-card");
    const shown = await cards.count();
    expect(shown).toBeGreaterThan(0);
    expect(shown).toBeLessThan(39);
    await expect(page.locator(".posts-filter__status")).toContainText(
      `${shown} post`
    );
  });

  test("clears the filter back to all posts", async ({ page }) => {
    await page.goto("/tags/testing/");
    await page.locator('.posts-filter__chip[href="/blog/"]').click();
    await expect(page).toHaveURL(/\/blog\/$/);
    await expect(page.locator(".posts-filter__chip").first()).toHaveClass(
      /is-active/
    );
  });

  test("every tag chip resolves to a page that exists", async ({ page, request }) => {
    const hrefs = await page
      .locator(".posts-filter__chip")
      .evaluateAll((els) => els.map((el) => el.getAttribute("href")));
    expect(hrefs.length).toBeGreaterThan(5);
    for (const href of hrefs) {
      expect((await request.get(href)).status()).toBe(200);
    }
  });
});
