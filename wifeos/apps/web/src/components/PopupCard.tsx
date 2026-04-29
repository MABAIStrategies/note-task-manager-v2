import type { ReactNode } from "react";

interface PopupCardProps {
  title?: string;
  eyebrow?: string;
  children: ReactNode;
  className?: string;
}

export function PopupCard({ title, eyebrow, children, className = "" }: PopupCardProps) {
  return (
    <section className={`animate-soft-fade rounded-[1.35rem] border border-white/80 bg-white/78 p-5 shadow-popup backdrop-blur ${className}`}>
      {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.14em] text-mauve">{eyebrow}</p> : null}
      {title ? <h2 className="mt-1 text-lg font-bold text-ink">{title}</h2> : null}
      <div className={title || eyebrow ? "mt-4" : ""}>{children}</div>
    </section>
  );
}
