/**
 * Runs the model layer over screen samples the deterministic rules miss, and records
 * whether the model flags the planted term. Needs ANTHROPIC_API_KEY. Writes src/data/eval-model.json.
 * Run: npm run eval
 */
import { writeFileSync } from "node:fs";
import { SCREEN_SAMPLES, PROTECTED_C1 } from "../src/data/eval-samples";
import { screenText } from "../src/lib/screen";
import { rewrite } from "../src/lib/rewrite";

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) throw new Error("Set ANTHROPIC_API_KEY to run the model evaluation.");
  const out: Record<string, { flagged: boolean; terms: string[]; origin: string }> = {};
  for (const s of SCREEN_SAMPLES) {
    if (screenText(s.text, PROTECTED_C1).length > 0) continue; // rules caught it; the model never sees it
    const r = await rewrite(s.text, { clientType: "Global investment bank", stack: ["Java", "Kafka"] });
    const terms = r.flags.map((f) => f.term);
    const flagged = s.planted ? terms.some((t) => s.planted!.toLowerCase().includes(t.toLowerCase()) || t.toLowerCase().includes(s.planted!.toLowerCase())) : terms.length > 0;
    out[s.text] = { flagged, terms, origin: r.origin };
    console.log(`${flagged ? "flag" : "pass"}  ${s.text}  [${terms.join(", ")}] (${r.origin})`);
  }
  writeFileSync(new URL("../src/data/eval-model.json", import.meta.url), JSON.stringify(out, null, 2));
}
main();
