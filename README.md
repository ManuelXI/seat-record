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

Open http://localhost:3000 for the landing page, then **Try the demo**. No API key is needed for the demo: scripted entries use cached model responses.
To run the model live, copy `.env.example` to `.env.local` and set `ANTHROPIC_API_KEY`.

| Command | What it does |
|---|---|
| `npm run dev` | Start the app |
| `npm test` | Unit tests for the screen, grounding check and signing |
| `npm run build` | Production build |
| `npm run seed` | Regenerate `src/data/seed.json` with fresh signatures |
| `npm run eval` | Run the model layer over the evaluation set (needs an API key) |

Use **Reset demo** in the header to return to the seed state.

## Deploy

Hosted on Netlify (`netlify.toml`). Netlify builds with `npm run build` and applies its Next.js runtime automatically. To run the model live, set `ANTHROPIC_API_KEY` in the site's environment variables.

## Roles

Demo sign-in, no passwords (`/signin`). Real authentication is a next step.

| Role | Sees | Can do |
|---|---|---|
| Worker (e.g. Efua, Kofi) | Own seat log, own profile | Log work, send lines for approval, export their record |
| Manager (Ama, Yaw) | Their engagements, status, client-approved lines, a count of unshared lines | Open a checkpoint with a note; find people for a request |
| Client lead | Only the approval email | Approve, edit or decline lines; add a testimonial |

A manager can never read a worker's unshared lines or send anything to a client.

## Sharing

A worker's seat history (`/history/:id`) is private to them and Bonarda Works. From **My profile**, the worker can turn on an unlisted share link (`/share/:token`), copy it, or replace it so the old link stops working. Shared pages are marked `noindex`. Kofi's link is on in the seed data: `/share/k7f3a9c2`.

## The flow

1. **Log your work** (`/worker/w1/new`). The worker writes a few lines. A deterministic screen in the browser marks protected terms, names, acronyms, figures and identifiers; each must be replaced before anything is sent.
2. **Model pass.** Only screened text goes to the model. It flags what a word list cannot catch, with a reason, and drafts skill-level lines, each tied to a phrase the worker wrote.
3. **Grounding check.** Any number or outcome claim not in the worker's own words greys the line until it is fixed. The worker approves; raw text is discarded.
4. **Checkpoint.** Opens itself at each extension and 15 working days before the contract end, or by hand by the worker, engagement owner or manager (with a note). All unapproved lines are selected by default; only the worker sends.
5. **Client approval** (`/client/:id`, mocked). The link rides on an email the client already sends: the extension reply or the end-of-engagement testimonial request. Approve, edit or decline per line; an optional testimonial is screened too.
6. **Signed record.** Approved lines are signed with Ed25519, tiered, and shown on the **dev profile** (`/profile/w1`) with a link to the private **seat history** (`/history/w1`). Workers can **export** their record or share an unlisted link.

## Real and mocked

| Part | Status |
|---|---|
| Browser screen, grounding check, tiers, signing and verification | Real, tested |
| Model pass (`claude-opus-5`, structured output, server-side refusal fallback) | Real; scripted entries cached |
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
