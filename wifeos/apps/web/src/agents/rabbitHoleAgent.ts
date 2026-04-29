import type { RabbitHoleResult } from "../lib/types";

export function analyzeRabbitHole(topic: string): RabbitHoleResult {
  const cleanTopic = topic.trim() || "Kardashian media cycles";

  return {
    topic: cleanTopic,
    summary: "A fun pattern board that separates actual receipts from late-night couch math.",
    claims: [
      {
        id: "rc-1",
        claim: "PR timing follows major attention cycles",
        evidence: "Medium",
        counterpoint: "Public schedules and coincidence explain a lot.",
        vibe: "High",
        score: 68,
        sourceUrl: "https://example.com/pr-timing"
      },
      {
        id: "rc-2",
        claim: "Media control is coordinated across outlets",
        evidence: "Low",
        counterpoint: "Shared incentives can look coordinated without a secret room.",
        vibe: "High",
        score: 49
      },
      {
        id: "rc-3",
        claim: "The pattern repeats every launch cycle",
        evidence: "Medium",
        counterpoint: "Launch cycles are designed to repeat by default.",
        vibe: "Medium",
        score: 57
      }
    ],
    weirdnessScore: 74,
    plausibilityScore: 46,
    entertainmentScore: 91,
    verdict: "Fun theory, partly plausible, mostly entertainment. Keep the corkboard, lose the subpoena energy."
  };
}
