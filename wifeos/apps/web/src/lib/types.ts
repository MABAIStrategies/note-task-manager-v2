export type EventType = "nap" | "bottle" | "diaper" | "food" | "milestone" | "medicine";
export type TaskStatus = "queued" | "doing" | "done";
export type Priority = "low" | "medium" | "high";

export interface BabyEvent {
  id: string;
  type: EventType;
  timestamp: string;
  notes: string;
  mediaUrl?: string;
}

export interface NapPrediction {
  windowStart: string;
  windowEnd: string;
  confidence: number;
  reason: string;
}

export interface BabyStatus {
  name: string;
  ageLabel: string;
  lastBottle: string;
  lastNap: string;
  diaperStatus: string;
  nextNap: NapPrediction;
  timeline: BabyEvent[];
}

export interface HouseTask {
  id: string;
  room: string;
  taskName: string;
  priority: Priority;
  estimatedMinutes: number;
  status: TaskStatus;
  dueDate: string;
}

export interface SupplyItem {
  id: string;
  name: string;
  category: string;
  currentLevel: string;
  estimatedRunoutDate: string;
  reorderUrl?: string;
}

export interface CreativeOutput {
  hook: string;
  caption: string;
  babyBookEntry: string;
  monetizationIdeas: string[];
}

export interface RabbitClaim {
  id: string;
  claim: string;
  evidence: "Low" | "Medium" | "High";
  counterpoint: string;
  vibe: "Low" | "Medium" | "High";
  score: number;
  sourceUrl?: string;
}

export interface RabbitHoleResult {
  topic: string;
  summary: string;
  claims: RabbitClaim[];
  weirdnessScore: number;
  plausibilityScore: number;
  entertainmentScore: number;
  verdict: string;
}

export interface RingEvent {
  id: string;
  eventType: string;
  timestamp: string;
  summary: string;
  imageUrl?: string;
  alertSent: boolean;
}

export interface CalendarInsight {
  id: string;
  title: string;
  window: string;
  summary: string;
  prepHint: string;
}

export interface GmailInsight {
  id: string;
  sender: string;
  category: "follow-up" | "receipt" | "appointment" | "supply" | "fyi";
  summary: string;
  urgency: Priority;
}

export interface Briefing {
  greeting: string;
  baby: BabyStatus;
  houseReset: HouseTask[];
  supplies: SupplyItem[];
  ring: RingEvent[];
  calendar: CalendarInsight[];
  gmail: GmailInsight[];
  evening: {
    dinner: string;
    show: string;
    note: string;
  };
}

export interface CaseBoard {
  mood: string;
  showSuggestion: string;
  suspects: Array<{ name: string; motive: string; probability: number }>;
  clues: Array<{ clue: string; relevance: string }>;
  timeline: string[];
  prediction: string;
}
