interface PlausibilityMeterProps {
  label: string;
  value: number;
}

export function PlausibilityMeter({ label, value }: PlausibilityMeterProps) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs font-bold text-mauve">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-blush">
        <div className="h-full rounded-full bg-gradient-to-r from-rose to-petal" style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
    </div>
  );
}
