import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import cache from "@/data/search-cache.json";
import { TECH_TERMS } from "./vocab";

/**
 * Evidence search: turn a client request into requirements and find client-approved lines
 * that support each one. It never scores or ranks people; it only points at lines that exist.
 */
export interface EvidenceLine { id: string; text: string }
export interface EvidenceMatch { requirement: number; lineId: string; reason: string; via: "model" | "keywords" }
export interface SearchResult { requirements: string[]; matches: EvidenceMatch[]; origin: "cache" | "live" | "keywords" }

const RUNTIME_MODEL = "claude-opus-5";

const STOP = new Set([
  "a", "an", "the", "and", "or", "of", "in", "on", "for", "to", "with", "who", "that", "has", "have", "had", "is", "are", "was", "be",
  "we", "i", "our", "us", "need", "needs", "want", "looking", "someone", "somebody", "person", "people", "developer", "developers",
  "dev", "devs", "engineer", "engineers", "experience", "experienced", "worked", "work", "working", "done", "doing", "built", "build",
  "building", "used", "using", "product", "team", "some", "any", "also", "plus", "well", "can", "able", "strong", "good", "their", "they",
]);

// Generic terms are too broad to count as a technology match on their own.
const GENERIC_TECH = new Set(["api", "apis", "ui", "ux", "qa", "ci", "cd", "http", "https", "json", "xml", "rest"]);
const techLower = new Set(TECH_TERMS.map((t) => t.toLowerCase()).filter((t) => !GENERIC_TECH.has(t)));

function stem(w: string): string {
  if (w.length > 5 && w.endsWith("ing")) return w.slice(0, -3);
  if (w.length > 4 && w.endsWith("ed")) return w.slice(0, -2);
  if (w.length > 4 && w.endsWith("es")) return w.slice(0, -2);
  if (w.length > 3 && w.endsWith("s") && !w.endsWith("ss")) return w.slice(0, -1);
  return w;
}

function tokens(s: string): string[] {
  return (s.toLowerCase().match(/[a-z0-9][a-z0-9.+#-]*/g) ?? []).filter((w) => !STOP.has(w)).map(stem);
}

export function normaliseRequest(s: string): string {
  return s.toLowerCase().replace(/[“”"']/g, "").replace(/\s+/g, " ").trim().replace(/[.!?]+$/, "");
}

/** Plain split used when no model is available: commas, "and", semicolons, with filler stripped. */
export function splitRequirements(request: string): string[] {
  const filler = /^(?:we (?:need|want)|looking for|someone|a dev(?:eloper)?|an? engineer|developer|who|that|has|have|had|with|experience (?:in|with)|worked on|done|implemented|:)\s+/i;
  return request
    .split(/,|;|\band\b|\bplus\b|\bas well as\b/i)
    .map((p) => {
      let t = p.trim();
      for (let i = 0; i < 4; i++) t = t.replace(filler, "");
      return t.replace(/[.!?]+$/, "").trim();
    })
    .filter((p) => tokens(p).length > 0)
    .slice(0, 5);
}

/** Deterministic matcher: a shared technology name, or at least two shared content words. */
export function keywordMatches(requirements: string[], lines: EvidenceLine[]): EvidenceMatch[] {
  const out: EvidenceMatch[] = [];
  requirements.forEach((req, ri) => {
    const rt = new Set(tokens(req));
    for (const line of lines) {
      const lt = new Set(tokens(line.text));
      const shared = [...rt].filter((w) => lt.has(w));
      const tech = shared.filter((w) => techLower.has(w));
      if (tech.length > 0 || shared.length >= 2) {
        out.push({ requirement: ri, lineId: line.id, reason: `Shares ${shared.slice(0, 3).map((w) => `“${w}”`).join(", ")}.`, via: "keywords" });
      }
    }
  });
  return out;
}

const Schema = z.object({
  requirements: z.array(z.string()),
  matches: z.array(z.object({ requirement: z.number().int(), line_id: z.string(), reason: z.string() })),
});

const SYSTEM = `You help a staffing manager find evidence for a client request. You receive the request and a numbered list of work lines, each already approved by a client.

1. Break the request into two to five short, concrete requirements (skills, practices or kinds of system). Keep the client's meaning; do not add requirements.
2. For each requirement, list the ids of lines whose text directly supports it, with a one-sentence reason a manager would accept. Only use ids from the list. If nothing supports a requirement, list nothing for it.

Never judge, score, rank or compare people. You are matching statements to requirements, nothing else.`;

async function modelSearch(request: string, lines: EvidenceLine[]): Promise<Omit<SearchResult, "origin"> | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  try {
    const client = new Anthropic({ timeout: 25_000, maxRetries: 1 });
    const response = await client.beta.messages.parse({
      model: RUNTIME_MODEL,
      max_tokens: 4000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low", format: betaZodOutputFormat(Schema) },
      system: SYSTEM,
      messages: [{ role: "user", content: `Request: ${request}\n\nApproved lines:\n${lines.map((l) => `${l.id}: ${l.text}`).join("\n")}` }],
    });
    if (response.stop_reason === "refusal" || !response.parsed_output) return null;
    const p = response.parsed_output;
    return { requirements: p.requirements, matches: p.matches.map((m) => ({ requirement: m.requirement, lineId: m.line_id, reason: m.reason, via: "model" as const })) };
  } catch (err) {
    console.error("search model call failed, using keywords", err);
    return null;
  }
}

export async function searchEvidence(request: string, lines: EvidenceLine[]): Promise<SearchResult> {
  const cached = (cache as Record<string, unknown>)[normaliseRequest(request)] as
    | { requirements: string[]; matches: { requirement: number; line_id: string; reason: string }[] }
    | undefined;

  let base: Omit<SearchResult, "origin"> | null = cached
    ? { requirements: cached.requirements, matches: cached.matches.map((m) => ({ requirement: m.requirement, lineId: m.line_id, reason: m.reason, via: "model" as const })) }
    : null;
  let origin: SearchResult["origin"] = cached ? "cache" : "keywords";
  if (!base) {
    base = await modelSearch(request, lines);
    if (base) origin = "live";
  }
  const requirements = base?.requirements.length ? base.requirements : splitRequirements(request);

  // Only keep matches that point at a real line and a real requirement, then add keyword matches
  // so lines approved after the cache was written are still found.
  const ids = new Set(lines.map((l) => l.id));
  const valid = (base?.matches ?? []).filter((m) => ids.has(m.lineId) && m.requirement >= 0 && m.requirement < requirements.length);
  const seen = new Set(valid.map((m) => `${m.requirement}|${m.lineId}`));
  const extra = keywordMatches(requirements, lines).filter((m) => !seen.has(`${m.requirement}|${m.lineId}`));
  return { requirements, matches: [...valid, ...extra], origin };
}
