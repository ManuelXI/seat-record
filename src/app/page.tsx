"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { engagementsFor, rollOffStatus, useStore } from "@/lib/store";
import { formatDate } from "@/lib/dates";
import { MANAGERS } from "@/lib/people";
import { Loading, TypeBadge } from "@/components/ui";
import { Landing } from "@/components/Landing";


export default function Home() {
  const { state, ready, session } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (ready && session?.role === "worker") router.replace(`/worker/${session.personId}`);
  }, [ready, session, router]);

  // Signed-out visitors (and the server render) get the explanatory landing page.
  if (!ready || !session) return <Landing />;
  if (session.role !== "manager") return <Loading />;
  const me = MANAGERS.find((m) => m.id === session.personId)!;

  const rows = state.workers.map((w) => {
    const eng = engagementsFor(state, w.id)[0];
    const lines = state.entries.filter((e) => e.engagementId === eng.id).flatMap((e) => e.lines);
    const approved = lines.filter((l) => l.status === "client-approved").length;
    const pending = state.checkpoints.find((c) => c.engagementId === eng.id && c.status !== "approved");
    const rollOffDone = state.checkpoints.some((c) => c.engagementId === eng.id && c.reason === "roll-off" && c.status === "approved");
    return { w, eng, approved, roll: rollOffStatus(eng.end), pending, rollOffDone };
  });
  const mine = rows.filter((r) => r.eng.engagementOwner === me.name);
  const attention = mine.filter((r) => r.pending || ((r.roll.windowOpen || r.roll.ended) && !r.rollOffDone));

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

      <section className="card flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <h2 className="text-xl font-semibold">Find people for a client request</h2>
          <p className="text-sm text-ink-2">Search client-approved evidence, not just skills lists. See exactly what each person has done, quoted.</p>
        </div>
        <Link href="/search" className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-ink transition-[background-color,scale] duration-150 hover:bg-accent-hover active:scale-[0.96]">Find people →</Link>
      </section>
    </div>
  );
}
