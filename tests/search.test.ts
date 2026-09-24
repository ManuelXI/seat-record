import { describe, expect, it } from "vitest";
import seed from "@/data/seed.json";
import cache from "@/data/search-cache.json";
import { keywordMatches, searchEvidence, splitRequirements } from "@/lib/search";
import type { SignedRecord } from "@/lib/types";

const records = (seed as { records: SignedRecord[] }).records;
const lines = records.flatMap((r) => r.lines.map((l, i) => ({ id: `${r.id}#${i}`, text: l.text })));

describe("evidence search", () => {
  it("every cached match points at a real seed line", () => {
    const ids = new Set(lines.map((l) => l.id));
    for (const [k, v] of Object.entries(cache)) {
      if (k.startsWith("_")) continue;
      for (const m of (v as { matches: { line_id: string }[] }).matches) expect(ids.has(m.line_id)).toBe(true);
    }
  });

  it("finds Efua's Kafka failure handling for the demo request", async () => {
    const r = await searchEvidence("Java developer who has handled Kafka failures and run incident reviews", lines);
    expect(r.origin).toBe("cache");
    expect(r.matches.some((m) => m.requirement === 1 && m.lineId === "rec-cp1#1")).toBe(true);
  });

  it("finds a newly approved incident-review line by keywords", async () => {
    const withNew = [...lines, { id: "rec-new#0", text: "Ran the team's incident review for a failed overnight run and wrote the follow-up actions" }];
    const r = await searchEvidence("Java developer who has handled Kafka failures and run incident reviews", withNew);
    expect(r.matches.some((m) => m.requirement === 2 && m.lineId === "rec-new#0" && m.via === "keywords")).toBe(true);
  });

  it("ignores matches that point at lines that do not exist", async () => {
    const r = await searchEvidence("Java developer who has handled Kafka failures and run incident reviews", lines.filter((l) => l.id !== "rec-cp1#1"));
    expect(r.matches.some((m) => m.lineId === "rec-cp1#1")).toBe(false);
  });

  it("splits a request without a model", () => {
    expect(splitRequirements("We need someone with Kotlin, PostgreSQL and release checklists")).toEqual(["Kotlin", "PostgreSQL", "release checklists"]);
  });

  it("does not match on a generic term alone", () => {
    const m = keywordMatches(["Building Python APIs"], lines);
    expect(m.map((x) => x.lineId)).not.toContain("rec-cpp0#0");
  });

  it("matches on a shared technology name", () => {
    const m = keywordMatches(["Kotlin"], lines);
    expect(m.map((x) => x.lineId)).toContain("rec-cp2#0");
  });
});
