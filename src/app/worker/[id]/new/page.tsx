"use client";

import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { engagementsFor, useStore } from "@/lib/store";
import { screenText } from "@/lib/screen";
import { checkGrounding } from "@/lib/grounding";
import { Button, Crumbs, Loading } from "@/components/ui";
import { Highlighted } from "@/components/Highlighted";
import { Guard } from "@/components/Guard";
import { BottomActionBar } from "@/components/StickyBars";
import type { ModelFlag, RewriteResult } from "@/lib/types";
import { examplesFor } from "@/data/example-entries";

interface Draft { text: string; band: string; source: string; include: boolean }

function replaceAll(s: string, term: string, repl: string) {
  return s.replace(new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi"), repl);
}

function LogYourWork() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { state, ready, addEntry } = useStore();
  const [text, setText] = useState("");
  const [stage, setStage] = useState<"write" | "review">("write");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [origin, setOrigin] = useState<RewriteResult["origin"] | null>(null);
  const [flags, setFlags] = useState<(ModelFlag & { state: "open" | "accepted" | "dismissed" })[]>([]);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [screenedText, setScreenedText] = useState("");
  const [replacements, setReplacements] = useState<Record<string, string>>({});

  const w = state.workers.find((x) => x.id === id);
  const eng = w ? engagementsFor(state, w.id)[0] : undefined;
  const client = eng ? state.clients.find((c) => c.id === eng.clientId) : undefined;
  const hits = useMemo(() => screenText(text, client?.protectedTerms ?? []), [text, client]);

  if (!ready) return <Loading />;
  if (!w || !eng || !client) return <p>Person not found.</p>;

  const draftLines = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, clientType: client.type, stack: eng.stack, protectedTerms: client.protectedTerms }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      const r = data as RewriteResult;
      setOrigin(r.origin);
      setFlags(r.flags.map((f) => ({ ...f, state: "open" })));
      setDrafts(r.lines.map((l) => ({ ...l, include: true })));
      setScreenedText(text);
      setStage("review");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const acceptFlag = (i: number) => {
    const f = flags[i];
    setDrafts((ds) => ds.map((d) => ({ ...d, text: replaceAll(d.text, f.term, f.suggestion), source: replaceAll(d.source, f.term, f.suggestion) })));
    setScreenedText((s) => replaceAll(s, f.term, f.suggestion));
    setFlags((fs) => fs.map((x, j) => (j === i ? { ...x, state: "accepted" } : x)));
  };

  const openFlags = flags.filter((f) => f.state === "open").length;
  const checked = drafts.map((d) => ({ d, g: checkGrounding(d.text, screenedText) }));
  const ready_ = checked.filter(({ d, g }) => d.include && g.grounded && d.text.trim());

  const approve = () => {
    addEntry(eng.id, ready_.map(({ d }) => ({ text: d.text.trim(), band: d.band, source: d.source })));
    router.push(`/worker/${w.id}`);
  };

  return (
    <div className="space-y-8">
      <Crumbs items={[{ href: `/worker/${w.id}`, label: "My seat log" }, { label: "Log your work" }]} />

      <header className="space-y-2">
        <p className="eyebrow">{eng.clientLabel}</p>
        <h1 className="text-3xl font-semibold">Log your work</h1>
        <p className="max-w-2xl text-ink-2">Write what you did in your own words. Anything confidential is caught before it leaves this page, and nothing is saved until you approve it.</p>
      </header>

      <ol className="flex gap-2 text-sm" aria-label="Progress">
        {["Write", "Check and approve"].map((s, i) => {
          const active = (i === 0 && stage === "write") || (i === 1 && stage === "review");
          return (
            <li key={s} className={`rounded-full px-3 py-1 ${active ? "bg-accent-soft text-accent-soft-ink" : "text-ink-3"}`}>
              {i + 1}. {s}
            </li>
          );
        })}
      </ol>

      {stage === "write" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="space-y-3">
            <label htmlFor="entry" className="block font-medium">What did you work on?</label>
            <textarea
              id="entry"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={7}
              placeholder="What you built or changed, what you had to work around, how the team worked day to day…"
              className="w-full resize-y rounded-xl border border-line bg-surface-1 px-4 py-3 text-base leading-relaxed text-ink placeholder:text-ink-3"
            />
            <div className="space-y-2">
              <p className="text-xs text-ink-3">Try an example entry. Each one shows a different check.</p>
              <ul className="grid gap-2 sm:grid-cols-2">
                {examplesFor(client.id).map((ex) => (
                  <li key={ex.label}>
                    <button
                      onClick={() => setText(ex.text)}
                      title={ex.shows}
                      aria-pressed={text === ex.text}
                      className={`h-full w-full rounded-lg border px-3 py-1.5 text-left transition-colors ${text === ex.text ? "border-accent bg-accent-soft" : "border-line hover:border-line-strong hover:bg-surface-2"}`}
                    >
                      <span className="block text-sm text-ink">{ex.label}</span>
                      <span className="block text-[0.7rem] text-ink-3">{ex.shows}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={draftLines} disabled={busy || !text.trim() || hits.length > 0}>
                {busy ? "Checking…" : "Check and draft lines"}
              </Button>
              {hits.length > 0 && <span className="text-sm text-danger">Replace {hits.length} highlighted {hits.length === 1 ? "term" : "terms"} first</span>}
              {error && <span className="text-sm text-danger">{error}</span>}
            </div>
          </section>

          <section className="card space-y-4 p-4" aria-live="polite">
            <div className="flex items-center justify-between">
              <p className="eyebrow">Screen · runs in your browser</p>
              <span className={`font-mono text-xs ${hits.length ? "text-danger" : "text-accent"}`}>{hits.length ? `${hits.length} to replace` : text ? "Clear" : ""}</span>
            </div>
            {text ? <Highlighted text={text} hits={hits} /> : <p className="text-sm text-ink-3">Your entry will appear here with anything confidential marked.</p>}
            {hits.length > 0 && (
              <ul className="space-y-2 border-t border-line pt-3">
                {hits.map((h, i) => (
                  <li key={`${h.text}-${i}`} className="space-y-1.5">
                    <p className="text-sm"><span className="font-mono text-danger">{h.text}</span> <span className="text-ink-3">· {h.reason}</span></p>
                    <div className="flex gap-2">
                      <input
                        aria-label={`Replacement for ${h.text}`}
                        value={replacements[h.text] ?? ""}
                        onChange={(e) => setReplacements((r) => ({ ...r, [h.text]: e.target.value }))}
                        placeholder="Replace with a generic phrase"
                        className="min-w-0 flex-1 rounded-md border border-line bg-surface-2 px-2 py-1 text-sm"
                      />
                      <Button variant="secondary" className="py-1" disabled={!replacements[h.text]?.trim()} onClick={() => setText((t) => replaceAll(t, h.text, replacements[h.text].trim()))}>Replace</Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <p className="border-t border-line pt-3 text-xs text-ink-3">Only screened text is sent to the model. Your original wording is discarded when you approve.</p>
          </section>
        </div>
      )}

      {stage === "review" && (
        <div className="space-y-6">
          {origin && origin !== "live" && (
            <p className="text-xs text-ink-3">
              {origin === "cache" ? "Using a cached model response for this entry." : "Model unavailable. Showing a basic draft; check each line carefully."}
            </p>
          )}

          {flags.length > 0 && (
            <section className="space-y-2">
              <h2 className="text-lg font-semibold">The model spotted something the word list could not</h2>
              {flags.map((f, i) => (
                <div key={i} className={`card flex flex-wrap items-start justify-between gap-3 p-4 ${f.state === "open" ? "bg-warn-soft" : "opacity-70"}`}>
                  <div className="max-w-2xl">
                    <p className="font-medium"><span className="font-mono text-warn">{f.term}</span> → <span className="text-ink">{f.suggestion}</span></p>
                    <p className="text-sm text-ink-2">{f.reason}</p>
                  </div>
                  {f.state === "open" ? (
                    <div className="flex gap-2">
                      <Button onClick={() => acceptFlag(i)}>Use “{f.suggestion}”</Button>
                      <Button variant="ghost" onClick={() => setFlags((fs) => fs.map((x, j) => (j === i ? { ...x, state: "dismissed" } : x)))}>Keep</Button>
                    </div>
                  ) : (
                    <span className="font-mono text-xs uppercase text-ink-3">{f.state}</span>
                  )}
                </div>
              ))}
            </section>
          )}

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Drafted lines</h2>
            <p className="text-sm text-ink-2">Each line comes from something you wrote. Lines that claim more than you said are greyed out until you fix them.</p>
            <ul className="space-y-3">
              {checked.map(({ d, g }, i) => (
                <li key={i} className={`card p-4 ${!g.grounded ? "border-dashed" : ""}`}>
                  <div className="flex items-start gap-3">
                    <input
                      id={`inc-${i}`}
                      type="checkbox"
                      checked={d.include}
                      onChange={(e) => setDrafts((ds) => ds.map((x, j) => (j === i ? { ...x, include: e.target.checked } : x)))}
                      className="mt-2 h-4 w-4 accent-[var(--accent)]"
                      aria-label="Include this line"
                    />
                    <div className="min-w-0 flex-1 space-y-2">
                      <input
                        id={`line-${i}`}
                        value={d.text}
                        onChange={(e) => setDrafts((ds) => ds.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)))}
                        className={`w-full rounded-md border border-transparent bg-transparent px-2 py-1 text-base hover:border-line focus:border-line-strong ${!g.grounded ? "text-ink-3 line-through decoration-1" : "text-ink"}`}
                        aria-label="Line text"
                      />
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-2 text-xs">
                        <span className="rounded bg-surface-2 px-1.5 py-0.5 font-mono uppercase text-ink-2">{d.band}</span>
                        <span className="text-ink-3">From your entry: “{d.source}”</span>
                        {!g.grounded && <span className="text-danger">Not in your entry: {g.unsupported.join(", ")}. Edit to include.</span>}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <BottomActionBar>
            <Button onClick={approve} disabled={ready_.length === 0 || openFlags > 0}>Approve {ready_.length} {ready_.length === 1 ? "line" : "lines"}</Button>
            <Button variant="ghost" onClick={() => setStage("write")}>Back to editing</Button>
            {openFlags > 0 && <span className="text-sm text-warn">Decide on the highlighted term above first</span>}
          </BottomActionBar>
        </div>
      )}
    </div>
  );
}

export default function LogYourWorkPage() {
  const { id } = useParams<{ id: string }>();
  return <Guard allow={(s) => s.role === "worker" && s.personId === id}><LogYourWork /></Guard>;
}
