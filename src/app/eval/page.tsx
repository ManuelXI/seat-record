import { GROUNDING_SAMPLES, PROTECTED_C1, SCREEN_SAMPLES } from "@/data/eval-samples";
import modelResults from "@/data/eval-model.json";
import { screenText } from "@/lib/screen";
import { checkGrounding } from "@/lib/grounding";

type ModelRow = { flagged: boolean; terms: string[] };

function Cell({ ok, label }: { ok: boolean | null; label: string }) {
  const cls = ok === null ? "text-ink-3" : ok ? "text-accent" : "text-danger";
  return <span className={`font-mono text-xs ${cls}`}>{label}</span>;
}

export default function EvalPage() {
  const model = modelResults as Record<string, ModelRow>;
  const rows = SCREEN_SAMPLES.map((s) => {
    const hits = screenText(s.text, PROTECTED_C1);
    const ruleCaught = s.planted ? hits.some((h) => s.planted!.toLowerCase().includes(h.text.toLowerCase()) || h.text.toLowerCase().includes(s.planted!.toLowerCase())) : hits.length === 0;
    return { s, hits, ruleCaught, m: hits.length ? undefined : model[s.text] };
  });
  const planted = rows.filter((r) => r.s.planted);
  const ruleHits = planted.filter((r) => r.ruleCaught).length;
  const benignOk = rows.filter((r) => !r.s.planted && r.ruleCaught).length;
  const modelRan = Object.keys(model).length > 0;
  const bothCaught = planted.filter((r) => r.ruleCaught || r.m?.flagged).length;
  const grounding = GROUNDING_SAMPLES.map((g) => ({ g, r: checkGrounding(g.line, g.source) }));
  const groundingOk = grounding.filter(({ g, r }) => g.shouldFlag === !r.grounded).length;

  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <p className="eyebrow">Evaluation</p>
        <h1 className="text-3xl font-semibold">How well does the screen catch confidential detail?</h1>
        <p className="max-w-2xl text-ink-2">
          Small labelled set, all fictional. Rule results are computed live from the same code the product runs. The model column comes from <code className="font-mono text-sm">npm run eval</code>{modelRan ? "." : ", which has not been run on this build yet."}
        </p>
      </header>

      <dl className="grid gap-3 sm:grid-cols-3">
        {[
          [`${ruleHits} of ${planted.length}`, "planted terms caught by rules alone"],
          [modelRan ? `${bothCaught} of ${planted.length}` : "Not run", "caught by rules plus model"],
          [`${benignOk} of ${rows.length - planted.length}`, "benign entries passed untouched"],
        ].map(([n, l]) => (
          <div key={l} className="card p-4">
            <dt className="text-sm text-ink-3">{l}</dt>
            <dd className="font-display text-2xl font-semibold tabular-nums">{n}</dd>
          </div>
        ))}
      </dl>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Screen</h2>
        <div className="overflow-x-auto rounded-xl border border-line bg-surface-1">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-line bg-surface-2 text-left">
                {["Entry", "Planted", "Rules", "Model"].map((h) => <th key={h} className="px-4 py-2.5 font-mono text-[0.68rem] font-normal uppercase tracking-wider text-ink-3">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map(({ s, ruleCaught, hits, m }) => (
                <tr key={s.text}>
                  <td className="px-4 py-2.5">{s.text}</td>
                  <td className="px-4 py-2.5 text-ink-2">{s.kind}</td>
                  <td className="px-4 py-2.5">
                    {s.planted ? <Cell ok={ruleCaught} label={ruleCaught ? "Caught" : "Missed"} /> : <Cell ok={ruleCaught} label={ruleCaught ? "Passed" : `False positive: ${hits.map((h) => h.text).join(", ")}`} />}
                  </td>
                  <td className="px-4 py-2.5">
                    {hits.length ? <Cell ok={null} label="Not sent" /> : m ? <Cell ok={s.planted ? m.flagged : !m.flagged} label={m.flagged ? `Flagged ${m.terms.join(", ")}` : "No flag"} /> : <Cell ok={null} label="Not run" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-ink-3">Misses are listed, not hidden. Mixed-case domain terms and identifying descriptions are exactly what the model layer exists for.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Grounding check</h2>
        <p className="text-sm text-ink-2">{groundingOk} of {grounding.length} drafted lines handled correctly: claims not in the worker&rsquo;s own words are greyed out.</p>
        <div className="overflow-x-auto rounded-xl border border-line bg-surface-1">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-line bg-surface-2 text-left">
                {["Worker wrote", "Draft line", "Result"].map((h) => <th key={h} className="px-4 py-2.5 font-mono text-[0.68rem] font-normal uppercase tracking-wider text-ink-3">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {grounding.map(({ g, r }) => (
                <tr key={g.line}>
                  <td className="px-4 py-2.5 text-ink-2">{g.source}</td>
                  <td className="px-4 py-2.5">{g.line}</td>
                  <td className="px-4 py-2.5"><Cell ok={g.shouldFlag === !r.grounded} label={r.grounded ? "Kept" : `Greyed: ${r.unsupported.join(", ")}`} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
