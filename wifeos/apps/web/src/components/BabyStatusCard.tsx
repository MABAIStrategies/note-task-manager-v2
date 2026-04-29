import { Baby, Droplets, Milk } from "lucide-react";
import { PopupCard } from "./PopupCard";
import type { BabyStatus } from "../lib/types";

interface BabyStatusCardProps {
  baby: BabyStatus;
}

export function BabyStatusCard({ baby }: BabyStatusCardProps) {
  return (
    <PopupCard title={`${baby.name} is ${baby.ageLabel}`} eyebrow="Baby">
      <div className="grid gap-3 text-sm text-ink">
        <div className="flex items-center gap-3 rounded-2xl bg-blush/70 p-3">
          <Baby className="h-5 w-5 text-rose" aria-hidden="true" />
          <span>Next likely nap: {baby.nextNap.windowStart} - {baby.nextNap.windowEnd}</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-cream p-3">
            <Milk className="mb-2 h-4 w-4 text-mauve" aria-hidden="true" />
            <p className="text-xs font-bold text-mauve">Last bottle</p>
            <p className="font-semibold">{baby.lastBottle}</p>
          </div>
          <div className="rounded-2xl bg-cream p-3">
            <Droplets className="mb-2 h-4 w-4 text-mauve" aria-hidden="true" />
            <p className="text-xs font-bold text-mauve">Diapers</p>
            <p className="font-semibold">{baby.diaperStatus}</p>
          </div>
        </div>
      </div>
    </PopupCard>
  );
}
