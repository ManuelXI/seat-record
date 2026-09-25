# How we used AI, and declaration of AI tools

DRAFT. The one item marked [confirm] becomes true once we have rewritten the summary and script in our own words. Source: [`DECISIONS.md`](../DECISIONS.md).

We used only Anthropic's Claude: Claude Fable 5.1 mostly for research and ideation, and Claude Opus 5.5 in Claude Code for the build. No other AI tools were used.

## Tools used

| Tool | What it did | What the team did or verified |
|---|---|---|
| Claude Fable 5.1 (Anthropic) | Research and ideation: condensed public sources into analyst digests, generated and scored candidate ideas, re-ranked them against Turntabl's operating model | Steered the ideation over several rounds: fed in how Turntabl actually works (salaried engineers, client placements, the bench), which forced a full re-rank; chose the problem and the idea; corrected the AI's first reading of Bonarda, which narrowed the persona too far; checked the direction with our Operations client |
| Claude Opus 5.5 (Anthropic), in Claude Code | Wrote most of the application code, tests, synthetic seed data, page copy, and the illustrative model responses used in the demo | Added features the AI had not proposed (see below); reviewed every screen in the browser and asked for changes over many rounds; checked the tests (40 passing), type-check, lint and build; set the product boundaries listed below |
| Claude Opus 5.5, in Claude Code | Drafted the summary, demo script and this declaration | [confirm] Rewrote both in our own words and rehearsed them aloud |
| Claude Opus 5 via the Anthropic API (the model the product code calls) | Designed to flag confidential signals a word list misses, rewrite lines at skill level, and turn a client request into requirements matched to approved lines | **Not called in this demo** (see below) |

## The model is not called in this demo

The product code calls Claude Opus 5 through the Anthropic API with structured output and a server-side fallback. We did not run it with an API key for this submission. The scripted demo entries and the example search requests show **illustrative responses written to show what the model returns**. They were written during the build, not recorded from API calls. The app labels them as illustrative wherever they appear. Anything else a user types gets a basic draft or keyword matching without AI, also labelled. The Evaluation page shows the model column as not run for the same reason.

## Decisions the AI never makes

- **No model scores, ranks or compares a person.** Find people orders results by how many requirements have client-approved evidence, then by availability, and shows the count so every position can be checked against the quoted lines.
- Screening, the grounding check, tiers, signing and storage are plain code with tests, not model output.
- Only the worker decides which lines are sent to a client, and only the client approves them.

## Key decisions: made or verified by the team

| Decision | Decided by | AI role |
|---|---|---|
| Lifecycle problem: offboarding and re-engaging people | Team | AI had framed it across three areas |
| Client approval rides only on emails the client already sends | Team, from Operations client answers | AI proposed checkpoints |
| Monthly reminder kept as an opt-in | Team | AI suggested dropping it |
| Checkpoint selection defaults to all unapproved lines | Team | Team questioned the AI's design |
| No model scores people | Team | Agreed after research on the EU AI Act |
| Demo responses labelled as illustrative, not as recorded runs | Team | AI found that the earlier "real runs" wording was unsupported |

## What the team added and changed

The AI wrote most of the code. These ideas and changes came from us.

**Product ideas and decisions**

- **Find people by evidence.** Our idea: a manager searches for developers against a client's requirements ("I want someone who has implemented X"). The AI designed how it works.
- **Approved lines on the dev profile, with a link to a seat history page.** Our idea.
- **Workers keep an exported copy** of their approved lines when they leave.
- **Managers can open a checkpoint with a note**, while only the worker decides what is sent. The idea was ours; the AI proposed the boundary.
- **Separate worker and manager views**, with client leads needing no account.
- **A landing page** for judges who open the link cold.
- **Kept the monthly reminder** as an opt-in when the AI suggested dropping it.
- **Checkpoints start with every unapproved line ticked.** We questioned the AI's design, which made the worker pick lines one by one.
- **Seat history private by default**, after we asked who should be able to see it.
- **Manager-witnessed as a real flow.** We asked for it: a worker asks their manager to confirm one entry they saw in a 1-on-1, and only that entry is shown to them. The AI designed it so managers still never read the private log.
- **People with more than one engagement,** including internal bench projects, so evidence follows a person across clients.

**Feedback rounds on the interface**

We reviewed the app screen by screen and asked for changes, including:

- a sidebar layout with a switch-user card, then a Sign out option in the sidebar
- one-tap replacements for confidential terms, and example entries for each check
- sticky action bars, theme-matched scrollbars, and a smoother FAQ
- an animated before-and-after profile deck on the landing page
- naming Find people in the landing hero, then splitting the hero text into Step 1 and Step 2, shown one at a time
- a note on Log your work telling testers to start with the examples, because the model is not called
- a custom favicon in place of the default, and scroll spacing so the Find people example is not hidden under the header

**Honesty and delivery**

- When the AI found that the demo responses had never come from a real model call, we chose to label them as illustrative everywhere rather than present them as real.
- We chose the hosting (Render's free plan) after ruling out other options.

## One risk and its mitigation

**Risk:** a rewrite could make a worker's claim bigger than what they did, and the client might approve an inflated line.
**Mitigation:** a deterministic grounding check greys out any number, superlative or scope word that is not in the worker's own words, and the worker approves every line before the client sees it.

## Evaluation

All samples are fictional. Rule results are computed from the same code the product runs.

| Check | Result |
|---|---|
| Planted confidential terms caught by rules alone | 9 of 11 (misses: a mixed-case domain metric and an identifying description) |
| Caught by rules plus model | Not run (model not called in this demo) |
| Benign entries passed untouched | 2 of 2 |
| Grounding check on drafted lines | 6 of 6 handled correctly |

## Statement

[confirm] The problem-and-solution summary and the walkthrough script are the team's own words. AI drafted earlier versions, which we reviewed and rewrote.
