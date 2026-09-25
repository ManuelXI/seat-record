import { mkdirSync, writeFileSync } from "node:fs";
import { test } from "@playwright/test";
import { FAST, runDemo, type Pace } from "./demo-flow";
import { RECORDING_INIT, startHdRecording } from "./hd-recorder";

test("demo script runs end to end", async ({ page }, info) => {
  const recording = info.project.name === "record";
  if (!recording) return runDemo(page, FAST);

  test.setTimeout(15 * 60_000);
  await page.addInitScript(RECORDING_INIT);

  // Wake the free-plan server and load the landing page before capture starts, so the video opens on it.
  await page.request.get("/", { timeout: 120_000 });
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1_000);

  mkdirSync("recordings", { recursive: true });
  // MP4 (H.264) on macOS through AVFoundation; WebM elsewhere.
  const out = `recordings/seat-record-demo.${process.platform === "darwin" ? "mp4" : "webm"}`;
  const recorder = await startHdRecording(page, { out, size: { width: 1920, height: 1200 } });
  const started = recorder.startedAt;
  const chapters: string[] = [];
  const stamp = () => {
    const s = Math.round((Date.now() - started) / 1000);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  };
  const scale = Number(process.env.PACE ?? 1);
  const pace: Pace = { beat: 900 * scale, typing: 45 * scale, chapter: (t) => chapters.push(`${stamp()}  ${t}`) };

  await runDemo(page, pace);
  chapters.push(`${stamp()}  End`);

  writeFileSync("recordings/chapters.txt", chapters.join("\n") + "\n");
  await recorder.stop();
});
