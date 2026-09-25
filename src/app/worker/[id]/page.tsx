"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { engagementsFor, entriesFor, lineTier, rollOffStatus, useStore } from "@/lib/store";
import { formatDate, monthsBetween } from "@/lib/dates";
import { canAskWitness } from "@/lib/witness";
import { Button, ButtonLink, Crumbs, Loading, TierChip, TypeBadge } from "@/components/ui";
import { ExportButton } from "@/components/ExportButton";
import type { CheckpointReason } from "@/lib/types";
import { Guard } from "@/components/Guard";
import { ManagerEngagement } from "@/components/ManagerEngagement";
import { CompactTopBar, useScrolledPast } from "@/components/StickyBars";

const REASON_LABEL: Record<CheckpointReason, string> = {
  extension: "Extension checkpoint",
  "roll-off": "Roll-off checkpoint",
  "lead-change": "Client lead change",
  manual: "Checkpoint",
};

function WorkerSeatLog() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const store = useStore();
  const { state, ready } = store;
  const [opening, setOpening] = useState(false);
  const [reason, setReason] = useState<CheckpointReason>("lead-change");
  const { ref: headerRef, past } = useScrolledPast<HTMLElement>();
  const selected = useSearchParams().get("e");

  const w = state.workers.find((x) => x.id === id);
  if (!ready) return <Loading />;
  if (!w) return <p>Person not found.</p>;
  const all = engagementsFor(state, w.id);
  const current = all[0];
  const eng = all.find((e) => e.id === selected) ?? current;
  const isCurrent = eng.id === current.id;
  const entries = entriesFor(state, eng.id);
  const cps = state.checkpoints.filter((c) => c.engagementId === eng.id);
  const pending = cps.find((c) => c.status !== "approved");
  const roll = rollOffStatus(eng.end);
  const rollOffDone = cps.some((c) => c.reason === "roll-off" && c.status === "approved");
  const needsRollOff = isCurrent && (roll.windowOpen || roll.ended) && !rollOffDone;
  const approvedHere = entries.flatMap((e) => e.lines).filter((l) => l.status === "client-approved").length;
  const owner = eng.engagementOwner;
  const ownerFirst = owner.split(" ")[0];

  const timeline = [
    ...entries.map((e) => ({ kind: "entry" as const, date: e.date, e })),
    ...cps.filter((c) => c.status === "approved").map((c) => ({ kind: "cp" as const, date: c.approvedAt!, c })),
  ].sort((a, b) => (a.date < b.date ? 1 : -1));

  const openManual = () => {
    const cp = store.openCheckpoint(eng.id, "worker", reason);
    router.push(`/worker/${w.id}/checkpoint?cp=${cp.id}`);
  };

  return (
    <div className="space-y-8">
      <CompactTopBar show={past}>
        <div className="min-w-0 leading-tight">
          <p className="truncate font-display text-lg font-semibold">{w.name}</p>
          <p className="truncate text-xs text-ink-3">Seat log · {eng.clientLabel}</p>
        </div>
        <div className="flex gap-2">
          {(needsRollOff || pending?.status === "open") && (
            <ButtonLink href={`/worker/${w.id}/checkpoint${pending ? `?cp=${pending.id}` : ""}`} variant="secondary" className="py-1.5">Review lines</ButtonLink>
          )}
          {isCurrent && <ButtonLink href={`/worker/${w.id}/new`} className="py-1.5">Log your work</ButtonLink>}
        </div>
      </CompactTopBar>

      <Crumbs items={[{ label: "My seat log" }]} />

      <header ref={headerRef} className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2"><TypeBadge type={w.type} /><span className="text-sm text-ink-3">{w.location}</span></div>
          <h1 className="text-3xl font-semibold">{w.name}</h1>
          <p className="text-ink-2">{eng.role} · {eng.clientLabel} · {monthsBetween(eng.start, eng.end)} months</p>
          <p className="text-sm text-ink-3">{formatDate(eng.start)} to {formatDate(eng.end)} · Engagement owner {eng.engagementOwner}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isCurrent && <ButtonLink href={`/worker/${w.id}/new`}>Log your work</ButtonLink>}
          <ButtonLink href={`/profile/${w.id}`} variant="secondary">Profile</ButtonLink>
          <ExportButton state={state} workerId={w.id} />
        </div>
      </header>

      {all.length > 1 && (
        <nav aria-label="Engagements" className="flex gap-2 overflow-x-auto pb-1">
          {all.map((e) => {
            const active = e.id === eng.id;
            const cur = e.id === current.id;
            return (
              <Link
                key={e.id}
                href={cur ? `/worker/${w.id}` : `/worker/${w.id}?e=${e.id}`}
                aria-current={active ? "page" : undefined}
                className={`shrink-0 rounded-lg border px-3 py-2 text-sm transition-colors duration-150 ${active ? "border-accent bg-accent-soft" : "border-line hover:bg-surface-2"}`}
              >
                <span className={`block font-medium ${active ? "text-accent-soft-ink" : "text-ink"}`}>{e.clientLabel}</span>
                <span className="block text-xs text-ink-3">{cur ? "Current" : "Ended"} · {formatDate(e.start)} to {formatDate(e.end)}</span>
              </Link>
            );
          })}
        </nav>
      )}

      {!isCurrent && (
        <div className="card flex flex-wrap items-center justify-between gap-3 p-4">
          <div>
            <p className="font-medium">Past engagement · ended {formatDate(eng.end)}</p>
            <p className="text-sm text-ink-2">{approvedHere} {approvedHere === 1 ? "line" : "lines"} approved by the client. This log is closed; new entries go to your current engagement.</p>
          </div>
          <ButtonLink href={`/history/${w.id}`} variant="secondary">View signed record</ButtonLink>
        </div>
      )}

      {!isCurrent ? null : pending?.status === "sent" ? (
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
            <p className="font-medium text-ink">{pending ? `${REASON_LABEL[pending.reason]} opened by ${pending.openedBy === "worker" ? "you" : pending.openedBy === "system" ? "the placement list" : `your ${pending.openedBy.replace("-", " ")}`}` : roll.ended ? "Engagement has ended" : `Roll-off checkpoint opened ${roll.days} working days before the contract end`}</p>
            <p className="text-sm text-ink-2">Review your unapproved lines. Only you decide what the client sees.</p>
            {pending?.note && <p className="mt-1 text-sm text-ink-2">Note from your {pending.openedBy.replace("-", " ")}: “{pending.note}”</p>}
          </div>
          <ButtonLink href={`/worker/${w.id}/checkpoint${pending ? `?cp=${pending.id}` : ""}`}>Review lines</ButtonLink>
        </div>
      )}

      <div className={`grid gap-8 ${isCurrent ? "lg:grid-cols-[1fr_280px]" : ""}`}>
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
                    <p className="eyebrow mb-2">
                      {formatDate(t.e.date)}
                      {t.e.managerSaw && (t.e.witness?.status === "confirmed" ? ` · ${t.e.witness.manager} confirmed a 1-on-1, ${formatDate(t.e.witness.answeredOn!)}` : " · Manager saw this in a 1-on-1")}
                    </p>
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
                    {isCurrent && t.e.witness?.status === "asked" && (
                      <p className="mt-3 flex flex-wrap items-center gap-x-2 border-t border-line pt-3 text-xs text-ink-3">
                        Waiting for {t.e.witness.manager.split(" ")[0]} to confirm they saw this in a 1-on-1. Only this entry is shown to them.
                        <button onClick={() => store.cancelWitness(t.e.id)} className="text-accent hover:underline">Withdraw</button>
                      </p>
                    )}
                    {t.e.witness?.status === "declined" && (
                      <p className="mt-3 border-t border-line pt-3 text-xs text-ink-3">{t.e.witness.manager.split(" ")[0]} could not confirm this one, so it stays your own account.</p>
                    )}
                    {isCurrent && canAskWitness(t.e) && (
                      <p className="mt-3 border-t border-line pt-3 text-xs text-ink-3">
                        Shown to {ownerFirst} in a 1-on-1?{" "}
                        <button onClick={() => store.askWitness(t.e.id, owner)} className="text-accent hover:underline">Ask {ownerFirst} to confirm</button>
                      </p>
                    )}
                  </div>
                </li>
              ),
            )}
          </ol>
        </section>

        {isCurrent && <aside className="space-y-4">
          <div className="card space-y-3 p-4">
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="reminder" className="text-sm font-medium">Monthly reminder</label>
              <button
                id="reminder"
                role="switch"
                aria-checked={w.reminderOn}
                onClick={() => store.setReminder(w.id, !w.reminderOn)}
                className={`relative h-6 w-11 rounded-full transition-colors duration-150 ${w.reminderOn ? "bg-accent" : "bg-surface-3"}`}
              >
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-surface-1 shadow transition-[left] duration-150 ${w.reminderOn ? "left-[22px]" : "left-0.5"}`} />
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
            <p className="text-sm font-medium">Ask for approval now</p>
            {!opening ? (
              <>
                <p className="text-xs text-ink-3">For example when your client lead is about to leave, or you just finished something worth capturing.</p>
                <Button variant="secondary" onClick={() => setOpening(true)} disabled={!!pending}>{pending ? "A checkpoint is already open" : "Open checkpoint"}</Button>
              </>
            ) : (
              <div className="space-y-2 text-sm">
                <label className="block">
                  <span className="text-xs text-ink-3">Reason</span>
                  <select id="cp-reason" value={reason} onChange={(e) => setReason(e.target.value as CheckpointReason)} className="mt-1 w-full rounded-md border border-line bg-surface-2 px-2 py-1.5">
                    <option value="lead-change">Client lead is leaving</option>
                    <option value="manual">Worth capturing now</option>
                  </select>
                </label>
                <div className="flex gap-2 pt-1">
                  <Button onClick={openManual}>Open</Button>
                  <Button variant="ghost" onClick={() => setOpening(false)}>Cancel</Button>
                </div>
              </div>
            )}
          </div>
        </aside>}
      </div>
    </div>
  );
}

export default function SeatLogPage() {
  const { id } = useParams<{ id: string }>();
  const { session } = useStore();
  return (
    <Guard allow={(s) => s.role === "manager" || s.personId === id}>
      {session?.role === "manager" ? <ManagerEngagement workerId={id} /> : <Suspense fallback={null}><WorkerSeatLog /></Suspense>}
    </Guard>
  );
}
