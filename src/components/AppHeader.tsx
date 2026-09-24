"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { useStore } from "@/lib/store";

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

function ThemeToggle() {
  const mode = useSyncExternalStore(subscribeMode, readMode, () => "system" as Mode);
  const apply = applyMode;
  return (
    <div role="radiogroup" aria-label="Colour theme" className="flex rounded-lg border border-line bg-surface-1 p-0.5 text-xs">
      {(["system", "light", "dark"] as Mode[]).map((m) => (
        <button
          key={m}
          role="radio"
          aria-checked={mode === m}
          onClick={() => apply(m)}
          className={`rounded-md px-2 py-1 capitalize transition-colors ${mode === m ? "bg-surface-3 text-ink" : "text-ink-3 hover:text-ink"}`}
        >
          {m}
        </button>
      ))}
    </div>
  );
}

const NAV = [
  { href: "/", label: "People" },
  { href: "/eval", label: "Evaluation" },
  { href: "/about", label: "How it works" },
];

export function AppHeader() {
  const { reset } = useStore();
  const path = usePathname();
  const [confirming, setConfirming] = useState(false);
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-canvas/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-display text-xl font-semibold text-ink">Seat Record</span>
          <span className="hidden font-mono text-[0.68rem] uppercase tracking-wider text-ink-3 sm:inline">Bonarda Works</span>
        </Link>
        <nav className="flex gap-1 text-sm">
          {NAV.map((n) => {
            const active = n.href === "/" ? path === "/" : path.startsWith(n.href);
            return (
              <Link key={n.href} href={n.href} className={`rounded-md px-2.5 py-1.5 ${active ? "bg-surface-2 text-ink" : "text-ink-2 hover:text-ink"}`}>
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          {confirming ? (
            <span className="flex items-center gap-1 text-xs">
              <span className="text-ink-3">Reset all demo data?</span>
              <button className="rounded-md px-2 py-1 text-danger hover:bg-danger-soft" onClick={() => { reset(); setConfirming(false); }}>Reset</button>
              <button className="rounded-md px-2 py-1 text-ink-2 hover:bg-surface-2" onClick={() => setConfirming(false)}>Cancel</button>
            </span>
          ) : (
            <button className="rounded-md px-2 py-1 text-xs text-ink-3 hover:bg-surface-2 hover:text-ink" onClick={() => setConfirming(true)}>Reset demo</button>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
