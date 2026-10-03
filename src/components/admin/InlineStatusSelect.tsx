import { useState } from 'react';
import { Check, ChevronDown, Loader2 } from 'lucide-react';
import { cn } from '../../lib/format';

interface InlineStatusSelectProps<T extends string> {
  value: T;
  options: readonly T[];
  onChange: (next: T) => Promise<void>;
  label: string;
  /** Tailwind classes per value, so the control keeps the badge colouring. */
  tones: Record<T, string>;
}

/**
 * A status badge that doubles as a dropdown, so the admin can change an order
 * straight from the list without opening it. Saves on change and shows a tick
 * briefly on success.
 */
export default function InlineStatusSelect<T extends string>({
  value,
  options,
  onChange,
  label,
  tones,
}: InlineStatusSelectProps<T>) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [failed, setFailed] = useState(false);

  async function handleChange(next: T) {
    if (next === value || saving) return;
    setSaving(true);
    setFailed(false);
    try {
      await onChange(next);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2000);
    } catch {
      setFailed(true);
      window.setTimeout(() => setFailed(false), 4000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="relative inline-block">
        <label className="sr-only" htmlFor={`${label}-${value}`}>
          {label}
        </label>
        <select
          id={`${label}-${value}`}
          value={value}
          disabled={saving}
          onChange={(e) => void handleChange(e.target.value as T)}
          aria-label={label}
          className={cn(
            'cursor-pointer appearance-none py-1 pl-2.5 pr-7 text-[10px] font-semibold uppercase tracking-[0.1em]',
            'focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-1 disabled:opacity-60',
            tones[value],
            failed && 'ring-2 ring-brand',
          )}
        >
          {options.map((option) => (
            <option key={option} value={option} className="bg-cream text-ink">
              {option}
            </option>
          ))}
        </select>
        <ChevronDown
          size={11}
          strokeWidth={2.4}
          className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 opacity-70"
        />
      </span>

      {saving && <Loader2 size={12} strokeWidth={2} className="animate-spin text-ink/40" />}
      {saved && <Check size={12} strokeWidth={2.4} className="text-ink/50" />}
      {failed && <span className="text-[10px] text-brand">failed</span>}
    </span>
  );
}
