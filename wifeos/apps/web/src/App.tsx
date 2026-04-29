import { useMemo, useState } from "react";
import { BottomNav } from "./components/BottomNav";
import { Doodle } from "./components/Doodle";
import { BabyPage } from "./pages/BabyPage";
import { CreatePage } from "./pages/CreatePage";
import { HousePage } from "./pages/HousePage";
import { RabbitHolePage } from "./pages/RabbitHolePage";
import { SettingsPage } from "./pages/SettingsPage";
import { TodayPage } from "./pages/TodayPage";
import { WatchPage } from "./pages/WatchPage";

export type PageKey = "today" | "baby" | "house" | "create" | "watch" | "rabbit" | "settings";

export default function App() {
  const [page, setPage] = useState<PageKey>("today");

  const content = useMemo(() => {
    switch (page) {
      case "baby":
        return <BabyPage />;
      case "house":
        return <HousePage />;
      case "create":
        return <CreatePage />;
      case "watch":
        return <WatchPage />;
      case "rabbit":
        return <RabbitHolePage />;
      case "settings":
        return <SettingsPage />;
      case "today":
      default:
        return <TodayPage />;
    }
  }, [page]);

  return (
    <div className="min-h-screen pb-28 text-ink">
      <header className="sticky top-0 z-30 border-b border-white/70 bg-cream/75 px-4 py-3 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <button type="button" onClick={() => setPage("today")} className="flex items-center gap-3 rounded-full px-1 py-1 text-left">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose text-lg font-black text-white shadow-soft">W</span>
            <span>
              <span className="block text-base font-black leading-5 text-ink">WifeOS</span>
              <span className="block text-xs font-semibold text-mauve">personal assistant mode</span>
            </span>
          </button>
          <Doodle kind="calendar" label="nope, but organized" className="hidden sm:inline-flex" />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-5 sm:px-6 lg:px-8">
        <div key={page} className="animate-sheet-up">
          {content}
        </div>
      </main>
      <BottomNav current={page} onChange={setPage} />
    </div>
  );
}
