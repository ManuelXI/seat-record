"use client";

import { useId, useState } from "react";

/**
 * Accordion row with a smooth height animation. Animating grid-template-rows from 0fr to 1fr
 * lets the panel grow to its natural height without measuring it in JavaScript.
 */
export function AccordionItem({ question, children }: { question: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const ease = "cubic-bezier(0.2, 0, 0, 1)";

  return (
    <div className="px-5">
      <h3 className="m-0 text-base" style={{ fontFamily: "var(--font-sans)", letterSpacing: "normal" }}>
        <button
          id={`${id}-q`}
          aria-expanded={open}
          aria-controls={`${id}-a`}
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-start justify-between gap-4 py-4 text-left font-medium text-ink"
        >
          <span>{question}</span>
          <span
            aria-hidden
            className="relative mt-1 h-3.5 w-3.5 shrink-0 text-ink-3"
            style={{ transform: open ? "rotate(45deg)" : "none", transition: `transform 250ms ${ease}` }}
          >
            <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-current" />
            <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-current" />
          </span>
        </button>
      </h3>
      <div
        id={`${id}-a`}
        role="region"
        aria-labelledby={`${id}-q`}
        inert={!open}
        className="grid"
        style={{ gridTemplateRows: open ? "1fr" : "0fr", transition: `grid-template-rows 300ms ${ease}` }}
      >
        <div className="overflow-hidden">
          <div
            className="pb-4 text-ink-2"
            style={{
              opacity: open ? 1 : 0,
              transform: open ? "none" : "translateY(-4px)",
              transition: `opacity 250ms ${ease} ${open ? "60ms" : "0ms"}, transform 300ms ${ease}`,
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
