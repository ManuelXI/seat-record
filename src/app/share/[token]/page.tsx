"use client";

import { useParams } from "next/navigation";
import { useStore } from "@/lib/store";
import { Loading, TypeBadge } from "@/components/ui";
import { SeatHistoryView } from "@/components/SeatHistoryView";

/** Unlisted page a worker chooses to share. Anyone with the link can read and verify it. */
export default function SharedRecord() {
  const { token } = useParams<{ token: string }>();
  const { state, ready } = useStore();
  const noindex = <meta name="robots" content="noindex, nofollow" />;
  if (!ready) return <>{noindex}<Loading /></>;
  const w = state.workers.find((x) => x.share?.on && x.share.token === token);

  if (!w) {
    return (
      <div className="card mx-auto max-w-lg space-y-2 p-6">
        {noindex}
        <p className="eyebrow">Link not active</p>
        <h1 className="text-2xl font-semibold">This record isn&rsquo;t shared</h1>
        <p className="text-ink-2">The person may have turned sharing off or replaced this link with a new one. Ask them for a current link.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {noindex}
      <header className="space-y-3">
        <p className="eyebrow">Shared by {w.name.split(" ")[0]} · verified by Bonarda Works</p>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-4xl font-semibold">{w.name}</h1>
          <TypeBadge type={w.type} />
        </div>
        <p className="text-ink-2">{w.title} · {w.location}</p>
        <p className="max-w-2xl text-ink-2">
          Each line was approved by the client lead named beside it and signed by Bonarda Works. Client names and anything confidential were removed before
          approval. Change a single word and the signature fails.
        </p>
      </header>
      <SeatHistoryView state={state} workerId={w.id} />
      <p className="border-t border-line pt-4 text-xs text-ink-3">This page is unlisted and not indexed by search engines. {w.name.split(" ")[0]} can turn it off at any time.</p>
    </div>
  );
}
