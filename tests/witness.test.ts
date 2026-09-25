import { describe, expect, it } from "vitest";
import { answerWitness, askWitness, canAskWitness, cancelWitness, witnessRequests } from "@/lib/witness";
import { lineTier } from "@/lib/store";
import type { Entry } from "@/lib/types";

const entry = (over: Partial<Entry> = {}): Entry => ({
  id: "en1",
  engagementId: "eng1",
  date: "2026-05-12",
  lines: [{ id: "l1", text: "Moved a dashboard onto a shared library", band: "delivery", source: "", status: "approved-by-worker", tier: "engineer-account" }],
  ...over,
});

describe("manager-witnessed entries", () => {
  it("a worker can ask about an unshared entry once", () => {
    const [asked] = askWitness([entry()], "en1", "Ama Boateng", "2026-09-26");
    expect(asked.witness).toEqual({ manager: "Ama Boateng", askedOn: "2026-09-26", status: "asked" });
    expect(canAskWitness(asked)).toBe(false);
  });

  it("cannot ask about an entry the manager already saw, or one with nothing left unshared", () => {
    expect(canAskWitness(entry({ managerSaw: true }))).toBe(false);
    expect(canAskWitness(entry({ lines: [{ ...entry().lines[0], status: "client-approved", tier: "client-approved" }] }))).toBe(false);
  });

  it("the manager sees only entries the worker asked about, addressed to them", () => {
    const entries = [...askWitness([entry()], "en1", "Ama Boateng", "2026-09-26"), entry({ id: "en2" })];
    expect(witnessRequests(entries, "eng1", "Ama Boateng").map((e) => e.id)).toEqual(["en1"]);
    expect(witnessRequests(entries, "eng1", "Yaw Darko")).toEqual([]);
  });

  it("confirming makes the lines manager-witnessed", () => {
    const [confirmed] = answerWitness(askWitness([entry()], "en1", "Ama Boateng", "2026-09-26"), "en1", true, "2026-09-27");
    expect(confirmed.managerSaw).toBe(true);
    expect(confirmed.witness?.status).toBe("confirmed");
    expect(lineTier(confirmed, confirmed.lines[0])).toBe("manager-witnessed");
  });

  it("declining leaves the entry as the worker's own account", () => {
    const [declined] = answerWitness(askWitness([entry()], "en1", "Ama Boateng", "2026-09-26"), "en1", false, "2026-09-27");
    expect(declined.managerSaw).toBeFalsy();
    expect(declined.witness?.status).toBe("declined");
    expect(lineTier(declined, declined.lines[0])).toBe("engineer-account");
  });

  it("a worker can withdraw a request before it is answered", () => {
    const [back] = cancelWitness(askWitness([entry()], "en1", "Ama Boateng", "2026-09-26"), "en1");
    expect(back.witness).toBeUndefined();
    expect(canAskWitness(back)).toBe(true);
  });
});
