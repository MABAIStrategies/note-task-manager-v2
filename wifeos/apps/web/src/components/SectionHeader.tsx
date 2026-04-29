import type { ReactNode } from "react";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function SectionHeader({ title, subtitle, action }: SectionHeaderProps) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-black leading-tight text-ink sm:text-3xl">{title}</h1>
        {subtitle ? <p className="mt-2 max-w-xl text-sm leading-6 text-mauve">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}
