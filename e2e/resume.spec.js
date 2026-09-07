const { test, expect } = require("@playwright/test");

test.describe("Resume", () => {
  test("renders the markdown as the resume page", async ({ page }) => {
    await page.goto("/resume/");
    await expect(page.locator(".markdown-prose")).toBeVisible();
    await expect(page.locator(".resume-prose")).toBeVisible();
    await expect(page.locator(".resume-contact")).toBeVisible();
    await expect(page.locator("h1")).toContainText("Osmar Petry");
  });

  test("offers the PDF download", async ({ page }) => {
    await page.goto("/resume/");
    const pdfBtn = page.locator(".resume-pdf-btn");
    await expect(pdfBtn).toBeVisible();
    await expect(pdfBtn).toHaveAttribute("href", /resume.*\.pdf$/);
    const pdf = await page.request.get(
      await pdfBtn.getAttribute("href")
    );
    expect(pdf.status()).toBe(200);
  });

  /** github.com/osmarpetry/dns-cv reads this file, so it must stay verbatim. */
  test("publishes the raw markdown at /resume.md for the DNS CV", async ({
    request,
  }) => {
    const res = await request.get("/resume.md");
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body.startsWith("# Osmar Petry")).toBe(true);
    expect(body).toContain('<ul class="resume-contact">');
  });
});
