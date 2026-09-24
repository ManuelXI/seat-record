"use client";

import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useStore, type ClientDecision } from "@/lib/store";
import { screenText } from "@/lib/screen";
import { formatDate } from "@/lib/dates";
import { Button, ButtonLink, CheckIcon, Loading, MockBanner } from "@/components/ui";
import { Highlighted } from "@/components/Highlighted";
import type { SignedRecord } from "@/lib/types";

type Action = ClientDecision["action"];

export default function ClientEmail() {
  const { checkpointId } = useParams<{ checkpointId: string }>();
  const { state, ready, completeClientReview } = useStore();
  const [decisions, setDecisions] = useState<Record<string, { action: Action; text?: string }>>({});
  const [testimonial, setTestimonial] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<SignedRecord | null>(null);

  const cp = state.checkpoints.find((c) => c.id === checkpointId);
  const eng = cp ? state.engagements.find((e) => e.id === cp.engagementId) : undefined;
  const w = eng ? state.workers.find((x) => x.id === eng.workerId) : undefined;
  const client = eng ? state.clients.find((c) => c.id === eng.clientId) : undefined;
  const lines = useMemo(() => (cp ? state.entries.flatMap((e) => e.lines).filter((l) => cp.lineIds.includes(l.id)) : []), [cp, state.entries]);
  const tHits = useMemo(() => screenText(testimonial, client?.protectedTerms ?? []), [testimonial, client]);

  if (!ready) return <Loading />;
  if (!cp || !eng || !w) return <p>Checkpoint not found.</p>;

  const first = w.name.split(" ")[0];
  const decided = lines.every((l) => decisions[l.id]);
  const set = (id: string, action: Action, text?: string) => setDecisions((d) => ({ ...d, [id]: { action, text } }));

  const submit = async () => {
    setBusy(true);
    const record = await completeClientReview(
      cp.id,
      eng.clientLead,
      lines.map((l) => ({ lineId: l.id, action: decisions[l.id].action, text: decisions[l.id].text })),
      tHits.length === 0 ? testimonial : undefined,
    );
    setDone(record);
    setBusy(false);
  };

  if (done || cp.status === "approved") {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="card space-y-3 p-6">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-accent text-accent-ink"><CheckIcon className="h-5 w-5" /></span>
          <h1 className="text-2xl font-semibold">Thank you. Your approval is recorded.</h1>
          <p className="text-ink-2">
            {done ? done.lines.length : cp.lineIds.length} lines were signed by Bonarda Works on {formatDate(done?.approvedAt ?? cp.approvedAt!)} and added to {first}&rsquo;s record.
            Declined lines were deleted.
          </p>
          {done && <p className="break-all font-mono text-xs text-ink-3">Signature {done.signature.slice(0, 44)}…</p>}
          <div className="flex flex-wrap gap-2 pt-2">
            <ButtonLink href={`/profile/${w.id}`}>Back to {first}&rsquo;s profile (demo)</ButtonLink>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <MockBanner>This is the email the client lead already receives. In production it arrives in their inbox; no login is needed.</MockBanner>
      <article className="card overflow-hidden">
        <header className="space-y-1 border-b border-line bg-surface-2 px-5 py-4 text-sm">
          <p><span className="text-ink-3">From</span> Bonarda Works &lt;engagements@bonarda.example&gt;</p>
          <p><span className="text-ink-3">To</span> {eng.clientLead}</p>
          <p className="pt-1 text-base font-medium text-ink">
            {cp.reason === "extension" ? `Re: Extension for ${w.name}` : `A short testimonial for ${w.name}?`}
          </p>
        </header>

        <div className="space-y-6 px-5 py-6">
          <div className="space-y-3 text-ink-2">
            <p>Hello,</p>
            <p>
              {cp.reason === "extension"
                ? `Thank you for extending ${first}'s engagement.`
                : `${first}'s engagement with your team is coming to an end on ${formatDate(eng.end)}. Thank you for having them.`}{" "}
              {first} has described their work below, with anything confidential removed. Would you confirm the lines you stand behind? It takes about a minute.
            </p>
          </div>

          <ul className="space-y-3">
            {lines.map((l) => {
              const d = decisions[l.id];
              return (
                <li key={l.id} className={`rounded-lg border p-4 ${d?.action === "decline" ? "border-line opacity-50" : d ? "border-accent" : "border-line"}`}>
                  {d?.action === "edit" ? (
                    <input
                      id={`edit-${l.id}`}
                      value={d.text ?? l.text}
                      onChange={(e) => set(l.id, "edit", e.target.value)}
                      className="w-full rounded-md border border-line-strong bg-surface-2 px-2 py-1.5"
                      aria-label="Edited line"
                      autoFocus
                    />
                  ) : (
                    <p className={d?.action === "decline" ? "line-through" : ""}>{l.text}</p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Decision">
                    {(["approve", "edit", "decline"] as Action[]).map((a) => (
                      <button
                        key={a}
                        onClick={() => set(l.id, a, a === "edit" ? (d?.text ?? l.text) : undefined)}
                        aria-pressed={d?.action === a}
                        className={`rounded-md px-3 py-1 text-sm capitalize transition-colors ${
                          d?.action === a ? (a === "decline" ? "bg-danger-soft text-danger" : "bg-accent text-accent-ink") : "border border-line text-ink-2 hover:bg-surface-2"
                        }`}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="space-y-2">
            <label htmlFor="testimonial" className="font-medium">Anything you would like to add? <span className="font-normal text-ink-3">(optional testimonial)</span></label>
            <textarea
              id="testimonial"
              value={testimonial}
              onChange={(e) => setTestimonial(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-line bg-surface-2 px-3 py-2"
              placeholder={`What was it like working with ${first}?`}
            />
            {tHits.length > 0 && (
              <div className="rounded-lg bg-danger-soft p-3 text-sm">
                <p className="mb-1 text-danger">This mentions something confidential, so it will not be attached unless you rephrase:</p>
                <Highlighted text={testimonial} hits={tHits} />
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-line pt-5">
            <Button onClick={submit} disabled={!decided || busy}>{busy ? "Signing…" : "Confirm"}</Button>
            {!decided && <span className="text-sm text-ink-3">Choose approve, edit or decline for each line.</span>}
          </div>
          <p className="text-xs text-ink-3">Prefer email? Reply naming the lines you stand behind and we will record it the same way.</p>
        </div>
      </article>
    </div>
  );
}
