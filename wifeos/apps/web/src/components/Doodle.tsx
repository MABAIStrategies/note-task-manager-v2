import { Baby, CalendarX2, Coffee, Moon, Sparkles } from "lucide-react";

type DoodleKind = "moon" | "coffee" | "bottle" | "sparkle" | "calendar";

interface DoodleProps {
  kind: DoodleKind;
  label?: string;
  className?: string;
}

const icons = {
  moon: Moon,
  coffee: Coffee,
  bottle: Baby,
  sparkle: Sparkles,
  calendar: CalendarX2
};

export function Doodle({ kind, label, className = "" }: DoodleProps) {
  const Icon = icons[kind];

  return (
    <div className={`inline-flex items-center gap-2 rounded-full border border-rose/20 bg-blush/70 px-3 py-2 text-xs font-semibold text-mauve shadow-soft ${className}`}>
      <Icon className="h-4 w-4 animate-doodle-wiggle" aria-hidden="true" />
      {label ? <span>{label}</span> : null}
    </div>
  );
}
