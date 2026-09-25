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
    { name: "record", use: { video: { mode: "on", size }, launchOptions: { slowMo: 60 } } },
  ],
});
