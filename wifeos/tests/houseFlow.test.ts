import { describe, expect, it } from "vitest";
import { getTenMinuteReset } from "../apps/web/src/agents/houseFlowAgent";
import type { HouseTask } from "../apps/web/src/lib/types";

describe("getTenMinuteReset", () => {
  it("prioritizes high-impact tasks inside a ten minute window", () => {
    const tasks: HouseTask[] = [
      { id: "1", room: "Laundry", taskName: "Fold towels", priority: "low", estimatedMinutes: 8, status: "queued", dueDate: "today" },
      { id: "2", room: "Kitchen", taskName: "Bottles", priority: "high", estimatedMinutes: 4, status: "queued", dueDate: "today" },
      { id: "3", room: "Nursery", taskName: "Diapers", priority: "high", estimatedMinutes: 5, status: "queued", dueDate: "today" },
      { id: "4", room: "Kitchen", taskName: "Counters", priority: "medium", estimatedMinutes: 3, status: "queued", dueDate: "today" }
    ];

    expect(getTenMinuteReset(tasks).map((task) => task.taskName)).toEqual(["Bottles", "Diapers"]);
  });
});
