"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import seed from "@/data/seed.json";
import { DEMO_TODAY, ROLL_OFF_WINDOW_WORKING_DAYS, workingDaysBetween } from "./dates";
import type { AppState, Checkpoint, CheckpointReason, Entry, Line, SignedRecord, Tier } from "./types";
import type { Session } from "./people";
import { answerWitness, askWitness, cancelWitness } from "./witness";

const KEY = "seat-record-state-v1";
const SESSION_KEY = "seat-record-session-v1";
const initial = seed as AppState;

/**
 * Saved demo data can predate newer seed fields. Fill in anything the saved copy lacks
 * (for example share links added later) without touching what the user changed.
 */
function migrate(saved: AppState): AppState {
  const seedWorkers = new Map(initial.workers.map((w) => [w.id, w]));
  const addMissing = <T extends { id: string }>(have: T[], seed: T[]) => {
    const ids = new Set(have.map((x) => x.id));
    return [...have, ...seed.filter((x) => !ids.has(x.id))];
  };
  return {
    ...saved,
    workers: saved.workers.map((w) => ("share" in w ? w : seedWorkers.get(w.id)?.share ? { ...w, share: seedWorkers.get(w.id)!.share } : w)),
    engagements: addMissing(saved.engagements, initial.engagements),
    entries: addMissing(saved.entries, initial.entries),
    checkpoints: addMissing(saved.checkpoints, initial.checkpoints),
    records: addMissing(saved.records, initial.records),
  };
}

let counter = 0;
const uid = (p: string) => `${p}-${Date.now().toString(36)}-${(counter++).toString(36)}`;

export interface ClientDecision {
  lineId: string;
  action: "approve" | "edit" | "decline";
  text?: string;
}

interface Store {
  state: AppState;
  ready: boolean;
  session: Session | null;
  signIn: (s: Session) => void;
  signOut: () => void;
  addEntry: (engagementId: string, lines: Pick<Line, "text" | "band" | "source">[]) => void;
  setReminder: (workerId: string, on: boolean) => void;
  setShare: (workerId: string, on: boolean, newToken?: boolean) => void;
  openCheckpoint: (engagementId: string, openedBy: Checkpoint["openedBy"], reason: CheckpointReason, note?: string) => Checkpoint;
  sendCheckpoint: (checkpointId: string, lineIds: string[]) => void;
  completeClientReview: (checkpointId: string, approver: string, decisions: ClientDecision[], testimonial?: string) => Promise<SignedRecord>;
  askWitness: (entryId: string, manager: string) => void;
  cancelWitness: (entryId: string) => void;
  answerWitness: (entryId: string, saw: boolean) => void;
  reset: () => void;
}

const Ctx = createContext<Store | null>(null);
const noopSubscribe = () => () => {};

