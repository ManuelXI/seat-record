import { defineConfig } from "@playwright/test";

// Runs against the hosted demo unless BASE_URL is set, for example BASE_URL=http://localhost:3000.
// Every test starts in a fresh browser, so demo data always starts from the seed.
const size = { width: 1440, height: 900 };

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 120_000,
  expect: { timeout: 15_000 },
  reporter: [["list"]],
  use: {
    baseURL: process.env.BASE_URL ?? "https://seat-record.onrender.com",
    viewport: size,
    colorScheme: "dark",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "check" },
    // A 1920x1200 viewport for the HD recording (tests/e2e/hd-recorder.ts); demo.spec.ts scales the
    // root font size by 4/3 so the rem-based layout matches the 1440px check run, only sharper.
    // Tracing is off because it shares the page's screencast and would pin it at 800px wide.
    { name: "record", use: { viewport: { width: 1920, height: 1200 }, trace: "off", launchOptions: { slowMo: 60 } } },
  ],
});
