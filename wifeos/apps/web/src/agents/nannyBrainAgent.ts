import { babyEvents } from "../lib/mockData";
import { predictNextNap } from "../lib/napPredictor";
import type { BabyStatus, EventType } from "../lib/types";

export function getBabyStatus(): BabyStatus {
  return {
    name: "Luna",
    ageLabel: "6 months",
    lastBottle: "11:42 AM",
    lastNap: "11:20 AM",
    diaperStatus: "Diapers running low by Friday",
    nextNap: predictNextNap(babyEvents),
    timeline: babyEvents
  };
}

export function addBabyEvent(type: EventType, notes: string): BabyStatus {
  return {
    ...getBabyStatus(),
    timeline: [
      {
        id: `be-${Date.now()}`,
        type,
        timestamp: new Date().toISOString(),
        notes
      },
      ...babyEvents
    ]
  };
}

// Future AI/API note: replace these deterministic mocks with model-assisted routine summaries
// after adding consent, health-data privacy rules, and source attribution.
