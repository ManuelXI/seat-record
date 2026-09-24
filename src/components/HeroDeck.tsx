"use client";

import { useEffect, useRef, useState } from "react";
import type { Tier } from "@/lib/types";
import { TierChip } from "./ui";

/*
  Motion plan, one coordinated sequence per card (all timings in ms from the card coming forward):
    0     card settles to the front
    500   strike-through draws across the vague "before" lines
    1300  approved lines rise in, 100 apart (staggered entrance), chips pop as each lands
    2600  check mark draws, "signature valid" fades in
    7000  deck rotates: front card drops to the back, next comes forward
  Hover or keyboard focus holds the rotation (the front card still finishes). Reduced motion shows the final state, no autoplay.
*/

interface Profile {
  key: string;
  type: "Employee" | "Contractor" | "Freelancer";
  role: string;
  meta: string;
  before: string[];
  after: { text: string; tier: Tier; quote?: boolean }[];
  approval: string;
}

const PROFILES: Profile[] = [
  {
    key: "efua", type: "Employee",
    role: "Backend engineer · Global investment bank, risk technology",
    meta: "Efua Mensah · 14 months",
    before: ["Worked on client systems (confidential).", "Developed and maintained features."],
    after: [
      { text: "Rebuilt a failing nightly reconciliation job in Java and Spring Boot so it runs unattended", tier: "client-approved" },
      { text: "Added consumer-side retries and dead-letter handling to Kafka event processing", tier: "client-approved" },
      { text: "Ran the team’s incident review for a failed overnight run", tier: "manager-witnessed" },
    ],
    approval: "Approved by the client lead, 20 Feb 2026",
  },
  {
    key: "kofi", type: "Contractor",
    role: "Backend contractor · Payments fintech, Lisbon",
    meta: "Kofi Asante · 6 months",
    before: ["Contract ended 28 Aug 2026.", "No record of the work kept."],
    after: [
      { text: "Built a payment reconciliation service in Kotlin", tier: "client-approved" },
      { text: "Paired with the client’s QA lead to shape the release checklist", tier: "client-approved" },
      { text: "Dependable under release pressure; left us a service we could own on day one.", tier: "client-approved", quote: true },
    ],
    approval: "Approved by the engineering manager, 2 Sep 2026",
  },
  {
    key: "kwame", type: "Freelancer",
    role: "Data engineer · Health technology company, Berlin",
    meta: "Kwame Boakye · 6 months",
    before: ["Freelance data work (under NDA).", "References available on request."],
    after: [
      { text: "Built Airflow pipelines loading operations data into Snowflake", tier: "client-approved" },
      { text: "Added data quality checks that block bad loads before they reach reports", tier: "client-approved" },
      { text: "Wrote the handover runbook for the platform team", tier: "engineer-account" },
    ],
    approval: "Approved by the data platform lead, 2 Oct 2026",
  },
];

const CYCLE = 7000;
const PHASES = [500, 1300, 2600]; // strike, lines, signature
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

