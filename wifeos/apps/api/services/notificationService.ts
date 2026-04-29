import { shouldNotify } from "../../web/src/lib/notificationRules";
import type { Priority } from "../../web/src/lib/types";

export function evaluateNotification(priority: Priority, privacyMode = true) {
  return {
    priority,
    privacyMode,
    shouldNotify: shouldNotify(priority, privacyMode)
  };
}
