import { CheckCircle2 } from "lucide-react";
import { PopupCard } from "./PopupCard";
import type { HouseTask } from "../lib/types";

interface HouseResetCardProps {
  tasks: HouseTask[];
}

export function HouseResetCard({ tasks }: HouseResetCardProps) {
  return (
    <PopupCard title="10-minute reset" eyebrow="House">
      <ol className="space-y-3">
        {tasks.map((task, index) => (
          <li key={task.id} className="flex items-center gap-3 rounded-2xl bg-cream p-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rose text-xs font-black text-white">{index + 1}</span>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-ink">{task.taskName}</p>
              <p className="text-xs text-mauve">{task.room} · {task.estimatedMinutes} min</p>
            </div>
            <CheckCircle2 className="h-5 w-5 text-sage" aria-hidden="true" />
          </li>
        ))}
      </ol>
    </PopupCard>
  );
}
