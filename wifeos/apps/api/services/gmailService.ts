import type { GmailInsight } from "../../web/src/lib/types";

export function getGmailInsights(): GmailInsight[] {
  return [
    {
      id: "gm-1",
      sender: "Pediatric portal",
      category: "appointment",
      summary: "Six-month visit reminder needs forms before Friday.",
      urgency: "high"
    },
    {
      id: "gm-2",
      sender: "Target",
      category: "receipt",
      summary: "Diaper order confirmation suggests the Friday runout is covered if it ships today.",
      urgency: "medium"
    },
    {
      id: "gm-3",
      sender: "Neighborhood group",
      category: "fyi",
      summary: "Street cleaning tomorrow morning. Move the car if needed.",
      urgency: "low"
    }
  ];
}

// Real Gmail integration belongs here later. Keep raw messages server-side and expose only
// privacy-safe summaries to the app.
