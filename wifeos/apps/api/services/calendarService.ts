import type { CalendarInsight } from "../../web/src/lib/types";

export function getCalendarInsights(): CalendarInsight[] {
  return [
    {
      id: "cal-1",
      title: "Pediatrician forms",
      window: "Thu, 9:00 AM",
      summary: "Prep paperwork before the appointment block.",
      prepHint: "Add insurance card photo and feeding notes."
    },
    {
      id: "cal-2",
      title: "Nap-safe errand window",
      window: "Wed, 3:45 PM - 4:30 PM",
      summary: "Best fit after the predicted afternoon nap.",
      prepHint: "Keep it to one store unless the nap goes long."
    },
    {
      id: "cal-3",
      title: "Weekly reset",
      window: "Sun, 7:30 PM",
      summary: "Plan supplies, appointments, laundry, and content ideas.",
      prepHint: "Use the weekly brief before Sunday night scrolling starts."
    }
  ];
}

// Real Google Calendar integration belongs here later with explicit date ranges,
// timezone handling, and no calendar writes without confirmation.
