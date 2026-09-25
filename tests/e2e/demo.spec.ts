import { mkdirSync, writeFileSync } from "node:fs";
import { test } from "@playwright/test";
import { FAST, runDemo, type Pace } from "./demo-flow";
import { startHdRecording } from "./hd-recorder";

// Recording only: scale the rem-based layout by 4/3 so the 1920px viewport lays out like the 1440px
// check run, and draw a dot that follows the mouse, since headless video has no cursor.
const CURSOR = `
  addEventListener("DOMContentLoaded", () => {
    const zoom = document.createElement("style");
    zoom.textContent = "html { font-size: 21.3333px !important; }";
    document.head.appendChild(zoom);
    const dot = document.createElement("div");
    dot.style.cssText = "position:fixed;left:0;top:0;width:28px;height:28px;margin:-14px 0 0 -14px;border-radius:50%;" +
      "background:rgba(110,190,160,.35);border:2px solid rgba(110,190,160,.95);pointer-events:none;z-index:2147483647;" +
      "transition:transform .12s ease;transform:translate(-100px,-100px)";
    document.body.appendChild(dot);
    let x = -100, y = -100, s = 1;
    const draw = () => { dot.style.transform = "translate(" + x + "px," + y + "px) scale(" + s + ")"; };
    addEventListener("mousemove", (e) => { x = e.clientX; y = e.clientY; draw(); }, true);
    addEventListener("mousedown", () => { s = 0.7; draw(); }, true);
    addEventListener("mouseup", () => { s = 1; draw(); }, true);
  });
`;

test("demo script runs end to end", async ({ page }, info) => {
  const recording = info.project.name === "record";
  if (!recording) return runDemo(page, FAST);

  test.setTimeout(15 * 60_000);
  await page.addInitScript(CURSOR);

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
