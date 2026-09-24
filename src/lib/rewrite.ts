import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import cache from "@/data/model-cache.json";
import type { RewriteResult } from "./types";

export const RUNTIME_MODEL = "claude-opus-5";
export const BANDS = ["delivery", "reliability", "testing", "collaboration", "architecture", "practice", "mentoring"] as const;

const Schema = z.object({
  flags: z.array(z.object({ term: z.string(), reason: z.string(), suggestion: z.string() })),
  lines: z.array(z.object({ text: z.string(), band: z.enum(BANDS), source: z.string() })),
});

const SYSTEM = `You help people who work embedded inside client teams describe their work without breaching confidentiality.

You receive a short entry the worker wrote about their own work. A deterministic filter has already removed client names, system names, people, figures and identifiers. Your jobs:

1. Flag anything that remains which could still identify the client, a client system, a team, a person, a deal or a security posture. Typical examples are domain-specific metric names, internal jargon, or combinations of details that narrow the client down. For each flag give the exact term as it appears, a one-sentence reason a worker would understand, and a generic suggestion to replace it with.
2. Rewrite the entry as two to five first-person-free lines suitable for a CV, each describing a skill or practice at a level anyone could safely read. Start each line with a verb. Keep every fact the worker stated and add none: no numbers, outcomes, superlatives or scope they did not write. Give each line one band from the allowed list and quote the phrase from the worker's entry it came from.

Never judge, rate or compare the worker. If the entry is empty or not about work, return no flags and no lines.`;

export function cacheKey(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim().replace(/[.!?]+$/, "");
}

/** Very plain draft used only if the model is unavailable. Clearly labelled in the UI. */
function fallbackDraft(text: string): RewriteResult {
  const parts = text
    .split(/(?:[.;]|,?\s+and\s+)/i)
    .map((s) => s.trim())
    .filter((s) => s.length > 8);
  return {
    origin: "fallback",
    flags: [],
    lines: parts.map((p) => ({
      text: p.replace(/^i\s+/i, "").replace(/^\w/, (c) => c.toUpperCase()),
      band: "delivery",
      source: p,
    })),
  };
}

export async function rewrite(text: string, context: { clientType: string; stack: string[] }): Promise<RewriteResult> {
  const hit = (cache as Record<string, unknown>)[cacheKey(text)] as Omit<RewriteResult, "origin"> | undefined;
  if (hit) return { ...hit, origin: "cache" };

  if (!process.env.ANTHROPIC_API_KEY) return fallbackDraft(text);

  try {
    const client = new Anthropic({ timeout: 25_000, maxRetries: 1 });
    const response = await client.beta.messages.parse({
      model: RUNTIME_MODEL,
      max_tokens: 4000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low", format: betaZodOutputFormat(Schema) },
      system: SYSTEM,
      messages: [
        {
          role: "user",
          content: `Client type: ${context.clientType}\nStack: ${context.stack.join(", ")}\n\nWorker's entry:\n${text}`,
        },
      ],
    });
    if (response.stop_reason === "refusal" || !response.parsed_output) return fallbackDraft(text);
    return { ...response.parsed_output, origin: "live" };
  } catch (err) {
    console.error("rewrite failed, using fallback", err);
    return fallbackDraft(text);
  }
}
