import { ShoppingBasket } from "lucide-react";
import { PopupCard } from "./PopupCard";
import type { SupplyItem } from "../lib/types";

interface SupplyTrackerProps {
  supplies: SupplyItem[];
}

export function SupplyTracker({ supplies }: SupplyTrackerProps) {
  return (
    <PopupCard title="Grocery + supply radar">
      <div className="space-y-3">
        {supplies.map((item) => (
          <div key={item.id} className="flex items-center gap-3 rounded-2xl bg-cream p-3">
            <ShoppingBasket className="h-5 w-5 text-rose" aria-hidden="true" />
            <div className="flex-1">
              <p className="font-bold text-ink">{item.name}</p>
              <p className="text-xs text-mauve">{item.currentLevel} · runs out {item.estimatedRunoutDate}</p>
            </div>
          </div>
        ))}
      </div>
    </PopupCard>
  );
}
