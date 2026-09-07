const { test, expect } = require("@playwright/test");

/**
 * The styleguide replaces Storybook: one URL per component, generated from the
 * fixture that also documents the component's arguments.
 */
const COMPONENTS = [
  ["breadcrumb", ".breadcrumb"],
  ["company-logos", ".companies-grid .company-item"],
  ["hero", ".hero-card"],
  ["navbar", ".nav-shell"],
  ["post-card", ".posts-index-card"],
  ["post-row", ".home-post-item"],
  ["posts-filter", ".posts-filter__chip.is-active"],
  ["project-card", ".project-card"],
  ["project-row", ".project-teaser-item"],
  ["prose", "p"],
  ["section-heading", ".section-heading"],
  ["slide-card", ".slide-card"],
  ["slide-row", ".home-slide-item"],
  ["tier-section", ".tier-section .project-card"],
];

test.describe("Styleguide", () => {
  test("indexes every component that has a fixture", async ({ page }) => {
    await page.goto("/styleguide/");
    await expect(page.locator(".styleguide-index a")).toHaveCount(
      COMPONENTS.length
    );
    for (const [name] of COMPONENTS) {
      await expect(
        page.locator(`.styleguide-index a[href="/styleguide/${name}/"]`)
      ).toHaveCount(1);
    }
  });

  test("renders a live preview, the arguments and the partial source", async ({
    page,
  }) => {
    await page.goto("/styleguide/slide-row/");
    await expect(page.locator("h1")).toContainText("slide-row");
    await expect(
      page.locator(".styleguide-preview .home-slide-item").first()
    ).toBeVisible();
    await expect(page.locator(".styleguide-args")).toContainText("title");
    await expect(page.locator(".styleguide-source")).toContainText(
      "home-slide-item__name"
    );
  });

  test("renders each component preview without breaking", async ({ page }) => {
    for (const [name, selector] of COMPONENTS) {
      await page.goto(`/styleguide/${name}/`);
      await expect(
        page.locator(`.styleguide-preview ${selector}`).first()
      ).toBeVisible();
    }
  });

  test("resolves wikilinks inside the prose component preview", async ({
    page,
  }) => {
    await page.goto("/styleguide/prose/");
    await expect(
      page.locator('.styleguide-preview a[href="/blog/agile/"]')
    ).toBeVisible();
    await expect(
      page.locator(".styleguide-preview .post-inline-link--missing")
    ).toBeVisible();
  });
});
