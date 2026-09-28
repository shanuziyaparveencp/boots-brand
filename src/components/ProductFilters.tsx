import { ChevronDown } from 'lucide-react';
import { categoryFilters, sortOptions } from '../data/filters';
import type { FilterId, SortId } from '../data/filters';
import { cn } from '../lib/format';

interface ProductFiltersProps {
  activeFilter: FilterId;
  onFilterChange: (filter: FilterId) => void;
  sort: SortId;
  onSortChange: (sort: SortId) => void;
  resultCount: number;
}

export default function ProductFilters({
  activeFilter,
  onFilterChange,
  sort,
  onSortChange,
  resultCount,
}: ProductFiltersProps) {
  return (
    <div className="flex flex-col gap-5 border-y border-ink/10 py-4 md:flex-row md:items-center md:justify-between">
      <div className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 md:flex-wrap md:overflow-visible md:pb-0">
        {categoryFilters.map((filter) => (
          <button
            key={filter.id}
            type="button"
            onClick={() => onFilterChange(filter.id)}
            aria-pressed={activeFilter === filter.id}
            className={cn(
              'shrink-0 px-3.5 py-2 text-xs font-medium uppercase tracking-[0.1em] transition-colors',
              activeFilter === filter.id
                ? 'bg-brand text-cream'
                : 'text-ink/55 hover:text-ink',
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between gap-5 md:justify-end">
        <span className="text-xs text-stone">
          {resultCount} {resultCount === 1 ? 'item' : 'items'}
        </span>

        <div className="relative">
          <label htmlFor="sort" className="sr-only">
            Sort products
          </label>
          <select
            id="sort"
            value={sort}
            onChange={(event) => onSortChange(event.target.value as SortId)}
            className="appearance-none border border-ink/15 bg-transparent py-2 pl-3.5 pr-9 text-xs text-ink focus:border-ink focus:outline-none"
          >
            {sortOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            strokeWidth={1.8}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink/50"
          />
        </div>
      </div>
    </div>
  );
}