export function StoreProvider({ children }: { children: React.ReactNode }) {
  // Saved state is read once on the client. Pages render a loading state until hydration
  // finishes, so server and client markup always match.
  const [state, setState] = useState<AppState>(() => {
    if (typeof window === "undefined") return initial;
    try {
      const saved = localStorage.getItem(KEY);
      return saved ? migrate(JSON.parse(saved) as AppState) : initial;
    } catch {
      return initial;
    }
  });
  const ready = useSyncExternalStore(noopSubscribe, () => true, () => false);

  const [session, setSession] = useState<Session | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      return saved ? (JSON.parse(saved) as Session) : null;
    } catch {
      return null;
    }
  });
  const signIn = useCallback((s: Session) => {
    setSession(s);
    try { localStorage.setItem(SESSION_KEY, JSON.stringify(s)); } catch {}
  }, []);
  const signOut = useCallback(() => {
    setSession(null);
    try { localStorage.removeItem(SESSION_KEY); } catch {}
  }, []);

  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
  }, [state, ready]);

  const addEntry = useCallback<Store["addEntry"]>((engagementId, lines) => {
    const entry: Entry = {
      id: uid("en"),
      engagementId,
      date: DEMO_TODAY,
      lines: lines.map((l) => ({ ...l, id: uid("l"), status: "approved-by-worker", tier: "engineer-account" as Tier })),
    };
    setState((s) => ({ ...s, entries: [...s.entries, entry] }));
  }, []);

  const setReminder = useCallback<Store["setReminder"]>((workerId, on) => {
    setState((s) => ({ ...s, workers: s.workers.map((w) => (w.id === workerId ? { ...w, reminderOn: on } : w)) }));
  }, []);

  const setShare = useCallback<Store["setShare"]>((workerId, on, newToken) => {
    const token = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID().replace(/-/g, "").slice(0, 10) : uid("s"));
    setState((s) => ({
      ...s,
      workers: s.workers.map((w) => (w.id === workerId ? { ...w, share: { on, token: newToken || !w.share ? token() : w.share.token } } : w)),
    }));
  }, []);

  const openCheckpoint = useCallback<Store["openCheckpoint"]>((engagementId, openedBy, reason, note) => {
    const existing = state.checkpoints.find((c) => c.engagementId === engagementId && c.status !== "approved");
    if (existing) return existing;
    const last = state.checkpoints
      .filter((c) => c.engagementId === engagementId && c.status === "approved")
      .sort((a, b) => (a.periodTo < b.periodTo ? 1 : -1))[0];
    const eng = state.engagements.find((e) => e.id === engagementId)!;
    const cp: Checkpoint = {
      id: uid("cp"), engagementId, reason, openedBy, note,
      periodFrom: last ? last.periodTo : eng.start, periodTo: DEMO_TODAY,
      status: "open", lineIds: [],
    };
    setState((s) => ({ ...s, checkpoints: [...s.checkpoints, cp] }));
    return cp;
  }, [state.checkpoints, state.engagements]);

  const sendCheckpoint = useCallback<Store["sendCheckpoint"]>((checkpointId, lineIds) => {
    setState((s) => ({
      ...s,
      checkpoints: s.checkpoints.map((c) => (c.id === checkpointId ? { ...c, status: "sent", lineIds } : c)),
      entries: s.entries.map((e) => ({
        ...e,
        lines: e.lines.map((l) => (lineIds.includes(l.id) ? { ...l, status: "sent", checkpointId } : l)),
      })),
    }));
  }, []);

  const completeClientReview = useCallback<Store["completeClientReview"]>(async (checkpointId, approver, decisions, testimonial) => {
    const cp = state.checkpoints.find((c) => c.id === checkpointId)!;
    const eng = state.engagements.find((e) => e.id === cp.engagementId)!;
    const byId = new Map(state.entries.flatMap((e) => e.lines).map((l) => [l.id, l]));
    const approved = decisions
      .filter((d) => d.action !== "decline")
      .map((d) => ({ id: d.lineId, text: d.action === "edit" && d.text ? d.text : byId.get(d.lineId)!.text }));
    const declined = new Set(decisions.filter((d) => d.action === "decline").map((d) => d.lineId));
    const testimonialLine = testimonial?.trim()
      ? { id: uid("l"), text: testimonial.trim(), band: "collaboration", status: "client-approved" as const, tier: "client-approved" as Tier, checkpointId, clientWritten: true }
      : null;

    const approvedAt = DEMO_TODAY;
    const res = await fetch("/api/sign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: `rec-${checkpointId}`, workerId: eng.workerId, engagementId: eng.id, checkpointId, approver, approvedAt,
        lines: [
          ...approved.map((a) => ({ text: a.text, tier: "client-approved" })),
          ...(testimonialLine ? [{ text: testimonialLine.text, tier: "client-approved", clientWritten: true }] : []),
        ],
      }),
    });
    const record = (await res.json()) as SignedRecord;
    const approvedMap = new Map(approved.map((a) => [a.id, a.text]));

    setState((s) => ({
      ...s,
      records: [...s.records, record],
      checkpoints: s.checkpoints.map((c) =>
        c.id === checkpointId
          ? { ...c, status: "approved", approver, approvedAt, signedRecordId: record.id, lineIds: [...approvedMap.keys(), ...(testimonialLine ? [testimonialLine.id] : [])] }
          : c,
      ),
      entries: s.entries
        .map((e) => {
          let lines = e.lines
            .filter((l) => !declined.has(l.id))
            .map((l) => (approvedMap.has(l.id) ? { ...l, text: approvedMap.get(l.id)!, status: "client-approved" as const, tier: "client-approved" as Tier } : l));
          // Testimonial attaches to the most recent entry of this engagement.
          if (testimonialLine && e.engagementId === eng.id && e === s.entries.filter((x) => x.engagementId === eng.id).at(-1)) {
            lines = [...lines, testimonialLine];
          }
          return { ...e, lines };
        })
        .filter((e) => e.lines.length > 0),
    }));
    return record;
  }, [state.checkpoints, state.engagements, state.entries]);

  const askWitnessAction = useCallback<Store["askWitness"]>((entryId, manager) => {
    setState((s) => ({ ...s, entries: askWitness(s.entries, entryId, manager, DEMO_TODAY) }));
  }, []);
  const cancelWitnessAction = useCallback<Store["cancelWitness"]>((entryId) => {
    setState((s) => ({ ...s, entries: cancelWitness(s.entries, entryId) }));
  }, []);
  const answerWitnessAction = useCallback<Store["answerWitness"]>((entryId, saw) => {
    setState((s) => ({ ...s, entries: answerWitness(s.entries, entryId, saw, DEMO_TODAY) }));
  }, []);

  const reset = useCallback(() => {
    try { localStorage.removeItem(KEY); } catch {}
    setState(initial);
  }, []);

  const value = useMemo(
    () => ({
      state, ready, session, signIn, signOut, addEntry, setReminder, setShare, openCheckpoint, sendCheckpoint, completeClientReview,
      askWitness: askWitnessAction, cancelWitness: cancelWitnessAction, answerWitness: answerWitnessAction, reset,
    }),
    [state, ready, session, signIn, signOut, addEntry, setReminder, setShare, openCheckpoint, sendCheckpoint, completeClientReview,
      askWitnessAction, cancelWitnessAction, answerWitnessAction, reset],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore outside StoreProvider");
  return s;
}

/* ---------- selectors ---------- */

export function engagementsFor(state: AppState, workerId: string) {
  return state.engagements.filter((e) => e.workerId === workerId).sort((a, b) => (a.start < b.start ? 1 : -1));
}

export function entriesFor(state: AppState, engagementId: string) {
  return state.entries.filter((e) => e.engagementId === engagementId).sort((a, b) => (a.date < b.date ? -1 : 1));
}

export function unapprovedLines(state: AppState, engagementId: string): Line[] {
  return entriesFor(state, engagementId).flatMap((e) =>
    e.lines.filter((l) => l.status === "approved-by-worker").map((l) => (e.managerSaw ? { ...l, tier: "manager-witnessed" as Tier } : l)),
  );
}

export function lineTier(entry: Entry, line: Line): Tier {
  if (line.tier === "client-approved") return "client-approved";
  if (entry.managerSaw) return "manager-witnessed";
  return "engineer-account";
}

export function rollOffStatus(end: string) {
  const days = workingDaysBetween(DEMO_TODAY, end);
  const ended = end <= DEMO_TODAY;
  return { days, ended, windowOpen: !ended && days <= ROLL_OFF_WINDOW_WORKING_DAYS };
}
