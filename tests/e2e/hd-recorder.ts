import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import type { Page } from "@playwright/test";

/**
 * Sharper video than Playwright's built-in recorder, which encodes at a fixed 1 Mbit/s.
 * Captures high-quality JPEG frames through page.screencast while the demo runs, then encodes
 * them offline at a high bitrate: MP4 (H.264) through macOS AVFoundation when the output ends in .mp4,
 * otherwise WebM (VP8) with the ffmpeg Playwright installs.
 */

function findFfmpeg(): string {
  if (process.env.FFMPEG) return process.env.FFMPEG;
  const root = process.env.PLAYWRIGHT_BROWSERS_PATH ?? join(homedir(), "Library", "Caches", "ms-playwright");
  const dirs = existsSync(root) ? readdirSync(root).filter((d) => d.startsWith("ffmpeg-")).sort().reverse() : [];
  for (const d of dirs) {
    for (const bin of ["ffmpeg-mac", "ffmpeg-linux", "ffmpeg-win64.exe"]) {
      if (existsSync(join(root, d, bin))) return join(root, d, bin);
    }
  }
  throw new Error("ffmpeg not found. Run `npx playwright install ffmpeg`, or set FFMPEG to an ffmpeg binary.");
}

export async function startHdRecording(page: Page, opts: { out: string; size: { width: number; height: number }; fps?: number }) {
  const fps = opts.fps ?? 30;
  const framesDir = `${opts.out}.frames`;
  rmSync(framesDir, { recursive: true, force: true });
  mkdirSync(framesDir, { recursive: true });

  // The screencast only sends a frame when the page changes; each one is stamped with its arrival time.
  const stamps: number[] = [];
  const t0 = Date.now();
  await page.screencast.start({
    size: opts.size,
    quality: 95,
    onFrame: ({ data }) => {
      writeFileSync(join(framesDir, `${String(stamps.length).padStart(6, "0")}.jpg`), data);
      stamps.push(Date.now() - t0);
    },
  });

  return {
    startedAt: t0,
    async stop() {
      await page.screencast.stop();
      const end = Date.now() - t0;
      if (!stamps.length) throw new Error("No frames were captured");
      const frame = (i: number) => join(framesDir, `${String(i).padStart(6, "0")}.jpg`);

      if (opts.out.endsWith(".mp4")) {
        // H.264 through macOS AVFoundation; timestamps must strictly increase.
        let prev = -1;
        const list = stamps.map((ms, i) => { prev = Math.max(ms, prev + 1); return `${prev} ${frame(i)}`; });
        list.push(`${Math.max(end, prev + 1)} END`);
        writeFileSync(join(framesDir, "frames.txt"), list.join("\n"));
        const swift = spawn("swift", [join(__dirname, "encode-mp4.swift"), join(framesDir, "frames.txt"), opts.out,
          String(opts.size.width), String(opts.size.height)], { stdio: "inherit" });
        await new Promise<void>((resolve, reject) =>
          swift.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`MP4 encode exited with ${code}`)))));
        rmSync(framesDir, { recursive: true, force: true });
        return;
      }

      const ffmpeg = spawn(findFfmpeg(), [
        "-loglevel", "error", "-y",
        "-f", "image2pipe", "-c:v", "mjpeg", "-framerate", String(fps), "-i", "pipe:0",
        "-c:v", "libvpx", "-b:v", "12M", "-crf", "4", "-qmin", "0", "-qmax", "30",
        "-deadline", "good", "-cpu-used", "2", "-auto-alt-ref", "0", "-pix_fmt", "yuv420p",
        opts.out,
      ], { stdio: ["pipe", "inherit", "inherit"] });
      const done = new Promise<void>((resolve, reject) =>
        ffmpeg.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exited with ${code}`)))));

      // Constant frame rate: each output frame repeats the latest captured frame at that moment.
      let next = 0;
      let current = readFileSync(frame(0));
      for (let i = 0; i * (1000 / fps) <= end; i++) {
        const t = i * (1000 / fps);
        let changed = false;
        while (next < stamps.length && stamps[next] <= t) { next++; changed = true; }
        if (changed) current = readFileSync(frame(next - 1));
        if (!ffmpeg.stdin.write(current)) await new Promise((r) => ffmpeg.stdin.once("drain", r));
      }
      ffmpeg.stdin.end();
      await done;
      rmSync(framesDir, { recursive: true, force: true });
    },
  };
}
