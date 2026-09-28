import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Menu, Search, ShoppingBag, X } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { cn } from '../lib/format';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/shop', label: 'Shop' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export default function Header() {
  const { itemCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // Close both panels on navigation.
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  // Prevent the page behind the mobile menu from scrolling.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const term = query.trim();
    navigate(term ? `/shop?q=${encodeURIComponent(term)}` : '/shop');
    setQuery('');
    setSearchOpen(false);
    setMenuOpen(false);
  }

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'text-sm transition-colors hover:text-cream',
      isActive ? 'text-cream' : 'text-cream/70',
    );

  return (
    <header className="sticky top-0 z-50 bg-brand text-cream">
      <div className="container-site flex h-16 items-center justify-between gap-6 sm:h-[72px]">
        <Link to="/" aria-label="Boots Hyper Market — home" className="shrink-0">
          <img
            src="/images/logo.png"
            alt="Boots Hyper Market"
            width={936}
            height={400}
            className="h-10 w-auto sm:h-11"
          />
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.to === '/'} className={navLinkClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setSearchOpen((open) => !open)}
            className="hidden p-2.5 text-cream/80 transition-colors hover:text-cream md:block"
            aria-label={searchOpen ? 'Close search' : 'Search products'}
            aria-expanded={searchOpen}
          >
            {searchOpen ? <X size={19} strokeWidth={1.6} /> : <Search size={19} strokeWidth={1.6} />}
          </button>

          <Link
            to="/cart"
            className="relative p-2.5 text-cream/80 transition-colors hover:text-cream"
            aria-label={`Cart, ${itemCount} item${itemCount === 1 ? '' : 's'}`}
          >
            <ShoppingBag size={19} strokeWidth={1.6} />
            {itemCount > 0 && (
              <span className="absolute right-0 top-0 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-cream px-1 text-[10px] font-semibold text-brand">
                {itemCount}
              </span>
            )}
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="p-2.5 text-cream/80 transition-colors hover:text-cream md:hidden"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={20} strokeWidth={1.6} /> : <Menu size={20} strokeWidth={1.6} />}
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="hidden border-t border-cream/15 md:block">
          <form onSubmit={handleSearch} className="container-site flex items-center gap-3 py-3">
            <Search size={17} strokeWidth={1.6} className="shrink-0 text-cream/60" />
            <input
              ref={searchInputRef}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search footwear, bags and trolleys"
              className="w-full bg-transparent py-1 text-sm text-cream placeholder:text-cream/50 focus:outline-none"
              aria-label="Search products"
            />
            <button type="submit" className="text-xs font-semibold uppercase tracking-[0.14em]">
              Search
            </button>
          </form>
        </div>
      )}

      {menuOpen && (
        <div className="border-t border-cream/15 md:hidden">
          <nav className="container-site flex flex-col py-2" aria-label="Mobile">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'border-b border-cream/10 py-3.5 text-sm transition-colors last:border-0',
                    isActive ? 'text-cream' : 'text-cream/70',
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
            <form onSubmit={handleSearch} className="flex items-center gap-3 py-3">
              <Search size={17} strokeWidth={1.6} className="shrink-0 text-cream/60" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search products"
                className="w-full bg-transparent py-1 text-sm text-cream placeholder:text-cream/50 focus:outline-none"
                aria-label="Search products"
              />
            </form>
          </nav>
        </div>
      )}
    </header>
  );
}
