import { ringEvents } from "../../web/src/lib/mockData";

export function getRingSummary() {
  return ringEvents;
}

// Real Ring integration later: classify motion events server-side and only alert on meaningful changes.
