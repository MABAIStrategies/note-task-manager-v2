import { Bell, CalendarDays, Mail, Mic, ShieldCheck, Video, WandSparkles } from "lucide-react";
import { Doodle } from "../components/Doodle";
import { PopupCard } from "../components/PopupCard";
import { SectionHeader } from "../components/SectionHeader";
import { VoiceCommandButton } from "../components/VoiceCommandButton";
import { getFutureImageWorkflow } from "../services/imageWorkflowService";

export function SettingsPage() {
  const imageWorkflow = getFutureImageWorkflow();

  return (
    <div className="space-y-5">
      <SectionHeader title="Settings" subtitle="Privacy first, integrations later, chaos filtered always." action={<VoiceCommandButton />} />
      <div className="grid gap-4 md:grid-cols-2">
        <PopupCard title="Baby profile">
          <p className="text-sm leading-6 text-ink">Luna · 6 months · bottle feeding · routine notes enabled.</p>
        </PopupCard>
        <PopupCard title="Notification rules">
          <div className="flex items-center gap-3 rounded-2xl bg-cream p-4">
            <Bell className="h-5 w-5 text-rose" aria-hidden="true" />
            <p className="text-sm font-semibold text-ink">Helpful-only alerts. Low-priority noise goes into the briefing.</p>
          </div>
        </PopupCard>
      </div>
      <PopupCard title="Privacy controls">
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-sage/15 p-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-sage" aria-hidden="true" />
            <p className="text-sm font-bold text-ink">Private mode on</p>
          </div>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-sage">summaries only</span>
        </div>
      </PopupCard>
      <PopupCard title="Connected devices + context">
        <div className="grid gap-3 md:grid-cols-2">
          {[
            [Mail, "Gmail", "Mock summaries for follow-ups, receipts, appointments, and supplies."],
            [CalendarDays, "Google Calendar", "Mock weekly rhythm, prep windows, and appointment context."],
            [Video, "Ring", "Mock motion summaries and meaningful-alert filtering."],
            [Mic, "Alexa", "Phase 2 voice assistant setup placeholder."],
            [WandSparkles, "Images", `${imageWorkflow.modelPreference}. ${imageWorkflow.note}`]
          ].map(([Icon, title, body]) => {
            const TypedIcon = Icon as typeof Mail;
            return (
              <div key={title as string} className="rounded-2xl bg-cream p-4">
                <TypedIcon className="mb-2 h-5 w-5 text-rose" aria-hidden="true" />
                <p className="font-bold text-ink">{title as string}</p>
                <p className="mt-1 text-sm leading-6 text-mauve">{body as string}</p>
              </div>
            );
          })}
        </div>
      </PopupCard>
      <Doodle kind="sparkle" label="future multimodal era: pending" />
    </div>
  );
}
