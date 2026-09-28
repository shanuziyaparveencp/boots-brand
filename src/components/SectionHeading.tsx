import type { ReactNode } from 'react';
import { cn } from '../lib/format';

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  align?: 'left' | 'center';
  className?: string;
}

export default function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  align = 'left',
  className,
}: SectionHeadingProps) {
  const centered = align === 'center';

  return (
    <div
      className={cn(
        'gap-6',
        centered
          ? 'flex flex-col items-center text-center'
          : 'flex flex-col sm:flex-row sm:items-end sm:justify-between',
        className,
      )}
    >
      <div className={cn(centered && 'max-w-2xl')}>
        {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
        {description && (
          <p
            className={cn(
              'mt-3 text-sm leading-relaxed text-ink/60',
              centered ? 'mx-auto max-w-xl' : 'max-w-xl',
            )}
          >
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
