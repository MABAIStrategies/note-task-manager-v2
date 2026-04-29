import { useState } from "react";
import { Doodle } from "../components/Doodle";
import { CreativeOutputCard } from "../components/CreativeOutputCard";
import { PopupCard } from "../components/PopupCard";
import { SectionHeader } from "../components/SectionHeader";
import { generateMomContent } from "../agents/creatorMomAgent";

export function CreatePage() {
  const [input, setInput] = useState("Baby spit carrots everywhere.");
  const [output, setOutput] = useState(generateMomContent(input));
  const [saved, setSaved] = useState<string[]>([]);

  return (
    <div className="space-y-5">
      <SectionHeader title="Turn today into something creative." subtitle="One moment in, swipeable content cards out." action={<Doodle kind="sparkle" label="content fairy-ish" />} />
      <PopupCard title="Daily moment">
        <textarea value={input} onChange={(event) => setInput(event.target.value)} rows={4} className="w-full resize-none rounded-2xl border border-petal/50 bg-cream px-4 py-3 text-sm leading-6 text-ink" />
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={() => setOutput(generateMomContent(input))} className="rounded-full bg-rose px-5 py-3 text-sm font-black text-white shadow-soft">Generate</button>
          <button type="button" onClick={() => setSaved([output.hook, ...saved])} className="rounded-full bg-ink px-5 py-3 text-sm font-black text-white shadow-soft">Save output</button>
        </div>
      </PopupCard>
      <CreativeOutputCard output={output} />
      <PopupCard title="Creative library">
        {saved.length ? (
          <div className="space-y-3">{saved.map((item, index) => <p key={`${item}-${index}`} className="rounded-2xl bg-cream p-4 text-sm font-semibold text-ink">{item}</p>)}</div>
        ) : (
          <p className="rounded-2xl bg-cream p-4 text-sm text-mauve">Saved hooks and baby book bits will land here.</p>
        )}
      </PopupCard>
    </div>
  );
}
