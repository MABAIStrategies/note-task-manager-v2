import { Moon } from "lucide-react";
import { PopupCard } from "./PopupCard";
import type { NapPrediction } from "../lib/types";

interface NapPredictionCardProps {
  prediction: NapPrediction;
}

export function NapPredictionCard({ prediction }: NapPredictionCardProps) {
  return (
    <PopupCard title="Nap / feeding prediction">
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-blush p-3 text-rose">
          <Moon className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <p className="text-2xl font-black text-ink">
            {prediction.windowStart} - {prediction.windowEnd}
          </p>
          <p className="mt-2 text-sm leading-6 text-mauve">{prediction.reason}</p>
          <p className="mt-3 text-xs font-bold uppercase tracking-[0.14em] text-rose">{Math.round(prediction.confidence * 100)}% confidence</p>
        </div>
      </div>
    </PopupCard>
  );
}
