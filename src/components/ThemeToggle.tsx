"use client";

import { useSyncExternalStore } from "react";

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
  try {
    if (m === "system") localStorage.removeItem(THEME_KEY);
    else localStorage.setItem(THEME_KEY, m);
  } catch {}
  if (m === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", m);
  window.dispatchEvent(new Event(THEME_EVENT));
}

function subscribeMode(cb: () => void) {
  window.addEventListener(THEME_EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(THEME_EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const mode = useSyncExternalStore(subscribeMode, readMode, () => "system" as Mode);
  const apply = applyMode;
  return (
    <div role="radiogroup" aria-label="Colour theme" className={`flex rounded-lg border border-line bg-surface-1 p-0.5 text-xs ${compact ? "w-full" : ""}`}>
      {(["system", "light", "dark"] as Mode[]).map((m) => (
        <button
          key={m}
          role="radio"
          aria-checked={mode === m}
          onClick={() => apply(m)}
          className={`${compact ? "flex-1" : ""} rounded-md px-2 py-1 capitalize transition-colors ${mode === m ? "bg-surface-3 text-ink" : "text-ink-3 hover:text-ink"}`}
        >
          {m}
        </button>
      ))}
    </div>
  );
}

