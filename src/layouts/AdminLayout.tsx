import { Link, NavLink, Navigate, Outlet, useLocation } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { cn } from '../lib/format';

/** Wraps every /admin route except the login page. */
export default function AdminLayout() {
  const { session, loading, signOut } = useAdminAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <p className="text-sm text-ink/50">Loading…</p>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <header className="sticky top-0 z-40 bg-brand text-cream">
        <div className="container-site flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link to="/admin/orders" className="shrink-0">
              <img
                src="/images/logo.png"
                alt="Boots Hyper Market"
                width={936}
                height={400}
                className="h-8 w-auto"
              />
            </Link>
            <nav aria-label="Admin" className="flex items-center gap-6">
              {[
                { to: '/admin/orders', label: 'Orders' },
                { to: '/admin/products', label: 'Products' },
              ].map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    cn(
                      'text-sm transition-colors hover:text-cream',
                      isActive ? 'text-cream' : 'text-cream/70',
                    )
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden text-xs text-cream/60 sm:block">{session.user.email}</span>
            <button
              type="button"
              onClick={() => void signOut()}
              className="flex items-center gap-2 border border-cream/25 px-3 py-2 text-xs uppercase tracking-[0.12em] text-cream/80 transition-colors hover:border-cream/60 hover:text-cream"
            >
              <LogOut size={14} strokeWidth={1.8} />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-ink/10 py-5">
        <div className="container-site flex flex-wrap items-center justify-between gap-2 text-xs text-ink/45">
          <span>Boots Hyper Market — admin</span>
          <Link to="/" className="transition-colors hover:text-ink">
            View shop
          </Link>
        </div>
      </footer>
    </div>
  );
}
