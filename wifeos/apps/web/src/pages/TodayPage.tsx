import { CalendarDays, MailCheck, ShieldCheck, Utensils } from "lucide-react";
import { BabyStatusCard } from "../components/BabyStatusCard";
import { Doodle } from "../components/Doodle";
import { HouseResetCard } from "../components/HouseResetCard";
import { PopupCard } from "../components/PopupCard";
import { RingEventCard } from "../components/RingEventCard";
import { SectionHeader } from "../components/SectionHeader";
import { SupplyTracker } from "../components/SupplyTracker";
import { getWebBriefing } from "../services/dashboardService";

export function TodayPage() {
  const briefing = getWebBriefing();

  return (
    <div className="space-y-5">
      <SectionHeader title={briefing.greeting} subtitle="One calm focus card, then the rest can wait its turn." action={<Doodle kind="coffee" label="still warm-ish" />} />
      <BabyStatusCard baby={briefing.baby} />
      <div className="flex snap-x gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:overflow-visible">
        <div className="min-w-[88%] snap-center md:min-w-0"><HouseResetCard tasks={briefing.houseReset} /></div>
        <div className="min-w-[88%] snap-center md:min-w-0"><RingEventCard events={briefing.ring} /></div>
        <div className="min-w-[88%] snap-center md:min-w-0"><SupplyTracker supplies={briefing.supplies} /></div>
      </div>
      <PopupCard title="This week, with receipts" eyebrow="Gmail + Calendar">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-sage/15 px-3 py-2 text-xs font-bold text-sage">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          Private mode on
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {briefing.calendar.slice(0, 2).map((item) => (
            <div key={item.id} className="rounded-2xl bg-cream p-4">
              <CalendarDays className="mb-2 h-5 w-5 text-rose" aria-hidden="true" />
              <p className="font-bold text-ink">{item.title}</p>
              <p className="text-xs font-semibold text-mauve">{item.window}</p>
              <p className="mt-2 text-sm leading-6 text-ink">{item.prepHint}</p>
            </div>
          ))}
          {briefing.gmail.slice(0, 2).map((item) => (
            <div key={item.id} className="rounded-2xl bg-cream p-4">
              <MailCheck className="mb-2 h-5 w-5 text-rose" aria-hidden="true" />
              <p className="font-bold text-ink">{item.sender}</p>
              <p className="text-xs font-semibold capitalize text-mauve">{item.category} · {item.urgency}</p>
              <p className="mt-2 text-sm leading-6 text-ink">{item.summary}</p>
            </div>
          ))}
        </div>
      </PopupCard>
      <PopupCard title="Tonight">
        <div className="flex items-start gap-3">
          <Utensils className="mt-1 h-5 w-5 text-rose" aria-hidden="true" />
          <div className="space-y-2 text-sm leading-6 text-ink">
            <p><strong>Dinner:</strong> {briefing.evening.dinner}</p>
            <p><strong>Show:</strong> {briefing.evening.show}</p>
            <p className="text-mauve">{briefing.evening.note}</p>
          </div>
        </div>
      </PopupCard>
    </div>
  );
}
