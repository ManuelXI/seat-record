"use client";

import { useSyncExternalStore } from "react";
import { IconMonitor, IconMoon, IconSun } from "./icons";

type Mode = "system" | "light" | "dark";
const THEME_KEY = "seat-record-theme";
const THEME_EVENT = "seat-record-theme-change";

function readMode(): Mode {
  try {
    const t = localStorage.getItem(THEME_KEY);
    return t === "light" || t === "dark" ? t : "system";
  } catch {
    return "system";
  }
}

function applyMode(m: Mode) {
  const root = document.documentElement;
  // Snap between themes: without this every colour transition fires at once and the page smears.
  const freeze = document.createElement("style");
  freeze.textContent = "*,*::before,*::after{transition:none!important}";
  document.head.appendChild(freeze);
  try {
    if (m === "system") localStorage.removeItem(THEME_KEY);
    else localStorage.setItem(THEME_KEY, m);
  } catch {}
  if (m === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", m);
  window.dispatchEvent(new Event(THEME_EVENT));
  void root.offsetHeight; // force a reflow with transitions off
  // Remove on the next frame, with a timer as a backstop for throttled background tabs.
  const release = () => freeze.isConnected && freeze.remove();
  requestAnimationFrame(release);
  setTimeout(release, 50);
}

function subscribeMode(cb: () => void) {
  window.addEventListener(THEME_EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(THEME_EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

const OPTIONS: { mode: Mode; label: string; Icon: () => React.JSX.Element }[] = [
  { mode: "system", label: "System", Icon: IconMonitor },
  { mode: "light", label: "Light", Icon: IconSun },
  { mode: "dark", label: "Dark", Icon: IconMoon },
];

/** Icon-only in the top bar; icons with labels when `compact` (the full-width sidebar version). */
export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const mode = useSyncExternalStore(subscribeMode, readMode, () => "system" as Mode);
  return (
    <div role="radiogroup" aria-label="Colour theme" className={`flex rounded-lg border border-line bg-surface-1 p-0.5 ${compact ? "w-full text-xs" : ""}`}>
      {OPTIONS.map(({ mode: m, label, Icon }) => (
        <button
          key={m}
          role="radio"
          aria-checked={mode === m}
          aria-label={`${label} theme`}
          title={`${label} theme`}
          onClick={() => applyMode(m)}
          className={`flex items-center justify-center gap-1.5 rounded-md transition-colors duration-150 ${compact ? "flex-1 px-2 py-1" : "h-8 w-8"} ${mode === m ? "bg-surface-3 text-ink" : "text-ink-3 hover:text-ink"}`}
        >
          <Icon />
          {compact && <span>{label}</span>}
        </button>
      ))}
    </div>
  );
}