function Card({ p, phase, depth, animate }: { p: Profile; phase: number; depth: number; animate: boolean }) {
  const front = depth === 0;
  const struck = front && phase >= 1;
  const showLines = front && phase >= 2;
  const signed = front && phase >= 3;
  const t = (ms: number) => (animate ? `${ms}ms` : "0ms");

  return (
    <article
      aria-hidden={!front}
      className="card col-start-1 row-start-1 overflow-hidden will-change-transform"
      style={{
        transform: `translateY(${depth * 16}px) scale(${1 - depth * 0.045})`,
        opacity: depth === 0 ? 1 : depth === 1 ? 0.55 : 0.25,
        zIndex: 10 - depth,
        transition: `transform ${t(650)} ${EASE}, opacity ${t(650)} ${EASE}`,
        transformOrigin: "50% 100%",
      }}
    >
      <header className="border-b border-line bg-surface-2 px-5 py-3">
        <div className="flex items-center justify-between gap-3">
          <p className="font-medium">{p.role}</p>
          <span className="shrink-0 rounded-md bg-surface-1 px-2 py-0.5 font-mono text-[0.65rem] uppercase tracking-wide text-ink-2">{p.type}</span>
        </div>
        <p className="text-xs text-ink-3">{p.meta} · dev profile, Experience section</p>
      </header>

      <div className="space-y-2 px-5 py-4">
        <p className="eyebrow">Before</p>
        <ul className="list-disc space-y-1 pl-5 text-ink-3">
          {p.before.map((line, i) => (
            <li key={line}>
              <span
                className="bg-no-repeat"
                style={{
                  backgroundImage: "linear-gradient(currentColor, currentColor)",
                  backgroundPosition: "0 58%",
                  backgroundSize: struck ? "100% 1px" : "0% 1px",
                  transition: `background-size ${t(520)} ${EASE} ${t(i * 100)}`,
                }}
              >
                {line}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-2 border-t border-line px-5 py-4">
        <p className="eyebrow">With Seat Record</p>
        <ul className="space-y-2">
          {p.after.map((l, i) => (
            <li
              key={l.text}
              className="grid grid-cols-[1fr_auto] items-start gap-x-3 text-sm"
              style={{
                opacity: showLines ? 1 : 0,
                transform: showLines ? "none" : "translateY(8px)",
                transition: `opacity ${t(420)} ${EASE} ${t(i * 100)}, transform ${t(420)} ${EASE} ${t(i * 100)}`,
              }}
            >
              <span className={l.quote ? "italic text-ink-2" : ""}>{l.quote ? `“${l.text}”` : l.text}</span>
              <span
                style={{
                  display: "inline-block",
                  transform: showLines ? "scale(1)" : "scale(0.7)",
                  transition: `transform ${t(360)} cubic-bezier(0.34, 1.56, 0.64, 1) ${t(i * 100 + 160)}`,
                }}
              >
                <TierChip tier={l.tier} />
              </span>
            </li>
          ))}
        </ul>
        <p className="flex items-center gap-1.5 pt-1 text-xs text-accent" style={{ opacity: signed ? 1 : 0, transition: `opacity ${t(400)} ease` }}>
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path
              d="M3 8.5l3.2 3L13 4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="16"
              strokeDashoffset={signed ? 0 : 16}
              style={{ transition: `stroke-dashoffset ${t(450)} ${EASE} ${t(120)}` }}
            />
          </svg>
          {p.approval} · signature valid
        </p>
      </div>
    </article>
  );
}

export function HeroDeck() {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const bar = useRef<HTMLSpanElement>(null);
  const elapsed = useRef(0);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // One clock drives phases and rotation, so pausing freezes both exactly where they are.
  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      // Pausing only holds the rotation; the card in front always finishes its sequence.
      const sequenceDone = elapsed.current >= PHASES[2] + 600;
      if (!paused || !sequenceDone) {
        elapsed.current += dt;
        const e = elapsed.current;
        const next = e >= PHASES[2] ? 3 : e >= PHASES[1] ? 2 : e >= PHASES[0] ? 1 : 0;
        setPhase((p) => (p === next ? p : next));
        if (bar.current) bar.current.style.transform = `scaleX(${Math.min(1, e / CYCLE)})`;
        if (e >= CYCLE) {
          elapsed.current = 0;
          setPhase(0);
          setIndex((i) => (i + 1) % PROFILES.length);
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [paused, reduced]);

  const go = (i: number) => {
    elapsed.current = 0;
    if (bar.current) bar.current.style.transform = "scaleX(0)";
    setPhase(0);
    setIndex(i);
  };

  const shownPhase = reduced ? 3 : phase;

  return (
    <div
      className="space-y-5"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={(e) => { if (e.target.matches(":focus-visible")) setPaused(true); }}
      onBlur={() => setPaused(false)}
    >
      <div className="grid pb-8" aria-live="polite">
        {PROFILES.map((p, i) => {
          const depth = (i - index + PROFILES.length) % PROFILES.length;
          return <Card key={p.key} p={p} depth={depth} phase={shownPhase} animate={!reduced} />;
        })}
      </div>

      <div role="tablist" aria-label="Worker type" className="grid grid-cols-3 gap-2">
        {PROFILES.map((p, i) => (
          <button
            key={p.key}
            role="tab"
            aria-selected={i === index}
            onClick={() => go(i)}
            className={`group relative overflow-hidden rounded-lg border px-3 py-2 text-left text-sm transition-colors ${i === index ? "border-line-strong bg-surface-1 text-ink" : "border-line text-ink-3 hover:text-ink"}`}
          >
            <span className="block font-medium">{p.type}</span>
            <span className="block truncate text-xs text-ink-3">{p.meta.split(" · ")[0]}</span>
            {i === index && !reduced && (
              <span aria-hidden className="absolute inset-x-0 bottom-0 h-0.5 bg-line">
                <span ref={bar} className="block h-full origin-left bg-accent" style={{ transform: "scaleX(0)" }} />
              </span>
            )}
          </button>
        ))}
      </div>
      <p className="text-xs text-ink-3">{paused && !reduced ? "Paused. Move away to continue." : "Hover to pause."} Fictional people and clients.</p>
    </div>
  );
}
