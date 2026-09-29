import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductFilters from '../components/ProductFilters';
import ProductGrid from '../components/ProductGrid';
import { useCatalog } from '../hooks/useCatalog';
import { categoryFilters, isFilterId, isSortId, sortProducts } from '../data/filters';
import type { FilterId, SortId } from '../data/filters';

export default function Shop() {
  const { products, loading } = useCatalog();
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
        product.material.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term) ||
        product.department.toLowerCase().includes(term);
      return matchesCategory && matchesQuery;
    });

    return sortProducts(filtered, activeSort);
  }, [products, activeFilter, activeSort, query]);

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
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Shop</h1>
        <p className="mt-4 text-sm leading-relaxed text-ink/60">
          Everything we stock in one place — boots, sneakers, formal shoes and sandals, alongside
          backpacks, handbags and a full range of travel trolleys.
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
      ) : loading ? (
        <p className="py-24 text-center text-sm text-ink/50">Loading products…</p>
      ) : (
        <div className="py-24 text-center">
          <p className="text-sm text-ink/60">Nothing matches this selection.</p>
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
