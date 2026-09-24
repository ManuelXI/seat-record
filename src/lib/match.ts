import { TECH_TERMS } from "./vocab";

/** Pull known technology terms out of a free-text client request. Deterministic; no ranking of people. */
export function extractStack(request: string): string[] {
  const found: string[] = [];
  const lower = request.toLowerCase();
  for (const term of [...TECH_TERMS].sort((a, b) => b.length - a.length)) {
    const t = term.toLowerCase();
    const re = new RegExp(`(^|[^a-z0-9])${t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z0-9]|$)`);
    if (re.test(lower) && !found.some((f) => f.toLowerCase().includes(t))) found.push(term);
  }
  return found;
}
