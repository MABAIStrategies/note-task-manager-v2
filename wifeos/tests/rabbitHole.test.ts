import { describe, expect, it } from "vitest";
import { analyzeRabbitHole } from "../apps/web/src/agents/rabbitHoleAgent";

describe("analyzeRabbitHole", () => {
  it("separates claims, evidence, vibes, and verdict", () => {
    const result = analyzeRabbitHole("Kardashian media cycles");

    expect(result.topic).toBe("Kardashian media cycles");
    expect(result.claims).toHaveLength(3);
    expect(result.claims[0]).toHaveProperty("counterpoint");
    expect(result.entertainmentScore).toBeGreaterThan(result.plausibilityScore);
    expect(result.verdict).toContain("Fun theory");
  });
});
