"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { engagementsFor, entriesFor, lineTier, rollOffStatus, useStore } from "@/lib/store";
import { formatDate } from "@/lib/dates";
import { Button, ButtonLink, Crumbs, Loading, TierChip } from "@/components/ui";

const MAX_LINES = 8;

function CheckpointInner() {
  const { id } = useParams<{ id: string }>();
  const cpParam = useSearchParams().get("cp");
  const store = useStore();
  const { state, ready } = store;
  const opened = useRef(false);
  const [deselected, setDeselected] = useState<Set<string>>(new Set());

  const w = state.workers.find((x) => x.id === id);
  const eng = w ? engagementsFor(state, w.id)[0] : undefined;
  const cp = eng ? state.checkpoints.find((c) => (cpParam ? c.id === cpParam : c.engagementId === eng.id && c.status !== "approved")) : undefined;

  // Roll-off opens itself from the placement list when the window is reached.
  useEffect(() => {
    if (!ready || !eng || cp || opened.current) return;
    const roll = rollOffStatus(eng.end);
    const rollOffDone = state.checkpoints.some((c) => c.engagementId === eng.id && c.reason === "roll-off" && c.status === "approved");
    if ((roll.windowOpen || roll.ended) && !rollOffDone) {
      opened.current = true;
      store.openCheckpoint(eng.id, "system", "roll-off");
    }
  }, [ready, eng, cp, store, state.checkpoints]);

  const candidates = useMemo(
    () => (eng ? entriesFor(state, eng.id).flatMap((e) => e.lines.filter((l) => l.status === "approved-by-worker").map((l) => ({ e, l }))) : []),
    [eng, state],
  );

  if (!ready) return <Loading />;
  if (!w || !eng) return <p>Person not found.</p>;
  if (!cp) return <p className="text-ink-2">No checkpoint is open. <Link href={`/worker/${w.id}`} className="text-accent">Back to the seat log</Link></p>;

  // Everything unapproved is selected by default, so nothing is forgotten.
  const sel = new Set(candidates.map((c) => c.l.id).filter((lid) => !deselected.has(lid)));
  const toggle = (lid: string) => setDeselected((s) => { const n = new Set(s); if (n.has(lid)) n.delete(lid); else n.add(lid); return n; });
  const channel = cp.reason === "extension" ? "the reply to the extension email" : "the testimonial request the client already receives";

  if (cp.status === "sent" || cp.status === "approved") {
    return (
      <div className="space-y-6">
        <Crumbs items={[{ href: "/", label: "People" }, { href: `/worker/${w.id}`, label: w.name }, { label: "Checkpoint" }]} />
        <div className="card space-y-3 p-6">
          <p className="eyebrow">{cp.status === "sent" ? "Sent" : "Approved"}</p>
          <h1 className="text-2xl font-semibold">{cp.status === "sent" ? `${cp.lineIds.length} lines are with the client lead` : "This checkpoint is approved"}</h1>
          <p className="text-ink-2">They ride on {channel}. No new message, no new meeting.</p>
          <div className="flex flex-wrap gap-2 pt-2">
            {cp.status === "sent" && <ButtonLink href={`/client/${cp.id}`}>Open client email (mock)</ButtonLink>}
            <ButtonLink href={`/worker/${w.id}`} variant="secondary">Back to seat log</ButtonLink>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Crumbs items={[{ href: "/", label: "People" }, { href: `/worker/${w.id}`, label: w.name }, { label: "Checkpoint" }]} />
      <header className="space-y-2">
        <p className="eyebrow">
          {cp.reason === "roll-off" ? "Roll-off checkpoint" : cp.reason === "lead-change" ? "Client lead is changing" : cp.reason === "extension" ? "Extension checkpoint" : "Checkpoint"} · opened by {cp.openedBy.replace("-", " ")}
        </p>
        <h1 className="text-3xl font-semibold">Send your lines for client approval</h1>
        <p className="max-w-2xl text-ink-2">
          Everything since {formatDate(cp.periodFrom)} that the client has not approved yet is selected. Untick anything you would rather keep to yourself.
          The link rides on {channel}.
        </p>
        {cp.note && <p className="rounded-lg bg-warn-soft px-3 py-2 text-sm text-ink">Note from the {cp.openedBy.replace("-", " ")}: “{cp.note}”</p>}
      </header>

      {candidates.length === 0 ? (
        <p className="text-ink-2">Nothing to send yet. <Link href={`/worker/${w.id}/new`} className="text-accent">Log your work</Link> first.</p>
      ) : (
        <>
          <ul className="space-y-2">
            {candidates.map(({ e, l }) => (
              <li key={l.id}>
                <label className={`card flex cursor-pointer items-start gap-3 p-4 ${sel.has(l.id) ? "" : "opacity-60"}`}>
                  <input id={`sel-${l.id}`} type="checkbox" checked={sel.has(l.id)} onChange={() => toggle(l.id)} className="mt-1 h-4 w-4 accent-[var(--accent)]" />
                  <span className="min-w-0 flex-1">
                    <span className="block">{l.text}</span>
                    <span className="text-xs text-ink-3">Logged {formatDate(e.date)}</span>
                  </span>
                  <TierChip tier={lineTier(e, l)} />
                </label>
              </li>
            ))}
          </ul>
          {sel.size > MAX_LINES && (
            <p className="text-sm text-warn">That is {sel.size} lines. Client leads approve eight far more readily than {sel.size}. Consider trimming.</p>
          )}
          <div className="flex flex-wrap items-center gap-3 border-t border-line pt-5">
            <Button disabled={sel.size === 0} onClick={() => store.sendCheckpoint(cp.id, [...sel])}>
              Approve and send {sel.size} {sel.size === 1 ? "line" : "lines"}
            </Button>
            <span className="text-sm text-ink-3">Only you can send this. The client sees these lines and nothing else.</span>
          </div>
        </>
      )}
    </div>
  );
}

export default function CheckpointPage() {
  return <Suspense fallback={<Loading />}><CheckpointInner /></Suspense>;
}
