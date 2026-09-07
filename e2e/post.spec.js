const { test, expect } = require("@playwright/test");

test.describe("Post rendering", () => {
  test("renders markdown prose at the blog permalink", async ({ page }) => {
    await page.goto("/blog/agile/");
    await expect(page.locator("h1")).toContainText("Agile");
    await expect(page.locator(".markdown-prose")).toBeVisible();
    await expect(page.locator(".markdown-prose h2").first()).toBeVisible();
  });

  test("resolves an Obsidian wikilink to the referenced post", async ({
    page,
  }) => {
    await page.goto("/blog/agile/");
    const link = page.getByRole("link", { name: /Shape Up/ });
    await expect(link).toHaveAttribute("href", "/blog/shape-up-2020/");
    await link.click();
    await expect(page).toHaveURL(/\/blog\/shape-up-2020\/$/);
    await expect(page.locator("h1")).toContainText("Shape Up");
  });

  test("marks a wikilink whose target post does not exist", async ({ page }) => {
    await page.goto("/blog/javascript-prototype/");
    const missing = page.locator(".post-inline-link--missing").first();
    await expect(missing).toBeVisible();
    await expect(missing).toHaveText("Generator");
    await expect(missing).toHaveAttribute("title", "Page does not exist.");
  });
});

/**
 * Obsidian also links notes as plain relative paths, `[BDD](bdd.md)`. The
 * Gatsby build shipped those verbatim, so they 404'd; they are resolved here
 * the same way wikilinks are.
 */
test.describe("Relative note links", () => {
  test("resolves a relative markdown link to the post", async ({ page }) => {
    await page.goto("/blog/tdd-systematic-review-2016/");
    const link = page.getByRole("link", { name: "BDD", exact: true });
    await expect(link).toHaveAttribute("href", "/blog/bdd/");
    await link.click();
    await expect(page).toHaveURL(/\/blog\/bdd\/$/);
  });

  test("marks a relative link whose note does not exist", async ({ page }) => {
    await page.goto("/blog/tdd-systematic-review-2016/");
    await expect(
      page
        .locator(".post-inline-link--missing")
        .filter({ hasText: "Gophers Workshop" })
    ).toBeVisible();
  });
});
