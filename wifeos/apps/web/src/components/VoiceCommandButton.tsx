import { Mic } from "lucide-react";

export function VoiceCommandButton() {
  return (
    <button type="button" className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-bold text-white shadow-soft">
      <Mic className="h-4 w-4" aria-hidden="true" />
      Voice soon
    </button>
  );
}
