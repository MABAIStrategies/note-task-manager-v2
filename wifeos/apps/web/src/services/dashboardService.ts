import { getBabyStatus } from "../agents/nannyBrainAgent";
import { getSupplyRunout, getTenMinuteReset } from "../agents/houseFlowAgent";
import { ringEvents } from "../lib/mockData";
import type { Briefing, CalendarInsight, GmailInsight } from "../lib/types";

export const calendarInsights: CalendarInsight[] = [
  { id: "cal-1", title: "Pediatrician forms", window: "Thu, 9:00 AM", summary: "Prep paperwork before the appointment block.", prepHint: "Add insurance card photo and feeding notes." },
  { id: "cal-2", title: "Nap-safe errand window", window: "Wed, 3:45 PM - 4:30 PM", summary: "Best fit after the predicted afternoon nap.", prepHint: "Keep it to one store unless the nap goes long." },
  { id: "cal-3", title: "Weekly reset", window: "Sun, 7:30 PM", summary: "Plan supplies, appointments, laundry, and content ideas.", prepHint: "Use the weekly brief before Sunday night scrolling starts." }
];

export const gmailInsights: GmailInsight[] = [
  { id: "gm-1", sender: "Pediatric portal", category: "appointment", summary: "Six-month visit reminder needs forms before Friday.", urgency: "high" },
  { id: "gm-2", sender: "Target", category: "receipt", summary: "Diaper order confirmation may cover the Friday runout.", urgency: "medium" },
  { id: "gm-3", sender: "Neighborhood group", category: "fyi", summary: "Street cleaning tomorrow morning.", urgency: "low" }
];

export function getWebBriefing(): Briefing {
  return {
    greeting: "Good morning. Tiny chaos, handled.",
    baby: getBabyStatus(),
    houseReset: getTenMinuteReset(),
    supplies: getSupplyRunout(),
    ring: ringEvents,
    calendar: calendarInsights,
    gmail: gmailInsights,
    evening: {
      dinner: "Easiest available meal, no heroics.",
      show: "SVU comfort episode",
      note: "Keep tonight low-lift unless the nap gods become generous."
    }
  };
}
