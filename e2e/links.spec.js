const { test, expect } = require("@playwright/test");

const LINKTREE_URL = "https://linktree.osmarpetry.dev";

test.describe("Linktree link", () => {
  test("hero exposes the linktree next to the social icons", async ({ page }) => {
    await page.goto("/");
    const heroLink = page.locator(`.hero-socials a[href="${LINKTREE_URL}"]`);
    await expect(heroLink).toBeVisible();
    await expect(heroLink).toHaveAttribute("aria-label", "Linktree");
    await expect(heroLink).toHaveAttribute("target", "_blank");
  });

  test("navbar links to the linktree", async ({ page }) => {
    await page.goto("/");
    const navLink = page.locator(`a.nav-link[href="${LINKTREE_URL}"]`);
    await expect(navLink).toHaveText("Linktree");
    await expect(navLink).toHaveAttribute("target", "_blank");
  });

  test("does not ship a local /links/ route", async ({ request }) => {
    expect((await request.get("/links/")).status()).toBe(404);
  });
});
