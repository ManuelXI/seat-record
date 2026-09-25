"use client";

import { useEffect, useState } from "react";

const STEPS = [
  {
    label: "Capture and approve",
    body: "Seat Record captures what employees, contractors and freelancers did inside client teams, strips out anything confidential, and gets the client to approve it inside an email they already send.",
  },
  {
    label: "Find people",
    body: "When the next client brief lands, managers search that approved evidence to find who has already done the work.",
    link: { href: "#next-brief", text: "See an example ↓" },
  },
];

const HOLD_MS = 7000;

/**
 * The hero's two-step pitch, one step at a time. Advances on its own, pauses on hover or keyboard focus,
 * and stops for good once someone picks a step. Both steps stay in the DOM, stacked in one grid cell,
 * so the height never jumps and screen readers can reach either.
 */
export function HeroSteps() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [chosen, setChosen] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const auto = !reduced && !chosen && !paused;
  useEffect(() => {
    if (!auto) return;
    const id = setTimeout(() => setIndex((i) => (i + 1) % STEPS.length), HOLD_MS);
    return () => clearTimeout(id);
  }, [auto, index]);

  return (
    <div
      className="max-w-xl space-y-3"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={(e) => { if (e.target.matches(":focus-visible")) setPaused(true); }}
      onBlur={() => setPaused(false)}
    >
      <div role="tablist" aria-label="How Seat Record works" className="flex flex-wrap gap-2">
        {STEPS.map((s, i) => {
          const active = i === index;
          return (
            <button
              key={s.label}
              role="tab"
              id={`hero-step-${i}`}
              aria-selected={active}
              aria-controls={`hero-panel-${i}`}
              onClick={() => { setIndex(i); setChosen(true); }}
              className={`relative flex items-center gap-2 overflow-hidden rounded-full border px-3 py-1 text-sm transition-colors duration-200 ${
                active ? "border-accent bg-accent-soft text-accent-soft-ink" : "border-line text-ink-3 hover:border-line-strong hover:text-ink"
              }`}
            >
              <span className="font-mono text-xs">Step {i + 1}</span>
              <span>{s.label}</span>
              {active && auto && (
                <span
                  aria-hidden
                  key={`bar-${index}`}
                  className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-accent"
                  style={{ animation: `hero-step-fill ${HOLD_MS}ms linear forwards` }}
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="grid">
        {STEPS.map((s, i) => {
          const active = i === index;
          return (
            <p
              key={s.label}
              role="tabpanel"
              id={`hero-panel-${i}`}
              aria-labelledby={`hero-step-${i}`}
              aria-hidden={!active}
              className="col-start-1 row-start-1 text-lg text-ink-2 transition-[opacity,translate] duration-300 ease-out"
              style={{ opacity: active ? 1 : 0, translate: active || reduced ? "0 0" : "0 6px", pointerEvents: active ? "auto" : "none" }}
            >
              {s.body}
              {s.link && (
                <>
                  {" "}
                  <a href={s.link.href} tabIndex={active ? 0 : -1} className="whitespace-nowrap text-accent underline-offset-4 hover:underline">
                    {s.link.text}
                  </a>
                </>
              )}
            </p>
          );
        })}
      </div>
    </div>
  );
}
