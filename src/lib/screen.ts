import { COMMON_CAPITALISED, TECH_TERMS } from "./vocab";

export type ScreenKind = "protected-term" | "name" | "acronym" | "figure" | "identifier";

export interface ScreenHit {
  start: number;
  end: number;
  text: string;
  kind: ScreenKind;
  reason: string;
}

const REASONS: Record<ScreenKind, string> = {
  "protected-term": "Protected term on this client's list",
  name: "Looks like a person, system or product name",
  acronym: "Unknown acronym, may identify a client system",
  figure: "Figure or amount that may be client data",
  identifier: "Ticket, host, email or system identifier",
};

const techLower = new Set(TECH_TERMS.flatMap((t) => [t.toLowerCase(), ...t.toLowerCase().split(/\s+/)]));
const commonCap = new Set(COMMON_CAPITALISED);

function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Deterministic first layer. Runs in the browser before anything is sent.
 * Every hit must be replaced by the worker; nothing here is a suggestion.
 */
export function screenText(text: string, protectedTerms: string[]): ScreenHit[] {
  const hits: ScreenHit[] = [];
  const add = (start: number, end: number, kind: ScreenKind) => {
    if (hits.some((h) => start < h.end && end > h.start)) return; // first rule wins on overlap
    hits.push({ start, end, text: text.slice(start, end), kind, reason: REASONS[kind] });
  };

  // 1. Protected terms, case-insensitive, whole words. Longest first.
  for (const term of [...protectedTerms].sort((a, b) => b.length - a.length)) {
    const re = new RegExp(`(?<![\\w])${escapeRe(term)}(?![\\w])`, "gi");
    for (const m of text.matchAll(re)) add(m.index!, m.index! + m[0].length, "protected-term");
  }

  // 2. Identifiers: emails, URLs, hostnames, ticket IDs like RISK-1234.
  const idPatterns = [
    /[\w.+-]+@[\w-]+\.[\w.-]+/g,
    /\bhttps?:\/\/\S+/g,
    /\b[\w-]+\.(?:internal|corp|local|net|com|io)\b/gi,
    /\b[A-Z][A-Z0-9]{1,9}-\d+\b/g,
  ];
  for (const re of idPatterns) for (const m of text.matchAll(re)) add(m.index!, m.index! + m[0].length, "identifier");

  // 3. Figures: money, percentages, and numbers of three or more digits.
  const figurePatterns = [
    /(?:[£$€¥]|GHS|GH₵|USD|EUR|GBP)\s?\d[\d,.]*\s?(?:k|m|bn|million|billion)?/gi,
    /\b\d[\d,.]*\s?(?:k|m|bn)\b/gi,
    /\b\d+(?:\.\d+)?\s?%/g,
    /\b\d{3,}(?:[,.]\d+)*\b/g,
  ];
  for (const re of figurePatterns) for (const m of text.matchAll(re)) add(m.index!, m.index! + m[0].trimEnd().length, "figure");

  // 4. Acronyms: all-caps tokens of 2-6 letters not on the tech allowlist.
  for (const m of text.matchAll(/\b[A-Z]{2,6}s?\b/g)) {
    if (!techLower.has(m[0].toLowerCase()) && !commonCap.has(m[0])) add(m.index!, m.index! + m[0].length, "acronym");
  }

  // 5. Names: Titlecase words not at sentence start, not tech, not common.
  // Mixed-case domain terms (e.g. "VaR") are left to the model layer, which can explain them.
  for (const m of text.matchAll(/\b[A-Z][a-z]+(?:'s)?\b/g)) {
    const i = m.index!;
    const before = text.slice(0, i).trimEnd();
    const sentenceStart = before.length === 0 || /[.!?:\n]$/.test(before);
    if (sentenceStart) continue;
    if (techLower.has(m[0].toLowerCase()) || commonCap.has(m[0])) continue;
    add(i, i + m[0].length, "name");
  }

  return hits.sort((a, b) => a.start - b.start);
}
