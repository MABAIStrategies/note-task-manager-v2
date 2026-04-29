import { useState } from "react";
import { Doodle } from "../components/Doodle";
import { PopupCard } from "../components/PopupCard";
import { RabbitHoleBoard } from "../components/RabbitHoleBoard";
import { SectionHeader } from "../components/SectionHeader";
import { analyzeRabbitHole } from "../agents/rabbitHoleAgent";

export function RabbitHolePage() {
  const [topic, setTopic] = useState("Kardashian media cycles");
  const [result, setResult] = useState(analyzeRabbitHole(topic));

  return (
    <div className="space-y-5">
      <SectionHeader title="Rabbit Hole Board" subtitle="Claims on one side, vibes on the other, dignity somewhere offscreen." action={<Doodle kind="calendar" label="nope" />} />
      <PopupCard title="Topic">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <input value={topic} onChange={(event) => setTopic(event.target.value)} className="rounded-2xl border border-petal/50 bg-cream px-4 py-3 text-sm text-ink" />
          <button type="button" onClick={() => setResult(analyzeRabbitHole(topic))} className="rounded-2xl bg-rose px-5 py-3 text-sm font-black text-white shadow-soft">Map it</button>
        </div>
      </PopupCard>
      <RabbitHoleBoard result={result} />
    </div>
  );
}
