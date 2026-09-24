import { describe, expect, it } from "vitest";
import { screenText } from "@/lib/screen";
import { applySuggestion, suggestionsFor } from "@/lib/suggest";

const terms = ["Aurora", "Priya"];
const first = (text: string) => {
  const hit = screenText(text, terms)[0];
  return suggestionsFor(hit, text);
};
const apply = (text: string, label: string) => {
  const s = first(text).find((x) => x.label === label)!;
  return applySuggestion(text, s);
};

describe("suggestions", () => {
  it("offers a modifier for a system name used as an adjective, keeping the article", () => {
    const text = "It stopped failing on the Aurora ledger feed.";
    expect(first(text).map((s) => s.label)).toContain("upstream");
    expect(apply(text, "upstream")).toBe("It stopped failing on the upstream ledger feed.");
  });

  it("replaces a ticket with a noun phrase", () => {
    expect(apply("I fixed RISK-2041 and moved on.", "a production bug")).toBe("I fixed a production bug and moved on.");
  });

  it("replaces a hostname with a noun phrase", () => {
    expect(apply("Moved jobs off riskapi.internal onto the cluster.", "an internal service")).toBe("Moved jobs off an internal service onto the cluster.");
  });

  it("keeps a/an agreeing with the new word", () => {
    expect(apply("Helped avoid a £2m trade break.", "large")).toBe("Helped avoid a large trade break.");
    expect(apply("Built a PNLX job.", "internal")).toBe("Built an internal job.");
  });

  it("swaps the article when the suggestion brings its own", () => {
    expect(apply("I fixed the RISK-2041.", "a production bug")).toBe("I fixed a production bug.");
  });

  it("handles names and possessives", () => {
    expect(apply("Paired with Daniel on the release.", "a colleague")).toBe("Paired with a colleague on the release.");
  });

  it("removes a term and tidies spaces and punctuation", () => {
    expect(apply("Cut the batch from 340 minutes, finally.", "Remove")).toBe("Cut the batch from minutes, finally.");
  });

  it("clears the screen after applying suggestions to the demo sentence", () => {
    const text = "I rebuilt their overnight VaR batch so it stopped failing on the Aurora ledger feed.";
    const out = apply(text, "upstream");
    expect(screenText(out, terms)).toEqual([]);
  });
});
