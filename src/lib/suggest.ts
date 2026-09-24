import type { ScreenHit } from "./screen";

/**
 * Fixed, deterministic replacements for screen hits. Deliberately not the model:
 * nothing leaves the browser until the screen is clear.
 */
export interface Suggestion {
  label: string;
  start: number;
  end: number;
  text: string;
}

type Pair = { nouns: string[]; modifiers: string[] };

const STOP = new Set(["and", "or", "but", "so", "to", "on", "in", "for", "with", "from", "onto", "off", "at", "of", "the", "a", "an", "is", "was", "into", "by", "as", "that", "which", "when", "while", "before", "after"]);

function table(hit: ScreenHit): Pair {
  const t = hit.text;
  switch (hit.kind) {
    case "protected-term":
      return { nouns: ["an upstream system", "an internal platform", "a client product"], modifiers: ["upstream", "internal", "client"] };
    case "name":
      return t.endsWith("'s")
        ? { nouns: ["a colleague's", "a teammate's"], modifiers: ["a colleague's", "a teammate's"] }
        : { nouns: ["a colleague", "a teammate"], modifiers: ["a colleague's", "a teammate's"] };
    case "acronym":
      return { nouns: ["an internal system", "a reconciliation job"], modifiers: ["internal", "reconciliation"] };
    case "identifier":
      if (t.includes("@")) return { nouns: ["a shared mailbox"], modifiers: ["shared"] };
      if (/^https?:/i.test(t)) return { nouns: ["an internal link"], modifiers: ["internal"] };
      if (/^[A-Z][A-Z0-9]+-\d+$/.test(t)) return { nouns: ["a production bug", "a long-standing ticket"], modifiers: ["production", "long-standing"] };
      return { nouns: ["an internal service", "the internal API"], modifiers: ["internal", "shared"] };
    case "figure":
      if (/[£$€¥]|GHS|GH₵|USD|EUR|GBP|\b(k|m|bn|million|billion)\b/i.test(t)) return { nouns: ["a significant amount", "a large sum"], modifiers: ["large", "significant"] };
      if (/%/.test(t)) return { nouns: ["a large share", "a noticeable margin"], modifiers: ["a large share of", "most"] };
      return { nouns: ["a large volume", "hundreds"], modifiers: ["several hundred", "hundreds of"] };
  }
}

export function suggestionsFor(hit: ScreenHit, text: string): Suggestion[] {
  const after = text.slice(hit.end);
  const next = after.match(/^\s+([A-Za-z][\w-]*)/)?.[1];
  const isModifier = !!next && next === next.toLowerCase() && !STOP.has(next);

  const before = text.slice(0, hit.start);
  const art = before.match(/(^|\s)(the|a|an)\s+$/i);
  const artStart = art ? hit.start - art[0].length + art[1].length : hit.start;
  const artWord = art?.[2];
  const capitalise = (s: string, at: number) => (at === 0 || /[.!?]\s*$/.test(text.slice(0, at)) ? s.charAt(0).toUpperCase() + s.slice(1) : s);

  const { nouns, modifiers } = table(hit);
  const out: Suggestion[] = [];

  for (const s of isModifier ? modifiers : nouns) {
    const hasArticle = /^(the|a|an)\s/i.test(s);
    if (artWord && hasArticle) {
      // "fixed the RISK-2041" -> "fixed a production bug": replace the old article too.
      out.push({ label: s, start: artStart, end: hit.end, text: capitalise(s, artStart) });
    } else if (artWord && !hasArticle && /^an?$/i.test(artWord)) {
      // Keep "a"/"an" agreeing with the new word: "a £2m" -> "a large", "a PNLX" -> "an internal".
      const fixed = (/^[aeiou]/i.test(s) ? "an" : "a") + " " + s;
      out.push({ label: s, start: artStart, end: hit.end, text: capitalise(fixed, artStart) });
    } else {
      out.push({ label: s, start: hit.start, end: hit.end, text: capitalise(s, hit.start) });
    }
  }

  // Remove: drop the term, plus a dangling article, and tidy the spaces.
  const rmStart = artWord && isModifier ? hit.start : artStart;
  out.push({ label: "Remove", start: rmStart, end: hit.end, text: "" });
  return out;
}

export function applySuggestion(text: string, s: Suggestion): string {
  const joined = text.slice(0, s.start) + s.text + text.slice(s.end);
  return joined.replace(/ {2,}/g, " ").replace(/\s+([,.;:!?])/g, "$1").replace(/^\s+/, "");
}
