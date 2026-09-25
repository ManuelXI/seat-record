import type { Entry } from "./types";

/**
 * Manager-witnessed entries. The worker picks one entry and asks their engagement owner to confirm
 * they saw it in a 1-on-1; only that entry is shown to the manager, who confirms or declines.
 * Confirming makes the entry manager-witnessed. A declined entry stays the worker's own account.
 */

/** An entry can be put to the manager once, while it still has lines the client has not seen. */
export function canAskWitness(entry: Entry): boolean {
  return !entry.managerSaw && !entry.witness && entry.lines.some((l) => l.status === "approved-by-worker");
}

export function askWitness(entries: Entry[], entryId: string, manager: string, today: string): Entry[] {
  return entries.map((e) => (e.id === entryId && canAskWitness(e) ? { ...e, witness: { manager, askedOn: today, status: "asked" } } : e));
}

export function cancelWitness(entries: Entry[], entryId: string): Entry[] {
  return entries.map((e) => (e.id === entryId && e.witness?.status === "asked" ? { ...e, witness: undefined } : e));
}

export function answerWitness(entries: Entry[], entryId: string, saw: boolean, today: string): Entry[] {
  return entries.map((e) =>
    e.id === entryId && e.witness?.status === "asked"
      ? { ...e, managerSaw: saw || e.managerSaw, witness: { ...e.witness, status: saw ? "confirmed" : "declined", answeredOn: today } }
      : e,
  );
}

/** The entries a manager has been asked to confirm for one engagement: the only log entries they ever see. */
export function witnessRequests(entries: Entry[], engagementId: string, manager: string): Entry[] {
  return entries.filter((e) => e.engagementId === engagementId && e.witness?.status === "asked" && e.witness.manager === manager);
}
