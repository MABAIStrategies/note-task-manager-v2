import { useState } from "react";
import { BabyStatusCard } from "../components/BabyStatusCard";
import { Doodle } from "../components/Doodle";
import { NapPredictionCard } from "../components/NapPredictionCard";
import { PopupCard } from "../components/PopupCard";
import { SectionHeader } from "../components/SectionHeader";
import { getBabyStatus } from "../agents/nannyBrainAgent";
import type { EventType } from "../lib/types";

export function BabyPage() {
  const [baby, setBaby] = useState(getBabyStatus());
  const [type, setType] = useState<EventType>("bottle");
  const [notes, setNotes] = useState("Took 6 oz and gave the bottle side-eye.");

  return (
    <div className="space-y-5">
      <SectionHeader title="Baby command center" subtitle="Timeline, prediction, memory capture, and exactly enough context." action={<Doodle kind="bottle" label="tiny boss" />} />
      <BabyStatusCard baby={baby} />
      <NapPredictionCard prediction={baby.nextNap} />
      <PopupCard title="Log an event">
        <div className="grid gap-3 sm:grid-cols-[12rem_1fr_auto]">
          <select value={type} onChange={(event) => setType(event.target.value as EventType)} className="rounded-2xl border border-petal/50 bg-cream px-4 py-3 text-sm font-semibold text-ink">
            {["bottle", "nap", "diaper", "food", "milestone", "medicine"].map((option) => <option key={option}>{option}</option>)}
          </select>
          <input value={notes} onChange={(event) => setNotes(event.target.value)} className="rounded-2xl border border-petal/50 bg-cream px-4 py-3 text-sm text-ink" />
          <button type="button" onClick={() => setBaby({ ...baby, timeline: [{ id: crypto.randomUUID(), type, notes, timestamp: new Date().toISOString() }, ...baby.timeline] })} className="rounded-2xl bg-rose px-5 py-3 text-sm font-black text-white shadow-soft">Add</button>
        </div>
      </PopupCard>
      <PopupCard title="Timeline">
        <div className="space-y-3">
          {baby.timeline.map((event) => (
            <div key={event.id} className="rounded-2xl bg-cream p-4">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-rose">{event.type}</p>
              <p className="mt-1 text-sm font-semibold text-ink">{event.notes}</p>
            </div>
          ))}
        </div>
      </PopupCard>
      <PopupCard title="Memory capture">
        <div className="rounded-2xl border border-dashed border-petal bg-blush/50 p-5 text-sm leading-6 text-mauve">
          Baby photo / note placeholder. Later this becomes a multimodal memory book workflow with generated images and edits.
        </div>
      </PopupCard>
    </div>
  );
}
