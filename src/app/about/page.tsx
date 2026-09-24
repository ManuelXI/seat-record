import { RUNTIME_MODEL } from "@/lib/rewrite";

const REAL = [
  ["Browser screen for protected terms, names, acronyms, figures and identifiers", "Real, tested"],
  ["Model pass: flags domain signals, rewrites at skill level", `Real (${RUNTIME_MODEL}); scripted demo entries use cached responses`],
  ["Grounding check on drafted lines", "Real, tested"],
  ["Checkpoints, default-all selection, worker approval", "Real"],
  ["Ed25519 signing and verification of approved records", "Real, tested; demo key"],
  ["Tiers, seat history, profile Experience section, export", "Real"],
  ["Find people: requirements from a request, matched to approved lines", `Real (${RUNTIME_MODEL} plus keyword matching); demo requests cached`],
  ["Placement list and contract end dates", "Mocked with seed data"],
  ["Extension and testimonial emails to the client", "Mocked as an on-screen email"],
  ["Monthly reminder delivery", "Mocked as an on-screen card"],
  ["Worker-controlled share links", "Real; demo links live in this browser"],
  ["Storage", "Browser storage for the demo"],
];

export default function About() {
  return (
    <div className="max-w-3xl space-y-10">
      <header className="space-y-3">
        <p className="eyebrow">How it works</p>
        <h1 className="text-4xl font-semibold">Make a true sentence safe to say, then get it approved</h1>
        <p className="text-lg text-ink-2">
          Bonarda Works places employees, contractors and freelancers inside client teams. Their work lives in the client&rsquo;s systems under NDA, so when
          an engagement ends the evidence of it ends too. Seat Record captures the work while it is fresh, screens it, and has the client approve it inside
          an email they already send.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">Where the AI is, and is not</h2>
        <ul className="list-disc space-y-2 pl-5 text-ink-2">
          <li><strong className="text-ink">Is:</strong> flagging confidential signals a word list cannot catch, with a reason; rewriting a true, specific sentence into a true, generic one.</li>
          <li><strong className="text-ink">Is not:</strong> the first screen, the grounding check, tiers, signing, storage or matching. Those are plain code with tests.</li>
          <li><strong className="text-ink">Never:</strong> scoring, rating, ranking or comparing a person. Matching filters by stack and sorts by availability.</li>
          <li><strong className="text-ink">Guardrails:</strong> only screened text is sent; structured output; server-side refusal fallback; a cached response for every scripted entry; a labelled plain draft if the model is unavailable.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">Real and mocked</h2>
        <div className="overflow-x-auto rounded-xl border border-line bg-surface-1">
          <table className="w-full min-w-[560px] text-sm">
            <tbody className="divide-y divide-line">
              {REAL.map(([what, status]) => (
                <tr key={what}>
                  <td className="px-4 py-2.5">{what}</td>
                  <td className={`px-4 py-2.5 ${status.startsWith("Mocked") || status.startsWith("Browser") ? "text-ink-3" : "text-accent"}`}>{status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">Evidence tiers</h2>
        <ul className="space-y-2 text-ink-2">
          <li><strong className="text-ink">Client-approved:</strong> a named client lead approved the line on a date; Bonarda Works signed it.</li>
          <li><strong className="text-ink">Manager-witnessed:</strong> the worker&rsquo;s account, read by a Bonarda manager on the date it was written.</li>
          <li><strong className="text-ink">Own account:</strong> dated and self-written, clearly labelled. The default for most contractors.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">Next steps</h2>
        <ul className="list-disc space-y-1.5 pl-5 text-ink-2">
          <li>Send checkpoint links on real extension and testimonial emails; parse plain-text replies.</li>
          <li>Read contract end dates from the client ops team&rsquo;s placement list.</li>
          <li>Consolidate long selections to about eight lines, each traceable to its entries.</li>
          <li>Deliver the opt-in monthly reminder; hold the signing key in a secrets manager.</li>
          <li>Store records and share links server-side so a shared link works on any device.</li>
          <li>Feed approved records to Sales for case studies in place of interviews long after roll-off.</li>
        </ul>
      </section>
    </div>
  );
}
