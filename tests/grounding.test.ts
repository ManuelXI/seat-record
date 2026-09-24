import { describe, expect, it } from "vitest";
import { checkGrounding } from "@/lib/grounding";
import { GROUNDING_SAMPLES } from "@/data/eval-samples";

describe("checkGrounding", () => {
  it("greys the demo's embellished line", () => {
    const r = checkGrounding("Eliminated all failures in a business-critical overnight process", "stopped failing");
    expect(r.grounded).toBe(false);
    expect(r.unsupported).toEqual(["eliminated", "all"]);
  });

  it("keeps the edited line", () => {
    expect(checkGrounding("Removed recurring failures in an overnight process", "stopped failing").grounded).toBe(true);
  });

  it("allows numbers the worker actually wrote", () => {
    expect(checkGrounding("Set up contract tests with three upstream teams", "set up contract tests for the three upstream teams").grounded).toBe(true);
  });

  it.each(GROUNDING_SAMPLES)("labelled sample: $line", (s) => {
    expect(!checkGrounding(s.line, s.source).grounded).toBe(s.shouldFlag);
  });
});
