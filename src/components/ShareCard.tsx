"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import type { Worker } from "@/lib/types";
import { Button } from "./ui";

/** Worker-only control for an unlisted, revocable link to their client-approved record. */
export function ShareCard({ worker }: { worker: Worker }) {
  const { setShare } = useStore();
  const [copied, setCopied] = useState(false);
  const on = !!worker.share?.on;
  const url = worker.share ? `${typeof window !== "undefined" ? window.location.origin : ""}/share/${worker.share.token}` : "";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section id="share" className="card scroll-mt-6 space-y-3 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-semibold">Share your record</h2>
          <p className="text-sm text-ink-2">An unlisted link to your client-approved lines, for a prospective client or your CV. Off unless you turn it on.</p>
        </div>
        <button
          id="share-toggle"
          role="switch"
          aria-checked={on}
          aria-label="Share link"
          onClick={() => setShare(worker.id, !on)}
          className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${on ? "bg-accent" : "bg-surface-3"}`}
        >
          <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-surface-1 shadow transition-all ${on ? "left-[22px]" : "left-0.5"}`} />
        </button>
      </div>
      {on ? (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input id="share-url" readOnly value={url} onFocus={(e) => e.currentTarget.select()} aria-label="Share link" className="min-w-0 flex-1 rounded-md border border-line bg-surface-2 px-2 py-1.5 font-mono text-xs text-ink-2" />
            <Button variant="secondary" className="py-1.5" onClick={copy}>{copied ? "Copied" : "Copy"}</Button>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-ink-3">
            <a href={`/share/${worker.share!.token}`} target="_blank" rel="noreferrer" className="text-accent hover:underline">Open as others see it</a>
            <button onClick={() => setShare(worker.id, true, true)} className="hover:text-ink">Replace link (the old one stops working)</button>
          </div>
        </div>
      ) : (
        <p className="text-xs text-ink-3">Nothing is public. Bonarda Works and your manager can still see your approved lines.</p>
      )}
    </section>
  );
}
