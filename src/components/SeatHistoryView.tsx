"use client";

import { useEffect, useState } from "react";
import { engagementsFor } from "@/lib/store";
import { formatDate } from "@/lib/dates";
import type { AppState, SignedRecord } from "@/lib/types";
import { TierChip } from "./ui";

function RecordCard({ r, label }: { r: SignedRecord; label: string }) {
  const [valid, setValid] = useState<boolean | null>(null);
  const [tampered, setTampered] = useState(false);

  useEffect(() => {
    const payload = tampered ? { ...r, lines: r.lines.map((l, i) => (i === 0 ? { ...l, text: l.text.replace(/^\w+/, "Led") } : l)) } : r;
    let alive = true;
    fetch("/api/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      .then((res) => res.json())
      .then((d: { valid: boolean }) => alive && setValid(d.valid))
      .catch(() => alive && setValid(false));
    return () => { alive = false; };
  }, [r, tampered]);

  const lines = tampered ? r.lines.map((l, i) => (i === 0 ? { ...l, text: l.text.replace(/^\w+/, "Led") } : l)) : r.lines;

  return (
    <li className="card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-medium">{label}</p>
          <p className="text-sm text-ink-2">Approved by {r.approver} on {formatDate(r.approvedAt)}</p>
        </div>
        <span className={`rounded-full px-2.5 py-1 font-mono text-xs ${valid === null ? "text-ink-3" : valid ? "bg-accent-soft text-accent-soft-ink" : "bg-danger-soft text-danger"}`}>
          {valid === null ? "Checking…" : valid ? "Signature valid" : "Signature invalid"}
        </span>
      </div>
      <ul className="mt-4 space-y-2">
        {lines.map((l, i) => (
          <li key={i} className="grid grid-cols-[1fr_auto] items-start gap-x-3">
            <span className={l.clientWritten ? "italic text-ink-2" : ""}>{l.clientWritten ? `“${l.text}”` : l.text}</span>
            <TierChip tier={l.tier} />
          </li>
        ))}
      </ul>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3 text-xs text-ink-3">
        <span className="font-mono">Key {r.keyId} · {r.signature.slice(0, 20)}…</span>
        <button onClick={() => setTampered((t) => !t)} className="rounded-md px-2 py-1 hover:bg-surface-2 hover:text-ink">
          {tampered ? "Undo edit" : "Try editing a word"}
        </button>
      </div>
    </li>
  );
}

/** Every client-approved record for a worker, grouped by engagement, each with a live signature check. */
export function SeatHistoryView({ state, workerId }: { state: AppState; workerId: string }) {
  return (
    <div className="space-y-8">
      {engagementsFor(state, workerId).map((eng) => {
        const recs = state.records.filter((r) => r.engagementId === eng.id).sort((a, b) => (a.approvedAt < b.approvedAt ? -1 : 1));
        return (
          <section key={eng.id} className="space-y-3">
            <div>
              <h2 className="text-xl font-semibold">{eng.role} · {eng.clientLabel}</h2>
              <p className="text-sm text-ink-3">{formatDate(eng.start)} to {formatDate(eng.end)}</p>
            </div>
            {recs.length === 0 ? (
              <p className="text-sm text-ink-3">No client-approved lines yet for this engagement.</p>
            ) : (
              <ol className="space-y-3">
                {recs.map((r) => {
                  const cp = state.checkpoints.find((c) => c.id === r.checkpointId);
                  const label = cp?.reason === "extension" ? "Extension checkpoint" : cp?.reason === "roll-off" ? "Roll-off checkpoint" : "Checkpoint";
                  return <RecordCard key={r.id} r={r} label={label} />;
                })}
              </ol>
            )}
          </section>
        );
      })}
    </div>
  );
}
