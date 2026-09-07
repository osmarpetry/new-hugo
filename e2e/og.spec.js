const { test, expect } = require("@playwright/test");

/**
 * Every page needs its own social card: this is what shows up when the URL is
 * pasted into LinkedIn, Slack or WhatsApp.
 */
const PAGES = ["/", "/projects/", "/blog/", "/resume/", "/slides/", "/blog/agile/"];

test.describe("Open Graph images", () => {
  for (const path of PAGES) {
    test(`generates a social card for ${path}`, async ({ page, request }) => {
      await page.goto(path);

      const image = await page
        .locator('meta[property="og:image"]')
        .getAttribute("content");
      expect(image).toMatch(/^https:\/\/osmarpetry\.dev\/.+\.jpe?g$/);

      await expect(
        page.locator('meta[property="og:image:width"]')
      ).toHaveAttribute("content", "1200");
      await expect(
        page.locator('meta[property="og:image:height"]')
      ).toHaveAttribute("content", "630");
      await expect(
        page.locator('meta[property="og:image:alt"]')
      ).not.toHaveAttribute("content", "");

      const res = await request.get(new URL(image).pathname);
      expect(res.status()).toBe(200);
      expect(res.headers()["content-type"]).toContain("image/jpeg");
      expect((await res.body()).length).toBeGreaterThan(10000);
    });
  }

  test("cards differ per page", async ({ page }) => {
    const read = async (path) => {
      await page.goto(path);
      return page.locator('meta[property="og:image"]').getAttribute("content");
    };
    expect(await read("/")).not.toBe(await read("/blog/agile/"));
  });
});
