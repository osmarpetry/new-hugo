const { test, expect } = require("@playwright/test");

const MEASUREMENT_ID = "G-3STVN66PY5";

test.describe("Feeds and crawlers", () => {
  test("publishes the RSS feed at /rss.xml with the posts", async ({ request }) => {
    const res = await request.get("/rss.xml");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("xml");
    const body = await res.text();
    expect(body).toContain("<title>Osmar Petry</title>");
    expect(body).toContain("/blog/agile/");
  });

  test("links the feed from the head", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.locator('link[rel="alternate"][type="application/rss+xml"]')
    ).toHaveAttribute("href", /\/rss\.xml$/);
  });

  test("publishes robots.txt and a sitemap covering every page", async ({
    request,
  }) => {
    expect((await request.get("/robots.txt")).status()).toBe(200);
    const sitemap = await (await request.get("/sitemap.xml")).text();
    for (const path of ["/blog/", "/projects/", "/resume/", "/slides/", "/blog/agile/"]) {
      expect(sitemap).toContain(path);
    }
  });

  test("ships a web app manifest and an icon", async ({ page, request }) => {
    await page.goto("/");
    const href = await page
      .locator('link[rel="manifest"]')
      .getAttribute("href");
    const manifest = await (await request.get(href)).json();
    expect(manifest.name).toBe("Osmar Petry");
    expect(manifest.theme_color).toBe("#6c5a9a");
    expect((await request.get(manifest.icons[0].src)).status()).toBe(200);
  });
});

test.describe("GA4 analytics", () => {
  test("installs the gtag and queues the first page view", async ({ page }) => {
    await page.route(/https:\/\/.*google-analytics\.com\/g\/collect.*/, (route) =>
      route.abort()
    );
    await page.goto("/");

    await expect(
      page.locator(
        `script[src="https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}"]`
      )
    ).toHaveCount(1);

    const html = await page.content();
    expect(html).toContain(MEASUREMENT_ID);
    expect(html).not.toMatch(/UA-\d+-\d+/);

    await expect
      .poll(() =>
        page.evaluate(() => {
          const entries = window.dataLayer || [];
          const read = (entry, index) => entry?.[index] || entry?.[String(index)];
          return entries.some(
            (entry) => read(entry, 0) === "config" && read(entry, 1) === "G-3STVN66PY5"
          );
        })
      )
      .toBe(true);
  });

  test("respects Do Not Track", async ({ browser }) => {
    const context = await browser.newContext();
    await context.addInitScript(() => {
      Object.defineProperty(navigator, "doNotTrack", { get: () => "1" });
    });
    const page = await context.newPage();
    await page.goto("/");
    expect(await page.evaluate(() => window.dataLayer)).toBeUndefined();
    await context.close();
  });
});
