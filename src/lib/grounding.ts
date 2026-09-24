import { CLAIM_WORDS, NUMBER_WORDS } from "./vocab";

export interface GroundingResult {
  grounded: boolean;
  unsupported: string[];
}

const claim = new Set(CLAIM_WORDS);
const numberWord = new Set(NUMBER_WORDS);

function words(s: string): string[] {
  return s.toLowerCase().match(/[a-z0-9][a-z0-9'%-]*/g) ?? [];
}

/**
 * Deterministic check: any number, number word or outcome claim in a drafted line
 * must also appear in the worker's own (screened) entry. Otherwise the line is greyed.
 */
export function checkGrounding(line: string, source: string): GroundingResult {
  const src = new Set(words(source));
  const unsupported: string[] = [];
  for (const w of words(line)) {
    const isNumber = /\d/.test(w) || numberWord.has(w);
    if ((isNumber || claim.has(w)) && !src.has(w) && !unsupported.includes(w)) unsupported.push(w);
  }
  return { grounded: unsupported.length === 0, unsupported };
}
