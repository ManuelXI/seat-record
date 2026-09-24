"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { engagementsFor, entriesFor, lineTier, useStore } from "@/lib/store";
import { formatDate, monthsBetween } from "@/lib/dates";
import { Crumbs, Loading, TierChip, TypeBadge } from "@/components/ui";
import type { Tier } from "@/lib/types";

const ORDER: Record<Tier, number> = { "client-approved": 0, "manager-witnessed": 1, "engineer-account": 2 };

export default function Profile() {
  const { id } = useParams<{ id: string }>();
  const { state, ready } = useStore();
  const [view, setView] = useState<"with" | "before">("with");
  const w = state.workers.find((x) => x.id === id);
  if (!ready) return <Loading />;
  if (!w) return <p>Person not found.</p>;
  const initials = w.name.split(" ").map((p) => p[0]).join("");

  return (
    <div className="space-y-6">
      <Crumbs items={[{ href: "/", label: "People" }, { href: `/worker/${w.id}`, label: w.name }, { label: "Dev profile" }]} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-2">The one-page profile sent to prospective clients. {w.name.split(" ")[0]} writes it; Seat Record fills the Experience section.</p>
        <div role="radiogroup" aria-label="Profile view" className="flex rounded-lg border border-line bg-surface-1 p-0.5 text-sm">
          {([["before", "Before Seat Record"], ["with", "With Seat Record"]] as const).map(([v, label]) => (
            <button key={v} role="radio" aria-checked={view === v} onClick={() => setView(v)}
              className={`rounded-md px-3 py-1 ${view === v ? "bg-surface-3 text-ink" : "text-ink-3 hover:text-ink"}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <article className="card overflow-hidden">
        <header className="flex flex-wrap items-center gap-5 border-b border-line bg-accent-soft px-6 py-6 sm:px-8">
          <span aria-hidden className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-1 font-display text-2xl font-semibold text-accent">{initials}</span>
          <div>
            <h1 className="text-3xl font-semibold">{w.name}</h1>
            <p className="text-ink-2">{w.title} · {w.location}</p>
          </div>
          <span className="ml-auto"><TypeBadge type={w.type} /></span>
        </header>

        <div className="grid gap-8 px-6 py-7 sm:px-8 md:grid-cols-[220px_1fr]">
          <aside className="space-y-6">
            <section>
              <h2 className="eyebrow mb-2">About</h2>
              <p className="text-sm text-ink-2">{w.about}</p>
            </section>
            <section>
              <h2 className="eyebrow mb-2">Technical skills</h2>
              <ul className="flex flex-wrap gap-1.5">
                {w.skills.map((s) => <li key={s} className="rounded bg-surface-2 px-2 py-0.5 text-sm">{s}</li>)}
              </ul>
            </section>
            <section>
              <h2 className="eyebrow mb-2">Available</h2>
              <p className="text-sm tabular-nums">{formatDate(w.availableFrom)}</p>
            </section>
          </aside>

          <section>
            <h2 className="eyebrow mb-4">Experience</h2>
            <div className="space-y-7">
              {engagementsFor(state, w.id).map((eng) => {
                const lines = entriesFor(state, eng.id)
                  .flatMap((e) => e.lines.filter((l) => l.status !== "declined").map((l) => ({ l, tier: lineTier(e, l) })))
                  .sort((a, b) => ORDER[a.tier] - ORDER[b.tier]);
                const approved = lines.filter((x) => x.tier === "client-approved").length;
                return (
                  <div key={eng.id} className="space-y-2">
                    <div>
                      <h3 className="text-lg font-semibold">{eng.role}</h3>
                      <p className="text-sm text-ink-2">{eng.clientLabel} · {w.type === "employee" ? "Placement" : "Contract"}</p>
                      <p className="text-sm tabular-nums text-ink-3">{formatDate(eng.start)} to {formatDate(eng.end)} · {monthsBetween(eng.start, eng.end)} months</p>
                    </div>
                    {view === "before" ? (
                      <ul className="list-disc space-y-1 pl-5 text-ink-2">
                        <li>Worked on client systems (confidential).</li>
                        <li>Developed and maintained features.</li>
                      </ul>
                    ) : (
                      <>
                        <ul className="space-y-2">
                          {lines.map(({ l, tier }) => (
                            <li key={l.id} className="grid grid-cols-[1fr_auto] items-start gap-x-3">
                              <span className={l.clientWritten ? "italic text-ink-2" : ""}>{l.clientWritten ? `“${l.text}” — client lead` : l.text}</span>
                              <TierChip tier={tier} />
                            </li>
                          ))}
                        </ul>
                        <p className="pt-1 text-sm">
                          <Link href={`/history/${w.id}`} className="text-accent hover:underline">Seat history</Link>
                          <span className="text-ink-3"> · {approved} of {lines.length} lines approved by the client, signed by Bonarda Works</span>
                        </p>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </article>
    </div>
  );
}
