import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductFilters from '../components/ProductFilters';
import ProductGrid from '../components/ProductGrid';
import { products } from '../data/products';
import {
  categoryFilters,
  isFilterId,
  isSortId,
  sortProducts,
} from '../data/filters';
import type { FilterId, SortId } from '../data/filters';

export default function Boots() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filterParam = searchParams.get('filter');
  const sortParam = searchParams.get('sort');
  const query = searchParams.get('q')?.trim() ?? '';

  const activeFilter: FilterId = isFilterId(filterParam) ? filterParam : 'all';
  const activeSort: SortId = isSortId(sortParam) ? sortParam : 'featured';

  const visibleProducts = useMemo(() => {
    const matcher = categoryFilters.find((filter) => filter.id === activeFilter);
    const term = query.toLowerCase();

    const filtered = products.filter((product) => {
      const matchesCategory = matcher ? matcher.match(product) : true;
      const matchesQuery =
        term.length === 0 ||
        product.name.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term) ||
        product.material.toLowerCase().includes(term);
      return matchesCategory && matchesQuery;
    });

    return sortProducts(filtered, activeSort);
  }, [activeFilter, activeSort, query]);

  function updateParams(next: Partial<Record<'filter' | 'sort' | 'q', string>>) {
    const params = new URLSearchParams(searchParams);
    Object.entries(next).forEach(([key, value]) => {
      if (!value || value === 'all' || value === 'featured') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    setSearchParams(params, { replace: true });
  }

  return (
    <div className="container-site py-14 sm:py-20">
      <header className="max-w-xl">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Boots</h1>
        <p className="mt-4 text-sm leading-relaxed text-ink/60">
          A small, considered collection — leather lace-ups, Chelsea boots, work boots and trail
          boots, all built to be worn hard and kept for years.
        </p>
      </header>

      {query && (
        <p className="mt-8 text-sm text-ink/60">
          Results for <span className="text-ink">“{query}”</span>{' '}
          <button
            type="button"
            onClick={() => updateParams({ q: '' })}
            className="ml-1 border-b border-ink/30 text-xs uppercase tracking-[0.12em] transition-colors hover:border-ink"
          >
            Clear
          </button>
        </p>
      )}

      <div className="mt-8">
        <ProductFilters
          activeFilter={activeFilter}
          onFilterChange={(filter) => updateParams({ filter })}
          sort={activeSort}
          onSortChange={(sort) => updateParams({ sort })}
          resultCount={visibleProducts.length}
        />
      </div>

      {visibleProducts.length > 0 ? (
        <ProductGrid products={visibleProducts} className="mt-12" />
      ) : (
        <div className="py-24 text-center">
          <p className="text-sm text-ink/60">No boots match this selection.</p>
          <button
            type="button"
            onClick={() => setSearchParams({}, { replace: true })}
            className="btn-secondary mt-6"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
