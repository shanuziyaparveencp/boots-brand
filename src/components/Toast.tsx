import { useEffect } from 'react';
import { Check } from 'lucide-react';

interface ToastProps {
  message: string;
  onDismiss: () => void;
  /** Milliseconds the toast stays on screen. */
  duration?: number;
}

export default function Toast({ message, onDismiss, duration = 3200 }: ToastProps) {
  useEffect(() => {
    const timer = window.setTimeout(onDismiss, duration);
    return () => window.clearTimeout(timer);
  }, [message, duration, onDismiss]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-4 bottom-6 z-50 mx-auto flex max-w-sm items-center gap-3 bg-ink px-5 py-4 text-cream shadow-lg sm:left-auto sm:right-6 sm:mx-0"
    >
      <Check size={17} strokeWidth={2} className="shrink-0" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
