"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Watches an element and reports when it has scrolled out of view.
 * Used to reveal a compact bar only once the page's own header is gone.
 */
export function useScrolledPast<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [past, setPast] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setPast(!e.isIntersecting && e.boundingClientRect.top < 0), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, past };
}

/**
 * Compact bar pinned to the top of the content column. Zero height in the page flow,
 * so it never pushes content; it slides in when `show` is true. Sits below the phone top bar.
 */
export function CompactTopBar({ show, children }: { show: boolean; children: React.ReactNode }) {
  return (
    <div className="sticky top-[66px] z-20 h-0 lg:top-0">
      <div
        aria-hidden={!show}
        inert={!show}
        className="-mx-4 border-b border-line bg-canvas/90 px-4 py-2.5 backdrop-blur sm:-mx-8 sm:px-8"
        style={{
          opacity: show ? 1 : 0,
          transform: show ? "none" : "translateY(-8px)",
          transition: "opacity 180ms cubic-bezier(0.2, 0, 0, 1), transform 180ms cubic-bezier(0.2, 0, 0, 1)",
          pointerEvents: show ? "auto" : "none",
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">{children}</div>
      </div>
    </div>
  );
}

/** Action row pinned to the bottom of the viewport while its section is on screen. */
export function BottomActionBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="sticky bottom-0 z-20 -mx-4 border-t border-line bg-canvas/90 px-4 py-3 backdrop-blur sm:-mx-8 sm:px-8" style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}
