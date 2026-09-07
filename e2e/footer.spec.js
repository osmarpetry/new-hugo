const { test, expect } = require("@playwright/test");

test.describe("Footer", () => {
  test("credits Hugo with the version that built the site", async ({ page }) => {
    await page.goto("/");
    const footer = page.locator(".site-footer");
    await expect(footer).toContainText(`© ${new Date().getFullYear()}`);
    const hugoLink = footer.getByRole("link", { name: /Hugo@\d+\.\d+\.\d+/ });
    await expect(hugoLink).toHaveAttribute("href", "https://gohugo.io/");
    await expect(footer.getByRole("link", { name: "Back to top" })).toBeVisible();
  });
});
