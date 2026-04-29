import { describe, expect, it } from "vitest";
import { getTodayBriefing, getWeeklyBrief } from "../apps/api/services/briefingService";

describe("briefing services", () => {
  it("combines baby, house, ring, Gmail, and Calendar context", () => {
    const briefing = getTodayBriefing();

    expect(briefing.baby.name).toBe("Luna");
    expect(briefing.houseReset.length).toBeGreaterThan(0);
    expect(briefing.ring[0].summary).toContain("Porch motion");
    expect(briefing.gmail[0].category).toBe("appointment");
    expect(briefing.calendar[0].title).toContain("Pediatrician");
  });

  it("returns a privacy-aware weekly brief", () => {
    const brief = getWeeklyBrief();

    expect(brief.privacyMode).toBe(true);
    expect(brief.recommendation).toContain("nap window");
  });
});
