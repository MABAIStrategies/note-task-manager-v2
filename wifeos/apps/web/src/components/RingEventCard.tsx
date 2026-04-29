import { Camera } from "lucide-react";
import { PopupCard } from "./PopupCard";
import type { RingEvent } from "../lib/types";

interface RingEventCardProps {
  events: RingEvent[];
}

export function RingEventCard({ events }: RingEventCardProps) {
  return (
    <PopupCard title="Ring">
      {events.map((event) => (
        <div key={event.id} className="flex items-start gap-3 rounded-2xl bg-blush/70 p-3">
          <Camera className="mt-0.5 h-5 w-5 text-rose" aria-hidden="true" />
          <div>
            <p className="font-semibold text-ink">{event.summary}</p>
            <p className="mt-1 text-xs text-mauve">{event.alertSent ? "Alert sent" : "Quietly added to briefing"}</p>
          </div>
        </div>
      ))}
    </PopupCard>
  );
}
