"use client";

import Link from "next/link";
import { engagementsFor, useStore } from "@/lib/store";
import { formatDate } from "@/lib/dates";
import { Loading, TierChip, TypeBadge } from "@/components/ui";

/** Demo showcase of records whose owners turned sharing on. In production there is no such directory. */
export default function SharedShowcase() {
  const { state, ready } = useStore();
  const noindex = <meta name="robots" content="noindex, nofollow" />;
  if (!ready) return <>{noindex}<Loading /></>;
  const shared = state.workers.filter((w) => w.share?.on);

  return (
    <div className="space-y-8">
      {noindex}
      <header className="space-y-3">
        <p className="eyebrow">Shared records · demo showcase</p>
        <h1 className="text-4xl font-semibold">Records people chose to share</h1>
        <p className="max-w-2xl text-ink-2">
          Each worker below turned on a share link for their client-approved lines. Open one to see what a prospective client sees, and check the signature
          yourself.
        </p>
        <p className="max-w-2xl rounded-lg border border-dashed border-line-strong px-3 py-2 text-sm text-ink-3">
          This list exists for the demo only. In the product, share links are unlisted: only people a worker sends the link to can see a record.
        </p>
      </header>

      {shared.length === 0 && (
        <div className="card space-y-2 p-6">
          <p className="font-medium">No shared records right now</p>
          <p className="text-sm text-ink-2">Nobody has sharing turned on in this browser&rsquo;s demo data. Sign in as a worker and turn on sharing from My profile, or reset the demo data to restore the five example records.</p>
        </div>
      )}

      <ul className="grid gap-4 sm:grid-cols-2">
        {shared.map((w) => {
          const eng = engagementsFor(state, w.id)[0];
          const recs = state.records.filter((r) => r.workerId === w.id);
          const lines = recs.flatMap((r) => r.lines);
          const latest = [...recs].sort((a, b) => (a.approvedAt < b.approvedAt ? 1 : -1))[0];
          const preview = lines.find((l) => !l.clientWritten) ?? lines[0];
          return (
            <li key={w.id}>
              <Link href={`/share/${w.share!.token}`} className="card group flex h-full flex-col gap-3 p-5 transition-colors hover:border-accent">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-xl font-semibold group-hover:text-accent">{w.name}</p>
                    <p className="text-sm text-ink-2">{w.title} · {w.location}</p>
                  </div>
                  <TypeBadge type={w.type} />
                </div>
                <p className="text-sm text-ink-3">{eng.clientLabel}</p>
                {preview && (
                  <div className="grid grid-cols-[1fr_auto] items-start gap-x-3 rounded-lg bg-surface-2 p-3 text-sm">
                    <span className={preview.clientWritten ? "italic" : ""}>{preview.clientWritten ? `“${preview.text}”` : preview.text}</span>
                    <TierChip tier={preview.tier} />
                  </div>
                )}
                <p className="mt-auto text-xs text-ink-3">
                  {lines.length} client-approved {lines.length === 1 ? "line" : "lines"}
                  {latest && ` · last approved ${formatDate(latest.approvedAt)}`}
                  <span className="ml-2 text-accent">Open record →</span>
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
