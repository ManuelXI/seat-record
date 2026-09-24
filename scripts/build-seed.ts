/**
 * Generates src/data/seed.json: fictional workers, clients, engagements, entries,
 * checkpoints and signed records. Every name and client here is invented.
 * Run: npm run seed
 */
import { writeFileSync } from "node:fs";
import { signRecord } from "../src/lib/sign";
import type { AppState, Checkpoint, Client, Engagement, Entry, Line, SignedRecord, Tier, Worker } from "../src/lib/types";

const clients: Client[] = [
  { id: "c1", name: "Harrow & Vale", type: "Global investment bank", protectedTerms: ["Harrow", "Vale", "HVB", "Aurora", "Sentinel", "RiskHub", "Priya", "Whitfield"] },
  { id: "c2", name: "Tagus Pay", type: "Payments fintech", protectedTerms: ["Tagus", "TagusPay", "Caravela", "Marta"] },
  { id: "c3", name: "Northgate Capital", type: "Asset manager", protectedTerms: ["Northgate", "NGC", "Lodestar", "Oakes"] },
  { id: "c4", name: "Meridian Health", type: "Health technology company", protectedTerms: ["Meridian", "CarePath", "Halden"] },
  { id: "c5", name: "Bonarda Sales", type: "Internal Bonarda project", protectedTerms: [] },
];

