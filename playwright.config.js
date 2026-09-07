const { defineConfig, devices } = require("@playwright/test");

const liveBaseURL = process.env.LIVE_BASE_URL;

module.exports = defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["list"]],
  use: {
    baseURL: liveBaseURL || "http://localhost:1314",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: liveBaseURL
    ? undefined
    : {
        // Tests run against the real build output, not the dev server.
        command:
          "hugo --gc --minify && python3 -m http.server 1314 --directory public",
        url: "http://localhost:1314",
        reuseExistingServer: !process.env.CI,
        timeout: 120000,
      },
});
