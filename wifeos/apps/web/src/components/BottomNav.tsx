import { Baby, Clapperboard, Home, House, Lightbulb, Rabbit, Settings } from "lucide-react";
import type { PageKey } from "../App";

const navItems: Array<{ key: PageKey; label: string; icon: typeof Home }> = [
  { key: "today", label: "Today", icon: Home },
  { key: "baby", label: "Baby", icon: Baby },
  { key: "house", label: "House", icon: House },
  { key: "create", label: "Create", icon: Lightbulb },
  { key: "watch", label: "Watch", icon: Clapperboard },
  { key: "rabbit", label: "Holes", icon: Rabbit },
  { key: "settings", label: "Settings", icon: Settings }
];

interface BottomNavProps {
  current: PageKey;
  onChange: (page: PageKey) => void;
}

export function BottomNav({ current, onChange }: BottomNavProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/70 bg-white/82 px-2 pb-[calc(env(safe-area-inset-bottom)+0.4rem)] pt-2 shadow-[0_-14px_35px_rgba(128,64,86,0.12)] backdrop-blur-xl">
      <div className="mx-auto grid max-w-3xl grid-cols-7 gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = current === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onChange(item.key)}
              className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl px-1 text-[0.68rem] font-bold transition ${
                active ? "bg-rose text-white shadow-soft" : "text-mauve hover:bg-blush"
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