const people: [Worker, Omit<Engagement, "workerId">][] = [
  [
    { id: "w1", name: "Efua Mensah", title: "Senior Software Engineer", type: "employee", location: "Accra", about: "Backend-leaning engineer who likes making fragile batch systems boring.", skills: ["Java", "Spring Boot", "Kafka", "React", "PostgreSQL"], availableFrom: "2026-10-19", reminderOn: true },
    { id: "e1", clientId: "c1", clientLabel: "Global investment bank, risk technology", role: "Backend engineer", stack: ["Java", "Spring Boot", "Kafka", "React"], start: "2025-08-18", end: "2026-10-16", clientLead: "Team lead, risk technology", engagementOwner: "Ama Boateng" },
  ],
  [
    { id: "w2", name: "Kofi Asante", title: "Software Engineer", type: "contractor", location: "Accra", about: "Contract engineer across payments and fintech backends.", skills: ["Kotlin", "Spring Boot", "PostgreSQL", "AWS"], availableFrom: "2026-09-01", reminderOn: false },
    { id: "e2", clientId: "c2", clientLabel: "Payments fintech, Lisbon", role: "Backend contractor", stack: ["Kotlin", "Spring Boot", "PostgreSQL", "AWS"], start: "2026-03-02", end: "2026-08-28", clientLead: "Engineering manager, payments", engagementOwner: "Ama Boateng" },
  ],
  [
    { id: "w3", name: "Abena Owusu", title: "Frontend Engineer", type: "employee", location: "Accra", about: "Frontend engineer focused on data-heavy trading screens.", skills: ["TypeScript", "React", "Redux", "Jest"], availableFrom: "2026-12-01", reminderOn: true },
    { id: "e3", clientId: "c3", clientLabel: "Asset manager, London", role: "Frontend engineer", stack: ["TypeScript", "React", "Redux"], start: "2025-11-03", end: "2026-11-27", clientLead: "Head of portfolio tooling", engagementOwner: "Yaw Darko" },
  ],
  [
    { id: "w4", name: "Kwame Boakye", title: "Data Engineer", type: "freelancer", location: "Kumasi", about: "Freelance data engineer building pipelines people trust.", skills: ["Python", "Airflow", "Snowflake", "SQL"], availableFrom: "2026-10-05", reminderOn: false },
    { id: "e4", clientId: "c4", clientLabel: "Health technology company, Berlin", role: "Data engineer", stack: ["Python", "Airflow", "Snowflake"], start: "2026-04-06", end: "2026-10-02", clientLead: "Data platform lead", engagementOwner: "Yaw Darko" },
  ],
  [
    { id: "w5", name: "Adjoa Tetteh", title: "Full-stack Engineer", type: "employee", location: "Accra", about: "Full-stack engineer currently on an internal Bonarda project.", skills: ["TypeScript", "Next.js", "Node.js", "PostgreSQL"], availableFrom: "2026-09-29", reminderOn: true },
    { id: "e5", clientId: "c5", clientLabel: "Internal Bonarda project, sales tooling", role: "Full-stack engineer", stack: ["TypeScript", "Next.js", "PostgreSQL"], start: "2026-06-01", end: "2026-12-18", clientLead: "Product owner, Bonarda Sales", engagementOwner: "Ama Boateng" },
  ],
  [
    { id: "w6", name: "Yaw Mensimah", title: "Platform Engineer", type: "contractor", location: "Takoradi", about: "Platform contractor who automates the release path.", skills: ["Kubernetes", "Terraform", "AWS", "Go"], availableFrom: "2026-11-02", reminderOn: false },
    { id: "e6", clientId: "c3", clientLabel: "Asset manager, London", role: "Platform engineer", stack: ["Kubernetes", "Terraform", "AWS"], start: "2026-01-12", end: "2026-10-30", clientLead: "Infrastructure lead", engagementOwner: "Yaw Darko" },
  ],
  [
    { id: "w7", name: "Esi Quaye", title: "QA Engineer", type: "employee", location: "Accra", about: "Test automation engineer who writes the tests nobody else wants to.", skills: ["Playwright", "TypeScript", "Java", "JUnit"], availableFrom: "2026-10-26", reminderOn: true },
    { id: "e7", clientId: "c1", clientLabel: "Global investment bank, markets technology", role: "Test automation engineer", stack: ["Playwright", "Java", "JUnit"], start: "2025-10-06", end: "2026-10-23", clientLead: "QA manager, markets", engagementOwner: "Ama Boateng" },
  ],
  [
    { id: "w8", name: "Nii Armah", title: "Backend Engineer", type: "freelancer", location: "Accra", about: "Freelance backend engineer, Python and Go.", skills: ["Python", "FastAPI", "Go", "PostgreSQL"], availableFrom: "2026-09-28", reminderOn: false },
    { id: "e8", clientId: "c4", clientLabel: "Health technology company, Berlin", role: "Backend engineer", stack: ["Python", "FastAPI", "PostgreSQL"], start: "2026-02-02", end: "2026-09-25", clientLead: "Engineering lead, patient services", engagementOwner: "Yaw Darko" },
  ],
  [
    { id: "w9", name: "Akosua Frimpong", title: "Software Engineer", type: "employee", location: "Accra", about: "Engineer on streaming and event-driven systems.", skills: ["Java", "Kafka", "Spring Boot", "Docker"], availableFrom: "2027-01-15", reminderOn: true },
    { id: "e9", clientId: "c2", clientLabel: "Payments fintech, Lisbon", role: "Backend engineer", stack: ["Java", "Kafka", "Spring Boot"], start: "2026-01-19", end: "2027-01-15", clientLead: "Engineering manager, ledger", engagementOwner: "Ama Boateng" },
  ],
  [
    { id: "w10", name: "Kojo Antwi", title: "Mobile Engineer", type: "contractor", location: "Accra", about: "Contract mobile engineer, iOS and Android.", skills: ["Kotlin", "Android", "iOS", "React"], availableFrom: "2026-10-12", reminderOn: false },
    { id: "e10", clientId: "c4", clientLabel: "Health technology company, Berlin", role: "Mobile engineer", stack: ["Kotlin", "Android", "iOS"], start: "2026-05-04", end: "2026-10-09", clientLead: "Mobile lead", engagementOwner: "Yaw Darko" },
  ],
  [
    { id: "w11", name: "Afia Donkor", title: "Frontend Engineer", type: "freelancer", location: "Cape Coast", about: "Freelance frontend engineer, design systems and accessibility.", skills: ["React", "TypeScript", "Tailwind", "Figma"], availableFrom: "2026-10-01", reminderOn: true },
    { id: "e11", clientId: "c5", clientLabel: "Internal Bonarda project, HR tooling", role: "Frontend engineer", stack: ["React", "TypeScript", "Tailwind"], start: "2026-07-06", end: "2026-10-30", clientLead: "Product owner, Bonarda HR", engagementOwner: "Ama Boateng" },
  ],
  [
    { id: "w12", name: "Selorm Agbeko", title: "Software Engineer", type: "employee", location: "Accra", about: "Java engineer, recently rolled off a markets engagement.", skills: ["Java", "Spring Boot", "Kafka", "Angular"], availableFrom: "2026-09-22", reminderOn: false },
    { id: "e12", clientId: "c1", clientLabel: "Global investment bank, markets technology", role: "Backend engineer", stack: ["Java", "Spring Boot", "Angular"], start: "2025-06-02", end: "2026-09-19", clientLead: "Tech lead, markets", engagementOwner: "Ama Boateng" },
  ],
];

const workers: Worker[] = people.map(([w]) => w);
const engagements: Engagement[] = people.map(([w, e]) => ({ ...e, workerId: w.id }));

let lineN = 0;
const line = (text: string, band: string, tier: Tier, status: Line["status"], checkpointId?: string, clientWritten?: boolean): Line => ({
  id: `l${++lineN}`, text, band, status, tier, checkpointId, clientWritten,
});

const entries: Entry[] = [];
const checkpoints: Checkpoint[] = [];
const records: SignedRecord[] = [];

function addEntry(id: string, engagementId: string, date: string, lines: Line[], managerSaw = false) {
  entries.push({ id, engagementId, date, lines, managerSaw });
}

