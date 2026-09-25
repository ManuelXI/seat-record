import { mkdirSync, writeFileSync } from "node:fs";
import { test } from "@playwright/test";
import { FAST, runDemo, type Pace } from "./demo-flow";

// A dot that follows the mouse, since headless video has no cursor. Recording only.
const CURSOR = `
  addEventListener("DOMContentLoaded", () => {
    const dot = document.createElement("div");
    dot.style.cssText = "position:fixed;left:0;top:0;width:22px;height:22px;margin:-11px 0 0 -11px;border-radius:50%;" +
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

  test.setTimeout(10 * 60_000);
  await page.addInitScript(CURSOR);
  const started = Date.now();
  const chapters: string[] = [];
  const stamp = () => {
    const s = Math.round((Date.now() - started) / 1000);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  };
  const scale = Number(process.env.PACE ?? 1);
  const pace: Pace = { beat: 900 * scale, typing: 45 * scale, chapter: (t) => chapters.push(`${stamp()}  ${t}`) };

  await runDemo(page, pace);
  chapters.push(`${stamp()}  End`);

  mkdirSync("recordings", { recursive: true });
  writeFileSync("recordings/chapters.txt", chapters.join("\n") + "\n");
  const video = page.video();
  await page.close();
  await video?.saveAs("recordings/seat-record-demo.webm");
});
