import { Shirt, TimerReset } from "lucide-react";
import { Doodle } from "../components/Doodle";
import { HouseResetCard } from "../components/HouseResetCard";
import { PopupCard } from "../components/PopupCard";
import { SectionHeader } from "../components/SectionHeader";
import { SupplyTracker } from "../components/SupplyTracker";
import { getTenMinuteReset, getSupplyRunout } from "../agents/houseFlowAgent";
import { houseTasks } from "../lib/mockData";

export function HousePage() {
  return (
    <div className="space-y-5">
      <SectionHeader title="House, but make it survivable" subtitle="Tiny reset plans and supply warnings that do not require becoming a different person." action={<Doodle kind="sparkle" label="bare minimum magic" />} />
      <HouseResetCard tasks={getTenMinuteReset()} />
      <PopupCard title="Room-by-room list">
        <div className="grid gap-3 md:grid-cols-2">
          {houseTasks.map((task) => (
            <div key={task.id} className="rounded-2xl bg-cream p-4">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-rose">{task.room}</p>
              <p className="mt-1 font-bold text-ink">{task.taskName}</p>
              <p className="mt-1 text-sm text-mauve">{task.estimatedMinutes} min · {task.priority}</p>
            </div>
          ))}
        </div>
      </PopupCard>
      <PopupCard title="Laundry reminder">
        <div className="flex items-center gap-3 rounded-2xl bg-blush p-4">
          <Shirt className="h-6 w-6 text-rose" aria-hidden="true" />
          <p className="text-sm font-semibold leading-6 text-ink">Transfer towels before they become a smell-based side quest.</p>
        </div>
      </PopupCard>
      <SupplyTracker supplies={getSupplyRunout()} />
      <PopupCard title="Reset generator">
        <button type="button" className="inline-flex items-center gap-2 rounded-full bg-rose px-5 py-3 text-sm font-black text-white shadow-soft">
          <TimerReset className="h-4 w-4" aria-hidden="true" />
          Generate another 10-minute reset
        </button>
      </PopupCard>
    </div>
  );
}