function approveCheckpoint(cp: Omit<Checkpoint, "status" | "signedRecordId" | "lineIds">, lineObjs: Line[], approver: string, approvedAt: string, extra: Line[] = []) {
  const all = [...lineObjs, ...extra];
  for (const l of all) { l.status = "client-approved"; l.tier = "client-approved"; l.checkpointId = cp.id; }
  const eng = engagements.find((e) => e.id === cp.engagementId)!;
  const rec = signRecord({
    id: `rec-${cp.id}`, workerId: eng.workerId, engagementId: eng.id, checkpointId: cp.id, approver, approvedAt,
    lines: all.map((l) => ({ text: l.text, tier: l.tier, ...(l.clientWritten ? { clientWritten: true } : {}) })),
  });
  records.push(rec);
  checkpoints.push({ ...cp, status: "approved", lineIds: all.map((l) => l.id), approver, approvedAt, signedRecordId: rec.id });
}

// Efua: three earlier entries, one approved at the extension eight months ago.
const efA = [
  line("Rebuilt a failing nightly reconciliation job in Java and Spring Boot so it runs unattended", "reliability", "engineer-account", "approved-by-worker"),
  line("Added consumer-side retries and dead-letter handling to Kafka event processing", "reliability", "engineer-account", "approved-by-worker"),
  line("Paired with two newer team members on code review practice", "mentoring", "engineer-account", "approved-by-worker"),
];
addEntry("en1", "e1", "2025-11-20", efA);
approveCheckpoint({ id: "cp1", engagementId: "e1", reason: "extension", openedBy: "system", periodFrom: "2025-08-18", periodTo: "2026-02-13" }, efA, "Previous team lead, risk technology", "2026-02-20");
addEntry("en2", "e1", "2026-05-12", [
  line("Moved a React risk dashboard onto a shared component library", "delivery", "engineer-account", "approved-by-worker"),
]);
addEntry("en3", "e1", "2026-07-30", [
  line("Ran the team's incident review for a failed overnight run and wrote the follow-up actions", "practice", "manager-witnessed", "approved-by-worker"),
], true);

// Kofi: contractor, engagement ended, testimonial line from the client.
const koA = [
  line("Built a payment reconciliation service in Kotlin", "delivery", "engineer-account", "approved-by-worker"),
  line("Paired with the client's QA lead to shape the release checklist", "collaboration", "engineer-account", "approved-by-worker"),
];
addEntry("en4", "e2", "2026-05-18", koA);
addEntry("en5", "e2", "2026-08-10", [
  line("Wrote the runbook for the settlement service handover", "practice", "engineer-account", "approved-by-worker"),
]);
approveCheckpoint(
  { id: "cp2", engagementId: "e2", reason: "roll-off", openedBy: "system", periodFrom: "2026-03-02", periodTo: "2026-08-28" },
  koA, "Engineering manager, payments", "2026-09-02",
  [line("Kofi was dependable under release pressure and left us with a service our team could own on day one.", "collaboration", "client-approved", "client-approved", undefined, true)],
);

// Everyone else: one or two entries, some already approved.
const simple: [string, string, string[], boolean][] = [
  ["e3", "2026-04-14", ["Built virtualised grids for large portfolio views in React", "Introduced component tests with Jest for trading screens"], true],
  ["e4", "2026-07-02", ["Built Airflow pipelines loading clinical operations data into Snowflake", "Added data quality checks that block bad loads"], false],
  ["e5", "2026-08-04", ["Built lead pipeline views in Next.js for the sales team", "Set up PostgreSQL migrations with review in CI"], false],
  ["e6", "2026-05-20", ["Moved release infrastructure to Terraform-managed Kubernetes on AWS", "Cut manual steps from the release path"], true],
  ["e7", "2026-06-09", ["Built a Playwright regression suite for markets screens", "Stabilised flaky Java integration tests"], false],
  ["e8", "2026-07-21", ["Built FastAPI services for patient scheduling", "Designed PostgreSQL schemas with the product team"], true],
  ["e9", "2026-06-30", ["Built Kafka consumers for ledger events in Spring Boot", "Containerised services with Docker for local testing"], false],
  ["e10", "2026-08-18", ["Built appointment booking flows in Kotlin for Android", "Shared a component approach across iOS and Android"], false],
  ["e11", "2026-09-01", ["Built accessible form components in React and Tailwind", "Ran a design system review with the product owner"], false],
  ["e12", "2026-04-02", ["Maintained Spring Boot trade enrichment services", "Built Angular screens for trade exceptions"], true],
];
simple.forEach(([eid, date, texts, approved], i) => {
  const ls = texts.map((t) => line(t, "delivery", "engineer-account", "approved-by-worker"));
  addEntry(`ex${i}`, eid, date, ls);
  if (approved) {
    const eng = engagements.find((e) => e.id === eid)!;
    approveCheckpoint({ id: `cpx${i}`, engagementId: eid, reason: "extension", openedBy: "system", periodFrom: eng.start, periodTo: date }, ls, eng.clientLead, date);
  }
});

const state: AppState = { workers, clients, engagements, entries, checkpoints, records };
writeFileSync(new URL("../src/data/seed.json", import.meta.url), JSON.stringify(state, null, 2));
console.log(`seed: ${workers.length} workers, ${entries.length} entries, ${records.length} signed records`);
