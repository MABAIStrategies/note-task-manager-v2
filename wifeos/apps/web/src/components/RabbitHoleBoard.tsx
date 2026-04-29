import { PlausibilityMeter } from "./PlausibilityMeter";
import { PopupCard } from "./PopupCard";
import type { RabbitHoleResult } from "../lib/types";

interface RabbitHoleBoardProps {
  result: RabbitHoleResult;
}

export function RabbitHoleBoard({ result }: RabbitHoleBoardProps) {
  return (
    <PopupCard title={result.topic} eyebrow="Rabbit Hole Board">
      <p className="text-sm leading-6 text-mauve">{result.summary}</p>
      <div className="mt-4 grid gap-3">
        {result.claims.map((claim) => (
          <article key={claim.id} className="rounded-2xl bg-cream p-4">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-bold text-ink">{claim.claim}</h3>
              <span className="rounded-full bg-blush px-3 py-1 text-xs font-black text-rose">{claim.score}</span>
            </div>
            <p className="mt-2 text-xs font-bold uppercase tracking-[0.12em] text-mauve">Evidence {claim.evidence} · Vibes {claim.vibe}</p>
            <p className="mt-2 text-sm leading-6 text-ink">{claim.counterpoint}</p>
          </article>
        ))}
      </div>
      <div className="mt-5 grid gap-3">
        <PlausibilityMeter label="Weirdness" value={result.weirdnessScore} />
        <PlausibilityMeter label="Plausibility" value={result.plausibilityScore} />
        <PlausibilityMeter label="Entertainment" value={result.entertainmentScore} />
      </div>
      <p className="mt-5 rounded-2xl bg-blush p-4 text-sm font-semibold leading-6 text-ink">{result.verdict}</p>
    </PopupCard>
  );
}
