import { Minus, Plus } from 'lucide-react';

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label?: string;
}

export default function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 10,
  label = 'Quantity',
}: QuantityStepperProps) {
  return (
    <div className="inline-flex items-center border border-ink/15">
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        className="px-3 py-2.5 text-ink/70 transition-colors hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
        aria-label={`Decrease ${label.toLowerCase()}`}
      >
        <Minus size={14} strokeWidth={1.8} />
      </button>
      <span className="min-w-[2.5rem] text-center text-sm tabular-nums" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        className="px-3 py-2.5 text-ink/70 transition-colors hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
        aria-label={`Increase ${label.toLowerCase()}`}
      >
        <Plus size={14} strokeWidth={1.8} />
      </button>
    </div>
  );
}
