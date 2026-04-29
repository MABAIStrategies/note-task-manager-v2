import { describe, expect, it } from "vitest";
import { generateMomContent } from "../apps/web/src/agents/creatorMomAgent";

describe("generateMomContent", () => {
  it("returns structured creative outputs from a daily moment", () => {
    const output = generateMomContent("Baby spit carrots everywhere.");

    expect(output.hook).toContain("Baby spit carrots everywhere.");
    expect(output.caption.length).toBeGreaterThan(10);
    expect(output.babyBookEntry).toContain("Today");
    expect(output.monetizationIdeas).toHaveLength(3);
  });
});
