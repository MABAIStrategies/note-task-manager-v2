import { addBabyEvent, getBabyStatus } from "../../web/src/agents/nannyBrainAgent";
import type { EventType } from "../../web/src/lib/types";

export function listBabyEvents() {
  return getBabyStatus().timeline;
}

export function createBabyEvent(type: EventType, notes: string) {
  return addBabyEvent(type, notes);
}
