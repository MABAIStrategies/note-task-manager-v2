import { getBabyStatus } from "../../web/src/agents/nannyBrainAgent";
import { getTenMinuteReset, getSupplyRunout } from "../../web/src/agents/houseFlowAgent";
import type { Briefing } from "../../web/src/lib/types";
import { getCalendarInsights } from "./calendarService";
import { getGmailInsights } from "./gmailService";
import { getRingSummary } from "./ringService";

export function getTodayBriefing(): Briefing {
  return {
    greeting: "Good morning. Tiny chaos, handled.",
    baby: getBabyStatus(),
    houseReset: getTenMinuteReset(),
    supplies: getSupplyRunout(),
    ring: getRingSummary(),
    calendar: getCalendarInsights(),
    gmail: getGmailInsights(),
    evening: {
      dinner: "Easiest available meal, no heroics.",
      show: "SVU comfort episode",
      note: "Keep tonight low-lift unless the nap gods become generous."
    }
  };
}

export function getWeeklyBrief() {
  return {
    title: "This week, with receipts.",
    privacyMode: true,
    calendar: getCalendarInsights(),
    gmail: getGmailInsights(),
    householdLoad: "Two appointment-adjacent tasks, one supply risk, and one laundry trap.",
    recommendation: "Batch errands after the strongest nap window and prep forms before Thursday morning."
  };
}
