import { ImagePlus, WandSparkles } from "lucide-react";
import { PopupCard } from "./PopupCard";
import type { CreativeOutput } from "../lib/types";

interface CreativeOutputCardProps {
  output: CreativeOutput;
}

export function CreativeOutputCard({ output }: CreativeOutputCardProps) {
  return (
    <PopupCard title="Generated cards">
      <div className="flex snap-x gap-4 overflow-x-auto pb-2">
        {[
          ["TikTok Hook", output.hook],
          ["Caption", output.caption],
          ["Baby Book Entry", output.babyBookEntry],
          ["Monetization Ideas", output.monetizationIdeas.join(" ")]
        ].map(([title, body]) => (
          <article key={title} className="min-w-[82%] snap-center rounded-[1.15rem] bg-cream p-4 shadow-soft sm:min-w-[18rem]">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-rose">{title}</p>
            <p className="mt-3 text-sm leading-6 text-ink">{body}</p>
          </article>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <button type="button" disabled className="inline-flex items-center gap-2 rounded-full bg-blush px-3 py-2 text-xs font-bold text-mauve opacity-70">
          <ImagePlus className="h-4 w-4" aria-hidden="true" />
          Image idea soon
        </button>
        <button type="button" disabled className="inline-flex items-center gap-2 rounded-full bg-blush px-3 py-2 text-xs font-bold text-mauve opacity-70">
          <WandSparkles className="h-4 w-4" aria-hidden="true" />
          Edit later
        </button>
      </div>
    </PopupCard>
  );
}
