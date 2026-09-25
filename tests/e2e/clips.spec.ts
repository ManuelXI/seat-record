import { mkdirSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { RECORDING_INIT, startHdRecording } from "./hd-recorder";

// Short HD clips to splice into the demo video. Run with `npm run demo:clip`.
test("clip: Ama sees the count of unshared lines", async ({ page }, info) => {
  test.skip(info.project.name !== "record", "Clips are recorded in the record project only");
  test.setTimeout(5 * 60_000);
  await page.addInitScript(RECORDING_INIT);
  const main = page.getByRole("main");

  // Off camera: reach the same state as the main video, with Efua's new entry approved.
  await page.request.get("/", { timeout: 120_000 });
  await page.goto("/signin");
  await page.getByText("Sign in as Efua →").click();
  await expect(page).toHaveURL(/\/worker\/w1$/);
  await page.goto("/worker/w1/new");
  await page.getByRole("button", { name: /Client system name/ }).click();
  await page.getByRole("button", { name: "upstream", exact: true }).click();
  await page.getByRole("button", { name: "Check and draft lines" }).click();
  await page.getByRole("button", { name: "Use “risk”" }).click();
  const lines = page.getByRole("textbox", { name: "Line text" });
  await expect(lines.first()).toBeVisible();
  for (let i = 0; i < (await lines.count()); i++) {
    if ((await lines.nth(i).inputValue()).startsWith("Eliminated")) await lines.nth(i).fill("Removed recurring failures in an overnight process");
  }
  await page.getByRole("button", { name: /^Approve \d+ lines$/ }).click();
  await expect(page).toHaveURL(/\/worker\/w1$/);
  await page.getByRole("button", { name: /· Switch/ }).click();
  await page.getByRole("dialog", { name: "Switch user" }).getByRole("button", { name: /Ama Boateng/ }).click();
  await expect(main.getByText("Needs attention")).toBeVisible();
  await main.getByRole("link", { name: "Engagement", exact: true }).first().click();
  const count = main.getByText(/lines in Efua’s log not yet shared/);
  await expect(count).toBeVisible();
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1_000);

  // On camera: the top of the engagement page, a glide down to the count, then the checkpoint form.
  mkdirSync("recordings", { recursive: true });
  const out = `recordings/clip-unshared-count.${process.platform === "darwin" ? "mp4" : "webm"}`;
  const recorder = await startHdRecording(page, { out, size: { width: 1920, height: 1200 } });
  await page.waitForTimeout(2_000);
  await count.evaluate((el) => el.scrollIntoView({ behavior: "smooth", block: "center" }));
  await page.waitForTimeout(5_000);
  await page.getByRole("button", { name: "Open checkpoint" }).evaluate((el) => el.scrollIntoView({ behavior: "smooth", block: "center" }));
  await page.waitForTimeout(3_500);
  await recorder.stop();
});
