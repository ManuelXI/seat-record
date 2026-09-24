"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { engagementsFor, rollOffStatus, useStore } from "@/lib/store";
import { extractStack } from "@/lib/match";
import { formatDate } from "@/lib/dates";
import { MANAGERS } from "@/lib/people";
import { Loading, TypeBadge } from "@/components/ui";

const EXAMPLES = ["Java developer, risk tech, Kafka a plus", "We have a patient booking product and need people to build it: Python, React, Kotlin"];

export default function Home() {
  const { state, ready, session } = useStore();
  const router = useRouter();
  const [request, setRequest] = useState("");
  const stack = useMemo(() => extractStack(request), [request]);

  useEffect(() => {
    if (!ready) return;
    if (!session) router.replace("/signin");
    else if (session.role === "worker") router.replace(`/worker/${session.personId}`);
  }, [ready, session, router]);

  if (!ready || !session || session.role !== "manager") return <Loading />;
  const me = MANAGERS.find((m) => m.id === session.personId)!;

  const rows = state.workers.map((w) => {
    const eng = engagementsFor(state, w.id)[0];
    const lines = state.entries.filter((e) => e.engagementId === eng.id).flatMap((e) => e.lines);
    const approved = lines.filter((l) => l.status === "client-approved").length;
    const skills = new Set([...w.skills, ...eng.stack].map((s) => s.toLowerCase()));
    const matched = stack.filter((s) => skills.has(s.toLowerCase()));
    const pending = state.checkpoints.find((c) => c.engagementId === eng.id && c.status !== "approved");
    const rollOffDone = state.checkpoints.some((c) => c.engagementId === eng.id && c.reason === "roll-off" && c.status === "approved");
    return { w, eng, approved, matched, roll: rollOffStatus(eng.end), pending, rollOffDone };
  });
  const mine = rows.filter((r) => r.eng.engagementOwner === me.name);
  const attention = mine.filter((r) => r.pending || ((r.roll.windowOpen || r.roll.ended) && !r.rollOffDone));
  const matches = stack.length ? rows.filter((r) => r.matched.length > 0).sort((a, b) => (a.w.availableFrom < b.w.availableFrom ? -1 : 1)) : [];

  const status = (r: (typeof rows)[number]) =>
    r.pending?.status === "sent" ? "With the client lead" : r.pending ? "Checkpoint open, waiting for the worker" : r.roll.ended ? (r.rollOffDone ? "Ended, record approved" : "Ended, no roll-off record yet") : r.roll.windowOpen ? (r.rollOffDone ? "Roll-off approved" : `Roll-off window open, ${r.roll.days} working days`) : `${r.roll.days} working days to contract end`;

  return (
    <div className="space-y-12">
      <section className="space-y-2">
        <p className="eyebrow">{me.title}</p>
        <h1 className="text-4xl font-semibold">Welcome back, {me.name.split(" ")[0]}</h1>
        <p className="max-w-2xl text-ink-2">You can open checkpoints and see what clients have approved. What reaches a client is always the worker&rsquo;s decision.</p>
      </section>

      {attention.length > 0 && (
        <section className="space-y-3" aria-labelledby="attention">
          <h2 id="attention" className="text-xl font-semibold">Needs attention</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {attention.map((r) => (
              <li key={r.w.id}>
                <Link href={`/worker/${r.w.id}`} className="card block space-y-1 p-4 transition-colors hover:border-accent">
                  <div className="flex items-center justify-between gap-2"><span className="font-medium">{r.w.name}</span><TypeBadge type={r.w.type} /></div>
                  <p className="text-sm text-ink-2">{r.eng.clientLabel}</p>
                  <p className="text-sm text-warn">{status(r)}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="mine" className="space-y-4">
        <h2 id="mine" className="text-xl font-semibold">Your engagements</h2>
        <div className="overflow-x-auto rounded-xl border border-line bg-surface-1">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-line bg-surface-2 text-left">
                {["Person", "Engagement", "Contract end", "Status", ""].map((h) => (
                  <th key={h} className="px-4 py-2.5 font-mono text-[0.68rem] font-normal uppercase tracking-wider text-ink-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {mine.map((r) => (
                <tr key={r.w.id} className="align-top">
                  <td className="px-4 py-3"><div className="font-medium">{r.w.name}</div><div className="mt-1"><TypeBadge type={r.w.type} /></div></td>
                  <td className="px-4 py-3 text-ink-2">{r.eng.clientLabel}</td>
                  <td className="px-4 py-3 tabular-nums">{formatDate(r.eng.end)}</td>
                  <td className="px-4 py-3 text-ink-2">{status(r)}<div className="text-xs text-ink-3">{r.approved} client-approved lines</div></td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-3">
                      <Link href={`/worker/${r.w.id}`} className="text-accent hover:underline">Engagement</Link>
                      <Link href={`/profile/${r.w.id}`} className="text-accent hover:underline">Profile</Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="find" className="card scroll-mt-6 p-5 sm:p-6" aria-labelledby="find-title">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="find-title" className="text-xl font-semibold">Find people for a client request</h2>
          <span className="text-xs text-ink-3">Filters by stack, sorts by availability. Never scores people.</span>
        </div>
        <label htmlFor="request" className="sr-only">Client request</label>
        <textarea
          id="request" value={request} onChange={(e) => setRequest(e.target.value)} rows={2}
          placeholder="Paste the client's request, e.g. “we need a Java developer with Kafka”"
          className="mt-4 w-full resize-y rounded-lg border border-line bg-surface-2 px-3 py-2.5 text-ink placeholder:text-ink-3"
        />
        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          <span className="text-ink-3">Try:</span>
          {EXAMPLES.map((ex) => (
            <button key={ex} onClick={() => setRequest(ex)} className="rounded-full border border-line px-2.5 py-0.5 text-ink-2 hover:bg-surface-2 hover:text-ink">{ex}</button>
          ))}
        </div>
        {stack.length > 0 && (
          <div className="mt-5 space-y-3">
            <p className="text-sm text-ink-2">Stack in request: {stack.map((s) => <span key={s} className="mr-1.5 rounded bg-accent-soft px-1.5 py-0.5 font-mono text-xs text-accent-soft-ink">{s}</span>)}</p>
            {matches.length === 0 ? (
              <p className="text-sm text-ink-3">Nobody has that stack on their profile yet.</p>
            ) : (
              <ul className="divide-y divide-line rounded-lg border border-line">
                {matches.map(({ w, matched, approved }) => (
                  <li key={w.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3">
                    <Link href={`/profile/${w.id}`} className="font-medium hover:text-accent">{w.name}</Link>
                    <TypeBadge type={w.type} />
                    <span className="text-sm text-ink-3">Available {formatDate(w.availableFrom)}</span>
                    <span className="text-sm text-ink-2">{matched.join(", ")}</span>
                    <span className="ml-auto text-sm text-ink-2">{approved} client-approved {approved === 1 ? "line" : "lines"}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
