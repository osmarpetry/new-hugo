const { test, expect } = require("@playwright/test");

test.describe("Home", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("renders the hero with the site owner name", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Osmar Petry");
  });

  test("renders the shell: navbar links and footer", async ({ page }) => {
    await expect(page.locator(".nav-brand")).toBeVisible();
    await expect(page.locator('a.nav-link[href="/blog/"]')).toBeVisible();
    await expect(page.locator('a.nav-link[href="/slides/"]')).toBeVisible();
    await expect(page.locator(".site-footer")).toBeVisible();
  });

  test("serves the hero image as webp/avif with explicit dimensions", async ({
    page,
  }) => {
    const img = page.locator(".hero-media__image").first();
    await expect(img).toBeVisible();
    await expect(img).toHaveAttribute("width", /\d+/);
    await expect(img).toHaveAttribute("height", /\d+/);
    const srcset = await img.getAttribute("srcset");
    expect(srcset).toMatch(/\.(webp|avif)\s/);

    // A wrong `sizes` attribute makes the browser download an image smaller
    // than the box it is painted into, which looks blurry.
    const picked = await img.evaluate((el) => ({
      natural: el.naturalWidth,
      css: Math.round(el.getBoundingClientRect().width),
    }));
    expect(picked.natural).toBeGreaterThanOrEqual(picked.css);
  });

  test("lists the latest posts from content, newest first", async ({ page }) => {
    const items = page.locator("#latest-posts .home-post-item");
    await expect(items).toHaveCount(4);
    const firstHref = await items
      .first()
      .locator("a")
      .getAttribute("href");
    expect(firstHref).toMatch(/^\/blog\/[a-zA-Z0-9-]+\/$/);
  });

  test("lists the featured slides linking to local PDFs", async ({ page }) => {
    const items = page.locator("#featured-slides .home-slide-item");
    await expect(items).toHaveCount(3);
    await expect(items.first().locator("a")).toHaveAttribute(
      "href",
      /^\/assets\/pdfs\/slides\/.+\.pdf$/
    );
  });

  test("has SEO head: canonical, description, open graph and JSON-LD", async ({
    page,
  }) => {
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      "https://osmarpetry.dev/"
    );
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      /Senior Software Engineer/
    );
    await expect(page.locator('meta[property="og:title"]')).toHaveCount(1);
    await expect(
      page.locator('script[type="application/ld+json"]')
    ).not.toHaveCount(0);
  });
});
