"use client";

import Link from "next/link";
import { useState } from "react";
import { engagementsFor, rollOffStatus, useStore } from "@/lib/store";
import { formatDate, monthsBetween } from "@/lib/dates";
import { MANAGERS } from "@/lib/people";
import type { CheckpointReason } from "@/lib/types";
import { Button, ButtonLink, Crumbs, TierChip, TypeBadge } from "./ui";

/**
 * What a manager sees for an engagement: status, what the client approved, and the
 * power to open a checkpoint. Never the worker's unshared lines, and never a send button.
 */
export function ManagerEngagement({ workerId }: { workerId: string }) {
  const store = useStore();
  const { state, session } = store;
  const [reason, setReason] = useState<CheckpointReason>("lead-change");
  const [note, setNote] = useState("");
  const [justOpened, setJustOpened] = useState(false);

  const w = state.workers.find((x) => x.id === workerId);
  if (!w) return <p>Person not found.</p>;
  const eng = engagementsFor(state, w.id)[0];
  const first = w.name.split(" ")[0];
  const me = MANAGERS.find((m) => m.id === session?.personId);
  const isOwner = me?.name === eng.engagementOwner;
  const cps = state.checkpoints.filter((c) => c.engagementId === eng.id);
  const pending = cps.find((c) => c.status !== "approved");
  const roll = rollOffStatus(eng.end);
  const records = state.records.filter((r) => r.engagementId === eng.id).sort((a, b) => (a.approvedAt < b.approvedAt ? 1 : -1));
  const unshared = state.entries.filter((e) => e.engagementId === eng.id).flatMap((e) => e.lines).filter((l) => l.status === "approved-by-worker").length;

  const open = () => {
    store.openCheckpoint(eng.id, isOwner ? "engagement-owner" : "manager", reason, note.trim() || undefined);
    setJustOpened(true);
    setNote("");
  };

  return (
    <div className="space-y-8">
      <Crumbs items={[{ href: "/", label: "Your engagements" }, { label: w.name }]} />

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2"><TypeBadge type={w.type} /><span className="text-sm text-ink-3">{w.location}</span></div>
          <h1 className="text-3xl font-semibold">{w.name}</h1>
          <p className="text-ink-2">{eng.role} · {eng.clientLabel} · {monthsBetween(eng.start, eng.end)} months</p>
          <p className="text-sm text-ink-3">{formatDate(eng.start)} to {formatDate(eng.end)} · Client lead: {eng.clientLead}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ButtonLink href={`/profile/${w.id}`}>Profile</ButtonLink>
          <ButtonLink href={`/history/${w.id}`} variant="secondary">Seat history</ButtonLink>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        <div className="space-y-8">
          <section className="card space-y-1 p-5">
            <p className="eyebrow">Status</p>
            <p className="text-lg font-medium">
              {pending?.status === "sent"
                ? `${pending.lineIds.length} lines are with the client lead`
                : pending
                  ? `Checkpoint open, waiting for ${first}`
                  : roll.ended
                    ? "Engagement has ended"
                    : roll.windowOpen
                      ? `Roll-off window open, ${roll.days} working days to contract end`
                      : `${roll.days} working days to contract end`}
            </p>
            {pending && <p className="text-sm text-ink-2">Opened by {pending.openedBy === "system" ? "the placement list" : pending.openedBy.replace("-", " ")} for the period since {formatDate(pending.periodFrom)}.{pending.note && ` Note: “${pending.note}”`}</p>}
          </section>

          <section className="space-y-3" aria-labelledby="approved">
            <h2 id="approved" className="text-xl font-semibold">What the client has approved</h2>
            {records.length === 0 ? (
              <p className="text-sm text-ink-3">Nothing approved yet for this engagement.</p>
            ) : (
              <ol className="space-y-3">
                {records.map((r) => (
                  <li key={r.id} className="card p-4">
                    <p className="eyebrow mb-2">{formatDate(r.approvedAt)} · {r.approver}</p>
                    <ul className="space-y-2">
                      {r.lines.map((l, i) => (
                        <li key={i} className="grid grid-cols-[1fr_auto] items-start gap-x-3">
                          <span className={l.clientWritten ? "italic text-ink-2" : ""}>{l.clientWritten ? `“${l.text}”` : l.text}</span>
                          <TierChip tier={l.tier} />
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ol>
            )}
          </section>

          <section className="rounded-xl border border-dashed border-line-strong p-5">
            <p className="font-medium">{unshared} {unshared === 1 ? "line" : "lines"} in {first}&rsquo;s log not yet shared with the client</p>
            <p className="text-sm text-ink-2">Only {first} can read, select and send these. Seat Record never shows a worker&rsquo;s log to their manager.</p>
          </section>
        </div>

        <aside className="space-y-4">
          <div className="card space-y-3 p-4">
            <p className="text-sm font-medium">Open a checkpoint</p>
            {justOpened ? (
              <p className="text-sm text-accent">Opened. {first} will see your note and choose what to send.</p>
            ) : pending ? (
              <p className="text-xs text-ink-3">A checkpoint is already open. {first} decides what goes to the client.</p>
            ) : (
              <div className="space-y-2 text-sm">
                <p className="text-xs text-ink-3">Prompt {first} to get lines approved, for example before the client lead moves on. You cannot choose or send the lines.</p>
                <label className="block">
                  <span className="text-xs text-ink-3">Reason</span>
                  <select id="mgr-reason" value={reason} onChange={(e) => setReason(e.target.value as CheckpointReason)} className="mt-1 w-full rounded-md border border-line bg-surface-2 px-2 py-1.5">
                    <option value="lead-change">Client lead is leaving</option>
                    <option value="manual">Worth capturing now</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs text-ink-3">Note, visible to {first}</span>
                  <input id="mgr-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="The lead moves on in March" className="mt-1 w-full rounded-md border border-line bg-surface-2 px-2 py-1.5" />
                </label>
                <Button onClick={open}>Open checkpoint</Button>
              </div>
            )}
          </div>
          <p className="px-1 text-xs text-ink-3">
            {isOwner ? "You own this engagement." : `Engagement owner: ${eng.engagementOwner}.`} <Link href="/" className="text-accent hover:underline">Back to your engagements</Link>
          </p>
        </aside>
      </div>
    </div>
  );
}
