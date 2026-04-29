import { houseTasks, supplies } from "../lib/mockData";
import type { HouseTask, SupplyItem } from "../lib/types";

export function getTenMinuteReset(tasks: HouseTask[] = houseTasks): HouseTask[] {
  const ordered = [...tasks].sort((a, b) => {
    const priorityRank = { high: 0, medium: 1, low: 2 };
    return priorityRank[a.priority] - priorityRank[b.priority] || a.estimatedMinutes - b.estimatedMinutes;
  });

  const reset: HouseTask[] = [];
  let minutes = 0;
  for (const task of ordered) {
    if (minutes + task.estimatedMinutes <= 10) {
      reset.push(task);
      minutes += task.estimatedMinutes;
    }
  }
  return reset;
}

export function getSupplyRunout(): SupplyItem[] {
  return supplies;
}

// Future notification note: this is where push/email/SMS rules can choose whether a supply
// warning is useful enough to interrupt the day.
