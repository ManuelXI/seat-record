# Seat Record: optional submission sections

DRAFT. Read it through and rewrite it in your own words before submitting.

## Submission details

| Field | Value |
|---|---|
| Subteam name | Team Green |
| Parent group | Grok |
| Members | Emmanuel Mortey, George Hanson |
| Operations client | Desmond Techie |
| Lifecycle problem | Offboarding and re-engaging people |
| Solution name | Seat Record |
| Repository | https://github.com/ManuelXI/seat-record |
| Hosted prototype | https://seat-record.onrender.com (free plan; the first visit after a quiet spell can take up to a minute) |

## Known limitations

- **The AI model is not called in this demo.** The code calls Claude Opus 5, but we did not run it with an API key. Scripted entries and example searches show illustrative responses written to show what the model returns, and the app labels them. Anything else a user types gets a basic draft without AI, and search falls back to keyword matching.
- **The client email is simulated.** Nothing is sent. The approval "email" is a page inside the app, and the "reply by email" option is display text only.
- **Nothing proves who the client approver is.** In the demo, whoever opens the approval page acts as the client lead. In production this would come from a unique, expiring link sent to the client lead's real address.
- **Data lives in the browser.** Records are saved in the browser's local storage, so each device has its own copy. Share links for the seeded workers work anywhere; links created during the demo only work in that browser.
- **The signing key is a demo key committed to the repo.** Signatures are real Ed25519, but anyone with the repo could sign a record. There is no key rotation or revocation yet.
- **The confidentiality screen misses some things.** In our fictional test set, the rules caught 9 of 11 planted terms. They missed a mixed-case domain term ("VaR") and a description that identifies a client without naming it. Catching those is the model layer's job, which is not running in this demo.
- **The grounding check is word-based.** It greys out numbers, superlatives and scope words the worker never wrote. It will not catch every inflated paraphrase, which is why the worker and then the client approve each line.
- **Demo sign-in has no passwords.** Personas are picked from a list.
- **Protected terms per client are seeded by hand.** In production, the account owner would maintain each client's list.

## Assumptions

- We read Bonarda Works through Turntabl's model: salaried engineers placed at clients, with a bench and internal Bonarda projects. We kept the contractors and freelancers named in the brief, because the same evidence problem applies to them.
- Client leads will approve a few lines inside an email they already send, such as an extension reply or an end-of-engagement testimonial request, but will not log in to a new tool. This came out of our questions to Desmond Techie, our Operations client, and is why approval rides on the extension and testimonial emails.
- Client NDAs allow a worker to describe their work at skill level, as long as client names, systems, figures and client staff are left out. We have not seen real NDA text, so the screen errs on the side of removing too much.
- Operations knows each placement's contract end date, so a checkpoint can open 15 working days before roll-off. The demo uses seeded end dates.
- A future client or a Bonarda manager will trust a line more when the client approved it and Bonarda Works signed it than when the worker wrote it alone.
- Workers will log a few lines when reminded monthly, as long as the reminder is opt-in and logging takes two minutes.

## Next steps

1. **Run the model live.** Add an API key, run the evaluation (`npm run eval`), and replace the illustrative responses with recorded real ones.
2. **Send real emails.** Deliver approval requests with unique, expiring links, and parse "reply by email" approvals.
3. **Add a database and real sign-in.** Company single sign-on for staff; clients still need no account.
4. **Manage the signing key properly.** Keep it in a secrets manager, publish the public key so anyone can verify a record, and support rotation.
5. **Pilot with one client account.** Start with a few engineers rolling off in the next quarter. Measure how long it takes to answer a client request for "a developer with this stack", and how many answers cite client-approved evidence.
6. **Reuse approved records.** Feed them into case studies and profiles sent to clients, so nobody has to interview people long after a project ends.

## Who did what

Most product decisions came out of in-person discussions between the two of us, so the split below is approximate.

- **Emmanuel Mortey:** steered the research and ideation over several rounds, including feeding in how Turntabl works, which forced a full re-rank of the ideas. Drafted the questions for our Operations client. Came up with Find people by evidence. Built the app with Claude Code, and reviewed every screen over many rounds of feedback (layout, the landing page and its two-step hero, sign-out, labelling the illustrative AI responses). Deployed it to Render and drafted the submission documents. See the AI declaration for the full list.
- **George Hanson:** gave the first round of feedback after ideation and on the first version of the brief page. His review corrected our reading of Bonarda Works, which had narrowed the persona to salaried engineers only, so we kept contractors and freelancers in scope. It also helped settle the lifecycle problem as offboarding and re-engaging people.
- **Both:** chose Seat Record from the shortlist, worked through the product decisions in person (which emails carry the client's approval, what managers can and cannot see, and keeping the monthly reminder as an opt-in), and reviewed the demo.
