import { Clapperboard, UserRoundSearch } from "lucide-react";
import { Doodle } from "../components/Doodle";
import { PopupCard } from "../components/PopupCard";
import { SectionHeader } from "../components/SectionHeader";
import { getCaseBoard } from "../agents/caseBoardAgent";

export function WatchPage() {
  const board = getCaseBoard();

  return (
    <div className="space-y-5">
      <SectionHeader title="What are we watching?" subtitle="Comfort TV, true crime corkboards, and predictions with the correct amount of drama." action={<Doodle kind="moon" label="couch court" />} />
      <PopupCard title="TV mood picker">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {["Comfort chaos", "Courtroom spiral", "Scandal pace", "Background mystery"].map((mood) => (
            <button key={mood} type="button" className="rounded-2xl bg-cream p-4 text-left text-sm font-bold text-ink transition hover:bg-blush">{mood}</button>
          ))}
        </div>
      </PopupCard>
      <PopupCard title="True crime caseboard">
        <div className="mb-4 flex items-center gap-3 rounded-2xl bg-blush p-4">
          <Clapperboard className="h-5 w-5 text-rose" aria-hidden="true" />
          <p className="font-bold text-ink">{board.showSuggestion}</p>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {board.suspects.map((suspect) => (
            <article key={suspect.name} className="rounded-2xl bg-cream p-4">
              <UserRoundSearch className="mb-2 h-5 w-5 text-rose" aria-hidden="true" />
              <p className="font-bold text-ink">{suspect.name}</p>
              <p className="mt-1 text-sm text-mauve">{suspect.motive}</p>
              <p className="mt-2 text-xs font-black uppercase tracking-[0.14em] text-rose">{suspect.probability}% suspicious</p>
            </article>
          ))}
        </div>
      </PopupCard>
      <PopupCard title="Clues + timeline">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">{board.clues.map((clue) => <p key={clue.clue} className="rounded-2xl bg-cream p-4 text-sm text-ink"><strong>{clue.relevance}:</strong> {clue.clue}</p>)}</div>
          <ol className="space-y-3">{board.timeline.map((item, index) => <li key={item} className="rounded-2xl bg-blush p-4 text-sm font-semibold text-ink">{index + 1}. {item}</li>)}</ol>
        </div>
        <p className="mt-4 rounded-2xl bg-ink p-4 text-sm font-semibold leading-6 text-white">{board.prediction}</p>
      </PopupCard>
    </div>
  );
}
