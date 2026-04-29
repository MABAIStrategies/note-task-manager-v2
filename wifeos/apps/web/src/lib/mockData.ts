import type { BabyEvent, CaseBoard, HouseTask, RingEvent, SupplyItem } from "./types";

export const babyEvents: BabyEvent[] = [
  { id: "be-1", type: "bottle", timestamp: "2026-04-29T11:42:00-04:00", notes: "6 oz, calm finish." },
  { id: "be-2", type: "diaper", timestamp: "2026-04-29T12:15:00-04:00", notes: "Normal diaper." },
  { id: "be-3", type: "food", timestamp: "2026-04-29T12:32:00-04:00", notes: "Carrots were rejected with flair." },
  { id: "be-4", type: "nap", timestamp: "2026-04-29T11:20:00-04:00", notes: "42 minute crib nap." }
];

export const houseTasks: HouseTask[] = [
  { id: "ht-1", room: "Kitchen", taskName: "Bottles", priority: "high", estimatedMinutes: 4, status: "queued", dueDate: "2026-04-29" },
  { id: "ht-2", room: "Kitchen", taskName: "Counters", priority: "medium", estimatedMinutes: 3, status: "queued", dueDate: "2026-04-29" },
  { id: "ht-3", room: "Laundry", taskName: "Transfer towels", priority: "medium", estimatedMinutes: 3, status: "doing", dueDate: "2026-04-29" },
  { id: "ht-4", room: "Nursery", taskName: "Restock diapers", priority: "high", estimatedMinutes: 5, status: "queued", dueDate: "2026-04-30" }
];

export const supplies: SupplyItem[] = [
  { id: "s-1", name: "Diapers", category: "Baby", currentLevel: "Low", estimatedRunoutDate: "Friday", reorderUrl: "https://example.com/diapers" },
  { id: "s-2", name: "Wipes", category: "Baby", currentLevel: "Okay", estimatedRunoutDate: "Next Tuesday" },
  { id: "s-3", name: "Coffee pods", category: "Kitchen", currentLevel: "Dangerously emotional", estimatedRunoutDate: "Tomorrow" }
];

export const ringEvents: RingEvent[] = [
  { id: "r-1", eventType: "porch_motion", timestamp: "2026-04-29T10:18:00-04:00", summary: "Porch motion: one event, no package confirmed.", alertSent: false }
];

export const caseBoard: CaseBoard = {
  mood: "Comfort drama",
  showSuggestion: "SVU comfort episode with a side of Scandal-level pacing",
  suspects: [
    { name: "The too-helpful neighbor", motive: "Knows every shortcut", probability: 42 },
    { name: "The quiet intern", motive: "Calendar looked suspicious", probability: 28 },
    { name: "The rich ex", motive: "Always arrives with receipts", probability: 61 }
  ],
  clues: [
    { clue: "Security footage skips at 8:03 PM", relevance: "High" },
    { clue: "A missing scarf is mentioned twice", relevance: "Medium" },
    { clue: "Everyone says they were making tea", relevance: "Unhinged" }
  ],
  timeline: ["Cold open chaos", "Detectives ask one too many casual questions", "The alibi collapses", "Final look says everything"],
  prediction: "The person who seemed least dramatic is absolutely the problem."
};
