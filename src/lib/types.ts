// Shared data contract. Both halves of the build depend on these shapes.

export type WorkerType = "employee" | "contractor" | "freelancer";

/** Evidence tier for a line, strongest first. */
export type Tier = "client-approved" | "manager-witnessed" | "engineer-account";

export interface Worker {
  id: string;
  name: string;
  title: string;
  type: WorkerType;
  location: string;
  about: string;
  skills: string[];
  availableFrom: string; // ISO date
  reminderOn: boolean;
}

export interface Engagement {
  id: string;
  workerId: string;
  clientId: string;
  clientLabel: string; // generic, safe to show on a profile
  role: string;
  stack: string[];
  start: string; // ISO date
  end: string; // ISO contract end date, from the placement list
  clientLead: string;
  engagementOwner: string;
}

export interface Client {
  id: string;
  name: string; // fictional, internal only
  type: string; // e.g. "Global bank"
  protectedTerms: string[];
}

/** One skill-level line. Raw text is never stored. */
export interface Line {
  id: string;
  text: string;
  band?: string;
  source?: string; // phrase in the worker's own words it came from (post-screen)
  status: "draft" | "approved-by-worker" | "sent" | "client-approved" | "declined";
  tier: Tier;
  checkpointId?: string;
  clientWritten?: boolean;
}

export interface Entry {
  id: string;
  engagementId: string;
  date: string;
  lines: Line[];
  managerSaw?: boolean;
}

export type CheckpointReason = "extension" | "roll-off" | "lead-change" | "manual";

export interface Checkpoint {
  id: string;
  engagementId: string;
  reason: CheckpointReason;
  openedBy: "system" | "worker" | "manager" | "engagement-owner";
  note?: string;
  periodFrom: string;
  periodTo: string;
  status: "open" | "sent" | "approved";
  lineIds: string[];
  approvedAt?: string;
  approver?: string;
  signedRecordId?: string;
}

export interface SignedRecord {
  id: string;
  workerId: string;
  engagementId: string;
  checkpointId: string;
  approver: string;
  approvedAt: string;
  lines: { text: string; tier: Tier; clientWritten?: boolean }[];
  signature: string; // base64 Ed25519 over canonical JSON of the fields above
  keyId: string;
}

export interface AppState {
  workers: Worker[];
  clients: Client[];
  engagements: Engagement[];
  entries: Entry[];
  checkpoints: Checkpoint[];
  records: SignedRecord[];
}

/** Output of the model pass on screened text. */
export interface ModelFlag {
  term: string;
  reason: string;
  suggestion: string;
}
export interface DraftLine {
  text: string;
  band: string;
  source: string;
}
export interface RewriteResult {
  flags: ModelFlag[];
  lines: DraftLine[];
  origin: "cache" | "live" | "fallback";
}
