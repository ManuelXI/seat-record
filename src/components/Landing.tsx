import Link from "next/link";
import { TierChip } from "./ui";
import { HeroDeck } from "./HeroDeck";

const STEPS = [
  { title: "Log it while it’s fresh", body: "Workers write a few lines about their client work whenever they like, with an optional monthly reminder." },
  { title: "Screen it before it leaves", body: "A check in the browser removes client names, systems, people and figures. The model then flags what a word list can’t, and rewrites each line at skill level." },
  { title: "The client approves in an email they already get", body: "At each extension and before roll-off, the lines ride on the extension reply or the testimonial request. Approve, edit or decline, line by line." },
  { title: "Signed, on the profile, kept for good", body: "Approved lines are signed by Bonarda Works and land on the dev profile. Workers keep a copy, and can share an unlisted link." },
];

export function Landing() {
  return (
    <div className="space-y-20">
      <section className="grid items-center gap-10 pt-4 lg:grid-cols-[1.1fr_1fr]">
        <div className="space-y-6">
          <p className="eyebrow">Offboarding and re-engaging people · Bonarda Works</p>
          <h1 className="text-4xl font-semibold leading-[1.1] sm:text-5xl">A dated client approval is the one work credential a model cannot mint.</h1>
          <p className="max-w-xl text-lg text-ink-2">
            Seat Record captures what employees, contractors and freelancers did inside client teams, strips out anything confidential, and gets the client to
            approve it inside an email they already send.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/signin" className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 font-medium text-accent-ink transition-[background-color,scale] duration-150 hover:bg-accent-hover active:scale-[0.96]">Try the demo →</Link>
            <Link href="/share/k7f3a9c2" className="inline-flex items-center gap-2 rounded-lg border border-line-strong bg-surface-1 px-4 py-2.5 font-medium text-ink transition-[background-color,scale] duration-150 hover:bg-surface-2 active:scale-[0.96]">See a shared record</Link>
          </div>
          <p className="text-sm text-ink-3">Suggested path: sign in as Efua, log an entry, then switch to Ama, her manager.</p>
        </div>

        <HeroDeck />
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">The problem</h2>
          <p className="text-ink-2">
            Work done inside a client lives in the client&rsquo;s systems, under NDA. When an engagement ends, the evidence ends with it. Efua, fourteen months
            into a bank&rsquo;s risk team, writes her profile from memory, unsure what she&rsquo;s allowed to say. Kofi, a contractor, has no manager and no
            review, so nobody records what he did at all.
          </p>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">Why it matters now</h2>
          <p className="text-ink-2">
            CVs, references and code samples can all be generated. A line that a named client lead approved on a date, signed by the employer, can&rsquo;t.
            For Bonarda, profiles quote clients instead of memory and re-engagement starts from evidence. For workers, a year of work becomes something they own.
          </p>
        </div>
      </section>

      <section className="space-y-6" aria-labelledby="how">
        <h2 id="how" className="text-2xl font-semibold">How it works</h2>
        <ol className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <li key={s.title} className="card space-y-2 p-5">
              <span className="font-display text-2xl font-semibold text-accent">{i + 1}</span>
              <h3 className="text-lg font-semibold leading-snug">{s.title}</h3>
              <p className="text-sm text-ink-2">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="grid gap-8 md:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Three honest tiers</h2>
          <ul className="space-y-3">
            {([
              ["client-approved", "A named client lead approved it on a date. Signed by Bonarda Works."],
              ["manager-witnessed", "The worker’s account, read by their manager when it was written."],
              ["engineer-account", "Dated and self-written, clearly labelled. The default for most contractors."],
            ] as const).map(([tier, text]) => (
              <li key={tier} className="flex items-start gap-3"><TierChip tier={tier} /><span className="text-sm text-ink-2">{text}</span></li>
            ))}
          </ul>
        </div>
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Where the AI is, and is not</h2>
          <ul className="space-y-2 text-sm text-ink-2">
            <li><strong className="text-ink">It does:</strong> flag confidential detail a word list can&rsquo;t catch, and rewrite a true, specific sentence into a true, generic one.</li>
            <li><strong className="text-ink">Code does:</strong> the first screen, the check that every claim is in the worker&rsquo;s own words, tiers, signing and storage.</li>
            <li><strong className="text-ink">Nobody is scored:</strong> no model rates, ranks or compares a person. Workers decide what a client sees.</li>
          </ul>
        </div>
      </section>

      <section className="card flex flex-wrap items-center justify-between gap-4 p-6">
        <div>
          <h2 className="text-xl font-semibold">See it from each side</h2>
          <p className="text-sm text-ink-2">Workers, managers and client leads each get their own view. No passwords; everything is fictional.</p>
        </div>
        <Link href="/signin" className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 font-medium text-accent-ink transition-[background-color,scale] duration-150 hover:bg-accent-hover active:scale-[0.96]">Try the demo →</Link>
      </section>

      <p className="text-xs text-ink-3">Built for the Turntabl Future of Work hackathon. Bonarda Works, every person and every client here are fictional.</p>
    </div>
  );
}
