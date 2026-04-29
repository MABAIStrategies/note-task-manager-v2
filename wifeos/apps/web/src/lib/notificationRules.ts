import type { Priority } from "./types";

export function shouldNotify(priority: Priority, privacyMode: boolean): boolean {
  if (privacyMode) return priority === "high";
  return priority !== "low";
}
