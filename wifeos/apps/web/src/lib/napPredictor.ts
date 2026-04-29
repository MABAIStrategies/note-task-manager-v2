import { addMinutes, formatTime } from "./dateUtils";
import type { BabyEvent, NapPrediction } from "./types";

export function predictNextNap(events: BabyEvent[], now = new Date("2026-04-29T13:00:00-04:00")): NapPrediction {
  const lastNap = [...events].reverse().find((event) => event.type === "nap");
  const lastBottle = [...events].reverse().find((event) => event.type === "bottle");
  const base = lastNap ? new Date(lastNap.timestamp) : now;
  const wakeWindowMinutes = lastBottle ? 190 : 150;
  const windowStart = addMinutes(base, wakeWindowMinutes);
  const windowEnd = addMinutes(windowStart, 30);

  return {
    windowStart: formatTime(windowStart),
    windowEnd: formatTime(windowEnd),
    confidence: lastNap && lastBottle ? 0.82 : 0.66,
    reason: lastNap
      ? "Based on the latest nap and bottle rhythm."
      : "Using the default 6-month wake window until more events are logged."
  };
}
