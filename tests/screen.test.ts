import { describe, expect, it } from "vitest";
import { screenText } from "@/lib/screen";

const terms = ["Aurora", "Sentinel", "Priya"];

describe("screenText", () => {
  it("catches protected terms case-insensitively", () => {
    const hits = screenText("Moved the aurora feed to Kafka", terms);
    expect(hits.map((h) => [h.text, h.kind])).toEqual([["aurora", "protected-term"]]);
  });

  it("catches the demo sentence's system name and nothing else", () => {
    const text = "I rebuilt their overnight VaR batch so it stopped failing on the Aurora ledger feed, and set up contract tests for the three upstream teams.";
    expect(screenText(text, terms).map((h) => h.text)).toEqual(["Aurora"]);
  });

  it("passes the demo sentence once the name is replaced", () => {
    const text = "I rebuilt their overnight VaR batch so it stopped failing on an upstream ledger feed, and set up contract tests for the three upstream teams.";
    expect(screenText(text, terms)).toEqual([]);
  });

  it("catches unknown names mid-sentence but not sentence starts", () => {
    expect(screenText("Paired with Daniel on the release", terms).map((h) => h.kind)).toEqual(["name"]);
    expect(screenText("Paired with the platform team", terms)).toEqual([]);
  });

  it("allows technology terms", () => {
    expect(screenText("Wrote Kafka consumers in Java and Spring Boot with Jest and SQL", terms)).toEqual([]);
  });

  it("catches money, large numbers, tickets, hostnames and unknown acronyms", () => {
    const kinds = (t: string) => screenText(t, terms).map((h) => h.kind);
    expect(kinds("Handled a £2m trade break")).toEqual(["figure"]);
    expect(kinds("Cut runtime from 340 minutes")).toEqual(["figure"]);
    expect(kinds("Closed RISK-2041 today")).toEqual(["identifier"]);
    expect(kinds("Deployed to riskapi.internal")).toEqual(["identifier"]);
    expect(kinds("Built the PNLX job")).toEqual(["acronym"]);
  });
});
