"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { engagementsFor, entriesFor, lineTier, rollOffStatus, useStore } from "@/lib/store";
import { formatDate, monthsBetween } from "@/lib/dates";
import { Button, ButtonLink, Crumbs, Loading, TierChip, TypeBadge } from "@/components/ui";
import { ExportButton } from "@/components/ExportButton";
import type { Checkpoint, CheckpointReason } from "@/lib/types";

const REASON_LABEL: Record<CheckpointReason, string> = {
  extension: "Extension checkpoint",
  "roll-off": "Roll-off checkpoint",
  "lead-change": "Client lead change",
  manual: "Checkpoint",
};

export default function SeatLog() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const store = useStore();
  const { state, ready } = store;
  const [opening, setOpening] = useState(false);
  const [who, setWho] = useState<Checkpoint["openedBy"]>("manager");
  const [reason, setReason] = useState<CheckpointReason>("lead-change");
  const [note, setNote] = useState("");

  const w = state.workers.find((x) => x.id === id);
  if (!ready) return <Loading />;
  if (!w) return <p>Person not found.</p>;
  const eng = engagementsFor(state, w.id)[0];
  const entries = entriesFor(state, eng.id);
  const cps = state.checkpoints.filter((c) => c.engagementId === eng.id);
  const pending = cps.find((c) => c.status !== "approved");
  const roll = rollOffStatus(eng.end);
  const rollOffDone = cps.some((c) => c.reason === "roll-off" && c.status === "approved");
  const needsRollOff = (roll.windowOpen || roll.ended) && !rollOffDone;

  const timeline = [
    ...entries.map((e) => ({ kind: "entry" as const, date: e.date, e })),
    ...cps.filter((c) => c.status === "approved").map((c) => ({ kind: "cp" as const, date: c.approvedAt!, c })),
  ].sort((a, b) => (a.date < b.date ? 1 : -1));

  const openManual = () => {
    const cp = store.openCheckpoint(eng.id, who, reason, note.trim() || undefined);
    router.push(`/worker/${w.id}/checkpoint?cp=${cp.id}`);
  };

  return (
    <div className="space-y-8">
      <Crumbs items={[{ href: "/", label: "People" }, { label: w.name }]} />

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2"><TypeBadge type={w.type} /><span className="text-sm text-ink-3">{w.location}</span></div>
          <h1 className="text-3xl font-semibold">{w.name}</h1>
          <p className="text-ink-2">{eng.role} · {eng.clientLabel} · {monthsBetween(eng.start, eng.end)} months</p>
          <p className="text-sm text-ink-3">{formatDate(eng.start)} to {formatDate(eng.end)} · Engagement owner {eng.engagementOwner}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ButtonLink href={`/worker/${w.id}/new`}>Log your work</ButtonLink>
          <ButtonLink href={`/profile/${w.id}`} variant="secondary">Profile</ButtonLink>
          <ExportButton state={state} workerId={w.id} />
        </div>
      </header>

      {pending?.status === "sent" ? (
        <div className="card flex flex-wrap items-center justify-between gap-3 border-accent p-4">
          <div>
            <p className="font-medium">Waiting for the client lead</p>
            <p className="text-sm text-ink-2">{pending.lineIds.length} lines sent with the {pending.reason === "extension" ? "extension reply" : "testimonial request"}.</p>
          </div>
          <ButtonLink href={`/client/${pending.id}`} variant="secondary">Open client email (mock)</ButtonLink>
        </div>
      ) : (needsRollOff || pending) && (
        <div className="card flex flex-wrap items-center justify-between gap-3 bg-warn-soft p-4">
          <div>
            <p className="font-medium text-ink">{pending ? REASON_LABEL[pending.reason] + " is open" : roll.ended ? "Engagement has ended" : `Roll-off checkpoint opened ${roll.days} working days before the contract end`}</p>
            <p className="text-sm text-ink-2">Review your unapproved lines. The approval link rides on the testimonial email the client already sends.</p>
            {pending?.note && <p className="mt-1 text-sm text-ink-2">Note from {pending.openedBy.replace("-", " ")}: “{pending.note}”</p>}
          </div>
          <ButtonLink href={`/worker/${w.id}/checkpoint${pending ? `?cp=${pending.id}` : ""}`}>Review lines</ButtonLink>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
        <section aria-labelledby="log" className="space-y-4">
          <h2 id="log" className="text-xl font-semibold">Seat log</h2>
          <ol className="relative space-y-4 border-l border-line pl-6">
            {timeline.map((t) =>
              t.kind === "cp" ? (
                <li key={t.c.id} className="relative">
                  <span className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full bg-accent ring-4 ring-canvas" aria-hidden />
                  <div className="rounded-lg bg-accent-soft px-4 py-3 text-sm">
                    <p className="font-medium text-accent-soft-ink">{REASON_LABEL[t.c.reason]} approved · {formatDate(t.c.approvedAt!)}</p>
                    <p className="text-ink-2">{t.c.lineIds.length} lines approved by {t.c.approver}. <Link href={`/history/${w.id}`} className="text-accent hover:underline">View signed record</Link></p>
                  </div>
                </li>
              ) : (
                <li key={t.e.id} className="relative">
                  <span className="absolute -left-[29px] top-2 h-2 w-2 rounded-full bg-line-strong ring-4 ring-canvas" aria-hidden />
                  <div className="card p-4">
                    <p className="eyebrow mb-2">{formatDate(t.e.date)}{t.e.managerSaw && " · Manager saw this in a 1-on-1"}</p>
                    <ul className="space-y-2">
                      {t.e.lines.map((l) => (
                        <li key={l.id} className="grid grid-cols-[1fr_auto] items-start gap-x-3">
                          <span className={l.clientWritten ? "italic" : ""}>{l.clientWritten ? `“${l.text}”` : l.text}</span>
                          <span className="flex items-center gap-2">
                            {l.status === "sent" && <span className="font-mono text-[0.68rem] uppercase text-ink-3">Sent</span>}
                            <TierChip tier={lineTier(t.e, l)} />
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              ),
            )}
          </ol>
        </section>

        <aside className="space-y-4">
          <div className="card space-y-3 p-4">
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="reminder" className="text-sm font-medium">Monthly reminder</label>
              <button
                id="reminder"
                role="switch"
                aria-checked={w.reminderOn}
                onClick={() => store.setReminder(w.id, !w.reminderOn)}
                className={`relative h-6 w-11 rounded-full transition-colors ${w.reminderOn ? "bg-accent" : "bg-surface-3"}`}
              >
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-surface-1 shadow transition-all ${w.reminderOn ? "left-[22px]" : "left-0.5"}`} />
              </button>
            </div>
            <p className="text-xs text-ink-3">Optional. Memory of a long engagement fades fast.</p>
            {w.reminderOn && (
              <div className="rounded-lg border border-dashed border-line-strong p-3 text-sm">
                <p className="eyebrow mb-1">Mocked · 1 Oct</p>
                <p>Two minutes: what did you work on this month?</p>
              </div>
            )}
          </div>

          <div className="card space-y-3 p-4">
            <p className="text-sm font-medium">Open a checkpoint by hand</p>
            {!opening ? (
              <>
                <p className="text-xs text-ink-3">For example when the client lead is about to leave. Only {w.name.split(" ")[0]} approves what is sent.</p>
                <Button variant="secondary" onClick={() => setOpening(true)} disabled={!!pending}>{pending ? "A checkpoint is already open" : "Open checkpoint"}</Button>
              </>
            ) : (
              <div className="space-y-2 text-sm">
                <label className="block">
                  <span className="text-xs text-ink-3">Opened by</span>
                  <select id="cp-who" value={who} onChange={(e) => setWho(e.target.value as Checkpoint["openedBy"])} className="mt-1 w-full rounded-md border border-line bg-surface-2 px-2 py-1.5">
                    <option value="manager">Manager</option>
                    <option value="engagement-owner">Engagement owner</option>
                    <option value="worker">{w.name.split(" ")[0]}</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs text-ink-3">Reason</span>
                  <select id="cp-reason" value={reason} onChange={(e) => setReason(e.target.value as CheckpointReason)} className="mt-1 w-full rounded-md border border-line bg-surface-2 px-2 py-1.5">
                    <option value="lead-change">Client lead is leaving</option>
                    <option value="manual">Worth capturing now</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs text-ink-3">Note, visible to {w.name.split(" ")[0]}</span>
                  <input id="cp-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="The lead moves on in March" className="mt-1 w-full rounded-md border border-line bg-surface-2 px-2 py-1.5" />
                </label>
                <div className="flex gap-2 pt-1">
                  <Button onClick={openManual}>Open</Button>
                  <Button variant="ghost" onClick={() => setOpening(false)}>Cancel</Button>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
