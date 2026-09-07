const { test, expect } = require("@playwright/test");

test.describe("Code highlighting", () => {
  test("colors code fences at build time, with no client-side highlighter", async ({
    page,
  }) => {
    await page.goto("/blog/javascript-set-map-hash/");

    const block = page.locator(".markdown-prose pre").first();
    await expect(block).toBeVisible();
    // Chroma emits per-token spans; a keyword must not be the default colour.
    const keyword = page.locator(".markdown-prose .chroma .k, .markdown-prose .chroma .kd").first();
    await expect(keyword).toBeVisible();
    const color = await keyword.evaluate((el) => getComputedStyle(el).color);
    expect(color).not.toBe("rgb(0, 0, 0)");

    // The code block keeps the site's dark panel, not Chroma's own background.
    const background = await block.evaluate(
      (el) => getComputedStyle(el).backgroundColor
    );
    expect(background).toBe("rgb(31, 27, 46)");

    // No highlight.js, no runtime cost.
    const scripts = await page
      .locator("script[src]")
      .evaluateAll((els) => els.map((el) => el.getAttribute("src")));
    expect(scripts.join(" ")).not.toMatch(/highlight|hljs/);
  });
});
