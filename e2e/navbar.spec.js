const { test, expect } = require("@playwright/test");

/** The whole site ships ~40 lines of JavaScript, and this is all of it. */
test.describe("Mobile navigation", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("opens and closes from the toggle button", async ({ page }) => {
    await page.goto("/");
    const shell = page.locator(".nav-shell");
    const toggle = page.locator("[data-nav-toggle]");

    await expect(shell).not.toHaveClass(/is-open/);
    await expect(toggle).toHaveAttribute("aria-expanded", "false");

    await toggle.click();
    await expect(shell).toHaveClass(/is-open/);
    await expect(toggle).toHaveAttribute("aria-expanded", "true");

    await toggle.click();
    await expect(shell).not.toHaveClass(/is-open/);
  });

  test("closes on Escape and on an outside click", async ({ page }) => {
    await page.goto("/");
    const shell = page.locator(".nav-shell");

    await page.locator("[data-nav-toggle]").click();
    await expect(shell).toHaveClass(/is-open/);
    await page.keyboard.press("Escape");
    await expect(shell).not.toHaveClass(/is-open/);

    await page.locator("[data-nav-toggle]").click();
    await expect(shell).toHaveClass(/is-open/);
    await page.mouse.click(200, 700); // anywhere outside the nav
    await expect(shell).not.toHaveClass(/is-open/);
  });
});
