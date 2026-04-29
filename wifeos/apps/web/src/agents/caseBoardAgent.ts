import { caseBoard } from "../lib/mockData";
import type { CaseBoard } from "../lib/types";

export function getCaseBoard(mood = "comfort drama"): CaseBoard {
  return {
    ...caseBoard,
    mood
  };
}

export function predictEnding(caseName: string): string {
  return `${caseName}: the timeline is lying, the scarf matters, and somebody's phone battery is suspiciously convenient.`;
}
