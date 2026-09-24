"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useStore } from "@/lib/store";
import { Crumbs } from "@/components/ui";
import { Guard } from "@/components/Guard";
import { SeatHistoryView } from "@/components/SeatHistoryView";

function History() {
  const { id } = useParams<{ id: string }>();
  const { state, session } = useStore();
  const w = state.workers.find((x) => x.id === id);
  if (!w) return <p>Person not found.</p>;
  const own = session?.role === "worker" && session.personId === id;

  return (
    <div className="space-y-8">
      <meta name="robots" content="noindex, nofollow" />
      <Crumbs items={own ? [{ href: `/profile/${w.id}`, label: "My profile" }, { label: "Seat history" }] : [{ href: "/", label: "Your engagements" }, { href: `/profile/${w.id}`, label: w.name }, { label: "Seat history" }]} />
      <header className="space-y-2">
        <p className="eyebrow">Seat history · private to {own ? "you" : w.name.split(" ")[0]} and Bonarda Works</p>
        <h1 className="text-3xl font-semibold">{w.name}</h1>
        <p className="max-w-2xl text-ink-2">Every line below was approved by a named client lead on a date and signed by Bonarda Works. Change a single word and the signature fails.</p>
        <p className="text-sm text-ink-3">
          {w.share?.on ? "A share link is on. " : "Not shared publicly. "}
          {own ? <Link href={`/profile/${w.id}#share`} className="text-accent hover:underline">{w.share?.on ? "Manage your share link" : "Share your record"}</Link> : `Only ${w.name.split(" ")[0]} can turn sharing on.`}
        </p>
      </header>
      <SeatHistoryView state={state} workerId={w.id} />
    </div>
  );
}

export default function HistoryPage() {
  const { id } = useParams<{ id: string }>();
  return <Guard allow={(s) => s.role === "manager" || s.personId === id}><History /></Guard>;
}
