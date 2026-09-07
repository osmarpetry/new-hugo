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

test.describe("Image weight", () => {
  test("serves every company logo optimized, not as a full-size original", async ({
    page,
    request,
  }) => {
    await page.goto("/");
    const sources = await page
      .locator(".company-item__logo")
      .evaluateAll((imgs) => imgs.map((i) => i.getAttribute("src")));
    expect(sources.length).toBeGreaterThan(5);

    for (const src of sources) {
      const res = await request.get(src);
      expect(res.status(), src).toBe(200);
      const type = res.headers()["content-type"];
      // SVG is already vector; everything else must be a modern raster format.
      if (type.includes("svg")) continue;
      expect(type, src).toMatch(/image\/(webp|avif)/);
      // The strip renders at max-height 2rem. Anything over this budget is a
      // full-resolution original being shrunk by the browser.
      const bytes = (await res.body()).length;
      expect(bytes, `${src} is ${Math.round(bytes / 1024)} KiB`).toBeLessThan(
        12 * 1024
      );
    }
  });

  test("marks the LCP hero image as high priority", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("img.hero-media__image")).toHaveAttribute(
      "fetchpriority",
      "high"
    );
  });

  test("leaves the lazy footer hero at default priority", async ({ page }) => {
    await page.goto("/projects/");
    const hero = page.locator("img.hero-media__image");
    await expect(hero).toHaveAttribute("loading", "lazy");
    expect(await hero.getAttribute("fetchpriority")).toBeNull();
  });
});
