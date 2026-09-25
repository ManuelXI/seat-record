# Seat Record

A signed, confidentiality-safe record of what embedded workers did on client engagements.
Built for the Turntabl "Future of Work" hackathon. The client, Bonarda Works, and every person and client in the data are fictional.

**Lifecycle problem:** offboarding and re-engaging people.

> A dated client approval, signed by the employer, is the one work credential a model cannot mint.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000 for the landing page, then **Try the demo**. No API key is needed for the demo: scripted entries and example requests show illustrative responses written to show what the model returns. They were written during the build, not recorded from the API.
To run the model live, copy `.env.example` to `.env.local` and set `ANTHROPIC_API_KEY`.

| Command | What it does |
|---|---|
| `npm run dev` | Start the app |
| `npm test` | Unit tests for the screen, grounding check and signing |
| `npm run build` | Production build |
| `npm run seed` | Regenerate `src/data/seed.json` with fresh signatures |
| `npm run eval` | Run the model layer over the evaluation set (needs an API key) |

Use **Reset demo data** in the sidebar to return to the seed state. Answers to common questions are at `/faq`.

## Demo check and recording

The walkthrough in `submission/demo-script.md` is automated in `tests/e2e/demo-flow.ts` (Playwright). Each run starts in a fresh browser, so demo data always starts from the seed.

- `npm run e2e` runs the whole demo against the hosted site in about 20 seconds and fails at the first broken step, plus the manager-witnessed flow (`tests/e2e/witness.spec.ts`). Run it before recording and before Demo Day.
- `npm run demo:record` plays the same demo slowly with a visible cursor and saves a 1920x1200 video named with the date and time, such as `recordings/seat-record-demo-20260925-2100.mp4` (H.264, encoded with macOS AVFoundation through `tests/e2e/encode-mp4.swift`), or `.webm` on other systems. It also writes a matching `chapters-<date-time>.txt` with a timestamp for each section. `PACE=2 npm run demo:record` doubles every pause (about 3.5 minutes).
- `npm run demo:clip` records short HD clips for splicing into the video (`tests/e2e/clips.spec.ts`), such as Ama's engagement page scrolling to the count of lines she cannot read.
- Set `BASE_URL=http://localhost:3000` to run either against a local dev server.

## Deploy

Hosted on Render's free plan at https://seat-record.onrender.com (build `npm install && npm run build`, start `npm start`). The free instance sleeps when idle, so the first visit can take up to a minute. No environment variables are set; to run the model live, set `ANTHROPIC_API_KEY`. Do not set `SIGNING_PRIVATE_KEY_PEM` without also replacing the public key in `src/lib/demo-key.ts`, or verification fails.

## Roles

Demo sign-in, no passwords (`/signin`). Real authentication is a next step.

| Role | Sees | Can do |
|---|---|---|
| Worker (e.g. Efua, Kofi) | Own seat log, own profile | Log work, send lines for approval, ask their manager to confirm an entry from a 1-on-1, export their record |
| Manager (Ama, Yaw) | Their engagements, status, client-approved lines, a count of unshared lines, and any entry a worker asks them to confirm | Open a checkpoint with a note; confirm or decline a 1-on-1 entry (it becomes manager-witnessed); find people for a request |
| Client lead | Only the approval email | Approve, edit or decline lines; add a testimonial |

A manager can never read a worker's unshared lines or send anything to a client. The one exception is an entry the worker chooses to put to their engagement owner for confirmation (`src/lib/witness.ts`).

## Sharing

A worker's seat history (`/history/:id`) is private to them and Bonarda Works. From **My profile**, the worker can turn on an unlisted share link (`/share/:token`), copy it, or replace it so the old link stops working. Shared pages are marked `noindex`. Five seeded workers have sharing on; the demo-only showcase at `/shared` lists them (in the product there is no directory, links are unlisted).

## The flow

1. **Log your work** (`/worker/w1/new`). The worker writes a few lines. A deterministic screen in the browser marks protected terms, names, acronyms, figures and identifiers; each must be replaced before anything is sent.
2. **Model pass.** Only screened text goes to the model. It flags what a word list cannot catch, with a reason, and drafts skill-level lines, each tied to a phrase the worker wrote.
3. **Grounding check.** Any number or outcome claim not in the worker's own words greys the line until it is fixed. The worker approves; raw text is discarded.
4. **Checkpoint.** Opens itself at each extension and 15 working days before the contract end, or by hand by the worker, engagement owner or manager (with a note). All unapproved lines are selected by default; only the worker sends.
5. **Client approval** (`/client/:id`, mocked). The link rides on an email the client already sends: the extension reply or the end-of-engagement testimonial request. Approve, edit or decline per line; an optional testimonial is screened too.
6. **Signed record.** Approved lines are signed with Ed25519, tiered, and shown on the **dev profile** (`/profile/w1`) with a link to the private **seat history** (`/history/w1`). Workers can **export** their record or share an unlisted link.

## Multiple engagements

A person can have many engagements. The latest is current and takes new entries; past ones are read-only with their signed records. The seat log has an engagement switcher, the profile and seat history list every engagement, managers see previous engagements, and search labels each quote with its source. Internal Bonarda projects on the bench count as engagements. In the seed data, Efua has three (a fintech, an internal bench project, the bank) and Kofi and Kwame have two.

## Find people

Managers describe a client request at `/search`. The model splits it into requirements and cites client-approved lines that support each one; keyword matching runs alongside and a manager can filter to people with evidence for every requirement. Results are ordered by how many requirements have approved evidence (shown on each card), then availability, with a toggle for soonest available. Nothing is scored, and a worker's private log is never searched.

## Real and mocked

| Part | Status |
|---|---|
| Browser screen, grounding check, tiers, signing and verification | Real, tested |
| Model pass (`claude-opus-5`, structured output, server-side refusal fallback) | Built, not run in the demo; scripted entries show illustrative responses written to show what the model returns |
| Checkpoints, selection, profile, history, export | Real |
| Placement list, client emails, reminder delivery | Mocked |
| Storage | Browser `localStorage` for the demo |
| Sign-in | Demo personas, no passwords |
| Share links | Work across devices for seed data; links created in the demo live in that browser only |
| Signing key | Committed demo key; production would use a secrets manager |

## Where the AI is, and is not

- **Is:** flagging confidential signals a dictionary cannot, with a reason; rewriting a true, specific sentence into a true, generic one.
- **Is not:** the first screen, the grounding check, tiers, signing, storage or matching.
- **Never:** scoring, rating, ranking or comparing a person. Matching filters by stack and sorts by availability.

## Code map

| Path | Purpose |
|---|---|
| `src/lib/types.ts` | Shared data contract |
| `src/lib/screen.ts` | Deterministic confidentiality screen |
| `src/lib/grounding.ts` | Grounding check for drafted lines |
| `src/lib/rewrite.ts` | Model call, cache and fallback |
| `src/lib/sign.ts` | Ed25519 signing and verification |
| `src/lib/store.tsx` | Client-side state and actions |
| `scripts/build-seed.ts` | Synthetic data generator |
| `src/data/eval-samples.ts` | Labelled evaluation set |
