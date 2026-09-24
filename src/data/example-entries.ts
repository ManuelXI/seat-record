/**
 * Example entries for the "Log your work" screen. Each one demonstrates a different check.
 * Protected-term examples use the worker's own (fictional) client list so the screen fires.
 */
export interface ExampleEntry { label: string; shows: string; text: string }

const PROTECTED: Record<string, ExampleEntry> = {
  c1: { label: "Client system name", shows: "Caught by the browser screen", text: "I rebuilt their overnight VaR batch so it stopped failing on the Aurora ledger feed, and set up contract tests for the three upstream teams." },
  c2: { label: "Client system name", shows: "Caught by the browser screen", text: "I moved the Caravela settlement service onto Kotlin coroutines and wrote the runbook for the on-call rota." },
  c3: { label: "Client system name", shows: "Caught by the browser screen", text: "I built the Lodestar portfolio screens in React and added component tests with Jest." },
  c4: { label: "Client system name", shows: "Caught by the browser screen", text: "I built the CarePath appointment pipelines in Airflow and added data quality checks." },
};

const MODEL: Record<string, ExampleEntry> = {
  c1: { label: "Domain term", shows: "Passes the screen, flagged by the model, one line greyed", text: "I rebuilt their overnight VaR batch so it stopped failing on the upstream ledger feed, and set up contract tests for the three upstream teams." },
  c2: { label: "Clean entry", shows: "Passes every check", text: "I built the payment reconciliation service in Kotlin and paired with the client's QA lead on the release checklist." },
};

const GENERIC: ExampleEntry[] = [
  { label: "Colleague's name", shows: "Caught by the browser screen", text: "I paired with Daniel from the platform team on the release plan and cleaned up the deployment scripts." },
  { label: "Figures and money", shows: "Caught by the browser screen", text: "I cut the settlement batch from 340 minutes to 40 and helped avoid a £2m trade break." },
  { label: "Ticket and hostname", shows: "Caught by the browser screen", text: "I fixed RISK-2041 and moved the scheduled jobs off riskapi.internal onto the shared cluster." },
];

const CLEAN: ExampleEntry = { label: "Clean entry", shows: "Passes the screen", text: "I set up contract tests with the two upstream teams and ran the weekly release review." };

export function examplesFor(clientId: string): ExampleEntry[] {
  return [PROTECTED[clientId], MODEL[clientId], ...GENERIC, MODEL[clientId] ? null : CLEAN].filter((e): e is ExampleEntry => !!e);
}
