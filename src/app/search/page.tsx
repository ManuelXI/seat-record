"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { engagementsFor, useStore } from "@/lib/store";
import { formatDate } from "@/lib/dates";
import { Button, Crumbs, TierChip, TypeBadge } from "@/components/ui";
import { Guard } from "@/components/Guard";
import type { SearchResult } from "@/lib/search";
import type { Tier } from "@/lib/types";

const EXAMPLES = [
  "Java developer who has handled Kafka failures and run incident reviews",
  "Someone who has automated releases on Kubernetes and built React screens for trading or portfolio data",
  "Python API developer for a patient booking product",
  "Kotlin backend contractor for payments, comfortable with PostgreSQL migrations",
  "Data engineer who has built Airflow pipelines and documented data lineage",
  "Frontend engineer with React and testing experience on trading screens",
  "Someone who can mentor newer engineers and raise code review standards",
  "Engineer who works well with product owners and QA to get releases out",
];

interface Line { id: string; text: string; tier: Tier; clientWritten?: boolean; workerId: string; engagementId: string; approver: string; approvedAt: string }

function SearchPage() {
  const { state } = useStore();
  const [request, setRequest] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [mode, setMode] = useState<"all" | "any">("any");

  // Only client-approved, signed lines are searchable. A worker's private log never enters.
  const lines: Line[] = useMemo(
    () => state.records.flatMap((r) => r.lines.map((l, i) => ({ id: `${r.id}#${i}`, text: l.text, tier: l.tier, clientWritten: l.clientWritten, workerId: r.workerId, engagementId: r.engagementId, approver: r.approver, approvedAt: r.approvedAt }))),
    [state.records],
  );
  const byId = useMemo(() => new Map(lines.map((l) => [l.id, l])), [lines]);

  const run = async (q = request) => {
    if (!q.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ request: q, lines: lines.map(({ id, text }) => ({ id, text })) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Search failed");
      setResult(data as SearchResult);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Search failed");
    } finally {
      setBusy(false);
    }
  };

  const people = useMemo(() => {
    if (!result) return [];
    const perWorker = new Map<string, Map<number, { line: Line; reason: string }[]>>();
    for (const m of result.matches) {
      const line = byId.get(m.lineId);
      if (!line) continue;
      const reqs = perWorker.get(line.workerId) ?? new Map();
      const list = reqs.get(m.requirement) ?? [];
      if (!list.some((x: { line: Line }) => x.line.id === line.id)) list.push({ line, reason: m.reason });
      reqs.set(m.requirement, list);
      perWorker.set(line.workerId, reqs);
    }
    return [...perWorker.entries()]
      .map(([workerId, reqs]) => ({ worker: state.workers.find((w) => w.id === workerId)!, reqs }))
      .filter((p) => p.worker && (mode === "any" || result.requirements.every((_, i) => p.reqs.has(i))))
      .sort((a, b) => (a.worker.availableFrom < b.worker.availableFrom ? -1 : 1));
  }, [result, byId, state.workers, mode]);

  return (
    <div className="space-y-8">
      <Crumbs items={[{ href: "/", label: "Your engagements" }, { label: "Find people" }]} />
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Find people by evidence</h1>
        <p className="max-w-2xl text-ink-2">
          Describe what the client needs. Seat Record breaks it into requirements and shows who has client-approved evidence for each one, quoted in full.
          It never scores or ranks anyone.
        </p>
      </header>

      <section className="card space-y-3 p-5">
        <label htmlFor="req" className="font-medium">What does the client need?</label>
        <textarea
          id="req"
          value={request}
          onChange={(e) => setRequest(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) run(); }}
          rows={2}
          placeholder="e.g. someone who has implemented retries on Kafka and worked on React trading screens"
          className="w-full resize-y rounded-lg border border-line bg-surface-2 px-3 py-2.5 text-ink placeholder:text-ink-3"
        />
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="text-ink-3">Try:</span>
          {EXAMPLES.map((ex) => (
            <button key={ex} onClick={() => { setRequest(ex); run(ex); }} className="rounded-lg border border-line px-2.5 py-1 text-left text-ink-2 transition-colors duration-150 hover:bg-surface-2 hover:text-ink">{ex}</button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Button onClick={() => run()} disabled={busy || !request.trim()}>{busy ? "Searching…" : "Search evidence"}</Button>
          <span className="text-xs text-ink-3">Searches {lines.length} client-approved lines. Lines still private in a worker&rsquo;s log are never searched.</span>
          {error && <span className="text-sm text-danger">{error}</span>}
        </div>
      </section>

      {result && (
        <section className="space-y-4" aria-live="polite">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-ink-3">Requirements:</span>
              {result.requirements.map((r, i) => (
                <span key={i} className="rounded-full bg-accent-soft px-2.5 py-0.5 text-sm text-accent-soft-ink">{r}</span>
              ))}
            </div>
            <div role="radiogroup" aria-label="Show people with" className="flex rounded-lg border border-line bg-surface-1 p-0.5 text-sm">
              {([["any", "Evidence for any"], ["all", "Evidence for every requirement"]] as const).map(([v, label]) => (
                <button key={v} role="radio" aria-checked={mode === v} onClick={() => setMode(v)}
                  className={`rounded-md px-3 py-1 transition-colors duration-150 ${mode === v ? "bg-surface-3 text-ink" : "text-ink-3 hover:text-ink"}`}>{label}</button>
              ))}
            </div>
          </div>
          <p className="text-xs text-ink-3">
            {result.origin === "cache" ? "Requirements and matches from a cached model response, plus keyword matches." : result.origin === "live" ? "Requirements and matches from the model, plus keyword matches." : "Model unavailable: requirements split from your text and matched by shared words."}{" "}
            Sorted by availability.
          </p>

          {people.length === 0 ? (
            <div className="card p-6 text-ink-2">
              {mode === "all" ? "Nobody has approved evidence for every requirement yet. Switch to “Evidence for any” to see partial matches." : "No client-approved lines match these requirements yet."}
            </div>
          ) : (
            <ul className="space-y-4">
              {people.map(({ worker, reqs }) => {
                const eng = engagementsFor(state, worker.id)[0];
                return (
                  <li key={worker.id} className="card overflow-hidden">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-line bg-surface-2 px-5 py-3">
                      <Link href={`/profile/${worker.id}`} className="font-display text-lg font-semibold hover:text-accent">{worker.name}</Link>
                      <TypeBadge type={worker.type} />
                      <span className="text-sm text-ink-3">Now: {eng.clientLabel}</span>
                      <span className="ml-auto text-sm text-ink-2">Available {formatDate(worker.availableFrom)}</span>
                    </div>
                    <dl className="divide-y divide-line">
                      {result.requirements.map((r, i) => {
                        const ev = reqs.get(i) ?? [];
                        return (
                          <div key={i} className="grid gap-2 px-5 py-3 sm:grid-cols-[200px_1fr]">
                            <dt className="text-sm font-medium text-ink-2">{r}</dt>
                            <dd className="space-y-2">
                              {ev.length === 0 ? (
                                <p className="text-sm text-ink-3">No approved evidence</p>
                              ) : (
                                ev.map(({ line, reason }) => (
                                  <div key={line.id} className="space-y-1">
                                    <div className="grid grid-cols-[1fr_auto] items-start gap-x-3 text-sm">
                                      <span className={line.clientWritten ? "italic" : ""}>“{line.text}”</span>
                                      <TierChip tier={line.tier} />
                                    </div>
                                    <p className="text-xs text-ink-3">
                                      <span className="text-ink-2">From {state.engagements.find((e) => e.id === line.engagementId)?.clientLabel ?? "an engagement"}.</span> {reason} Approved by {line.approver}, {formatDate(line.approvedAt)}.
                                    </p>
                                  </div>
                                ))
                              )}
                            </dd>
                          </div>
                        );
                      })}
                    </dl>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}

export default function Page() {
  return <Guard allow={(s) => s.role === "manager"}><SearchPage /></Guard>;
}
