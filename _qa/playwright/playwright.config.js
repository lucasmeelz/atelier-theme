import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  outputDir: "../../_qa/snapshots",
  workers: 1,
  retries: 0,
  timeout: 15000,
  reporter: [["html", { outputFolder: "../../_qa/reports", open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:9292",
    screenshot: "only-on-failure",
    video: "off",
  },
  projects: [
    {
      name: "desktop-standard",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: "desktop-reduced-motion",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
        reducedMotion: "reduce",
      },
    },
    {
      name: "mobile",
      use: {
        ...devices["iPhone 14"],
      },
    },
  ],
});
