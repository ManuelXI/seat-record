import { describe, expect, it } from "vitest";
import { signRecord, verifyRecord } from "@/lib/sign";
import seed from "@/data/seed.json";
import type { SignedRecord } from "@/lib/types";

const base = {
  id: "rec-test", workerId: "w1", engagementId: "e1", checkpointId: "cp-test",
  approver: "Team lead", approvedAt: "2026-10-03",
  lines: [{ text: "Rebuilt an overnight risk batch", tier: "client-approved" as const }],
};

describe("signing", () => {
  it("verifies a freshly signed record", () => {
    expect(verifyRecord(signRecord(base))).toBe(true);
  });

  it("fails when a single word changes", () => {
    const r = signRecord(base);
    expect(verifyRecord({ ...r, lines: [{ ...r.lines[0], text: "Led an overnight risk batch" }] })).toBe(false);
  });

  it("fails when the approver changes", () => {
    const r = signRecord(base);
    expect(verifyRecord({ ...r, approver: "Someone else" })).toBe(false);
  });

  it("verifies every signed record in the seed data", () => {
    for (const r of (seed as { records: SignedRecord[] }).records) expect(verifyRecord(r)).toBe(true);
  });
});
