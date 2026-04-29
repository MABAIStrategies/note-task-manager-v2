import { describe, expect, it } from "vitest";
import { babyEvents } from "../apps/web/src/lib/mockData";
import { predictNextNap } from "../apps/web/src/lib/napPredictor";

describe("predictNextNap", () => {
  it("returns a nap window after the last nap and bottle rhythm", () => {
    const prediction = predictNextNap(babyEvents);

    expect(prediction.windowStart).toBe("2:30 PM");
    expect(prediction.windowEnd).toBe("3:00 PM");
    expect(prediction.confidence).toBeGreaterThan(0.8);
  });
});
